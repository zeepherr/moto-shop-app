"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { MAX_OTP_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/features/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/features/auth/services/cookie.service";
import { createAuthSession } from "@/features/auth/services/auth.service";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "@/features/auth/services/token.service";
import { adminPasswordChangeOtpSchema, adminPasswordChangeSchema } from "@/features/auth/schemas";
import { generateOtp, hashOtp, sendStaffPasswordOtpEmail } from "@/features/auth/services/otp.service";
import { db } from "@/lib/db";
import {
  changeStaffPasswordWithCurrentPassword,
  claimStaffPasswordChangeOtp,
  completeStaffPasswordChangeWithOtp,
  findStaffPasswordChangeOtp,
  incrementStaffPasswordChangeOtpAttempts,
  removeStaffPasswordChangeOtp,
} from "../services/staff-password.service";

const issueFreshStaffSession = async (userId: number) => {
  const staff = await db.user.findFirst({
    where: { id: userId, role: UserRole.STAFF, isActive: true },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
  if (!staff) return false;

  const refreshToken = createRefreshToken();
  const session = await createAuthSession(staff.id, hashRefreshToken(refreshToken));
  const accessToken = await createAccessToken({
    sessionId: session.id,
    userId: staff.id,
    email: staff.email ?? "",
    role: staff.role,
    firstName: staff.firstName,
    lastName: staff.lastName,
  });
  await setAuthCookies(accessToken, refreshToken);
  return true;
};

const restoreStaffSession = async (userId: number) => {
  try {
    await clearAuthCookies();
    if (await issueFreshStaffSession(userId)) return true;
  } catch {
    // The password is already changed; continue to a clean sign-in state.
  }
  await clearAuthCookies();
  return false;
};

const passwordChangedResult = async (userId: number) => {
  const restored = await restoreStaffSession(userId);
  return {
    success: true as const,
    message: restored
      ? "Password updated. Other signed-in devices have been logged out."
      : "Password updated. Please sign in again on this device.",
  };
};

export const changeStaffPasswordWithCurrentPasswordAction = async (input: unknown) => {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.STAFF) {
    return { success: false, error: "Only staff can change this password." };
  }

  const parsed = adminPasswordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the password fields." };
  }

  const staff = await db.user.findFirst({
    where: { id: user.id, role: UserRole.STAFF, isActive: true },
    select: { password: true },
  });
  if (!staff || !(await bcrypt.compare(parsed.data.currentPassword, staff.password))) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const changed = await changeStaffPasswordWithCurrentPassword({
      userId: user.id,
      currentPasswordHash: staff.password,
      passwordHash,
    });
    if (!changed) return { success: false, error: "Your password changed before this update finished. Try again." };
  } catch {
    return { success: false, error: "Unable to change your password right now. Please try again." };
  }

  return passwordChangedResult(user.id);
};

export const requestStaffPasswordChangeOtpAction = async () => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== UserRole.STAFF) {
    return { success: false, error: "Only staff can change this password." };
  }

  const staff = await db.user.findFirst({
    where: { id: sessionUser.id, role: UserRole.STAFF, isActive: true },
    select: { id: true, email: true },
  });
  if (!staff?.email) return { success: false, error: "Add an account email before using email verification." };

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  try {
    const claimed = await claimStaffPasswordChangeOtp({
      userId: staff.id,
      otpHash,
      otpExpiresAt,
      cooldownMs: OTP_RESEND_COOLDOWN_MS,
    });
    if (!claimed) {
      const latest = await db.user.findUnique({ where: { id: staff.id }, select: { passwordResetOtpLastSentAt: true } });
      const resendAvailableAt = latest?.passwordResetOtpLastSentAt
        ? new Date(latest.passwordResetOtpLastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS)
        : undefined;
      const seconds = resendAvailableAt ? Math.max(1, Math.ceil((resendAvailableAt.getTime() - Date.now()) / 1000)) : 1;
      return { success: false, error: `Wait ${seconds} seconds before requesting another code.`, resendAvailableAt };
    }

    try {
      await sendStaffPasswordOtpEmail(staff.email, otp);
    } catch {
      await removeStaffPasswordChangeOtp(staff.id, otpHash).catch(() => undefined);
      const resendAvailableAt = new Date(Date.now() + OTP_RESEND_COOLDOWN_MS);
      return { success: false, error: "Could not send a verification code. Try again after the cooldown.", resendAvailableAt };
    }

    return {
      success: true,
      message: "A verification code was sent to your current account email.",
      resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      expiresAt: otpExpiresAt,
    };
  } catch {
    return { success: false, error: "Could not request a verification code. Please try again." };
  }
};

export const changeStaffPasswordWithOtpAction = async (input: unknown) => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== UserRole.STAFF) {
    return { success: false, error: "Only staff can change this password." };
  }

  const parsed = adminPasswordChangeOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the code and password fields." };
  }

  const pending = await findStaffPasswordChangeOtp(sessionUser.id);
  const now = new Date();
  if (!pending || pending.otpExpiresAt <= now || pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    if (pending?.otpExpiresAt && pending.otpExpiresAt <= now) {
      await removeStaffPasswordChangeOtp(sessionUser.id);
    }
    return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  }

  const codeHash = hashOtp(parsed.data.code);
  if (pending.otpHash !== codeHash) {
    const attempts = await incrementStaffPasswordChangeOtpAttempts(sessionUser.id);
    return {
      success: false,
      error: attempts.count && pending.otpAttempts + 1 >= MAX_OTP_ATTEMPTS
        ? "Too many incorrect codes. Request a new code to continue."
        : "That code is incorrect. Check it and try again.",
      attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - pending.otpAttempts - 1),
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const changed = await completeStaffPasswordChangeWithOtp({
      userId: sessionUser.id,
      otpHash: codeHash,
      passwordHash,
    });
    if (!changed) return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  } catch {
    return { success: false, error: "Unable to change your password right now. Please try again." };
  }

  return passwordChangedResult(sessionUser.id);
};
