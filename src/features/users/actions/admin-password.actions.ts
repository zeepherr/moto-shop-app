"use server";

import bcrypt from "bcryptjs";
import { UserAuditAction, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { MAX_OTP_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS, ROLES } from "@/features/auth/constants";
import { createAuthSession } from "@/features/auth/services/auth.service";
import { clearAuthCookies, setAuthCookies } from "@/features/auth/services/cookie.service";
import { createAccessToken, createRefreshToken, hashRefreshToken } from "@/features/auth/services/token.service";
import { generateOtp, hashOtp, sendAdminPasswordOtpEmail } from "@/features/auth/services/otp.service";
import {
  adminPasswordChangeOtpSchema,
  adminPasswordChangeSchema,
} from "@/features/auth/schemas";
import {
  claimAdminPasswordReset,
  completeAdminPasswordReset,
  findAdminPasswordResetRequest,
  incrementAdminPasswordResetAttempts,
  removeAdminPasswordResetRequest,
} from "@/features/auth/services/admin-password-reset.service";
import { changeAdminPasswordWithCurrentPassword } from "@/features/users/services/admin-password.service";

const issueFreshAdminSession = async (userId: number) => {
  const admin = await db.user.findFirst({
    where: { id: userId, role: UserRole.ADMIN, isActive: true },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
  if (!admin) return false;

  const refreshToken = createRefreshToken();
  const session = await createAuthSession(admin.id, hashRefreshToken(refreshToken));
  const accessToken = await createAccessToken({
    sessionId: session.id,
    userId: admin.id,
    email: admin.email ?? "",
    role: admin.role,
    firstName: admin.firstName,
    lastName: admin.lastName,
  });
  await setAuthCookies(accessToken, refreshToken);
  return true;
};

const restoreProfileSession = async (userId: number) => {
  try {
    if (await issueFreshAdminSession(userId)) return true;
  } catch {
    // The password is already changed; fall through to a clean sign-in state.
  }
  await clearAuthCookies();
  return false;
};

export const changeAdminPasswordWithCurrentPasswordAction = async (input: unknown) => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== ROLES.ADMIN) {
    return { success: false, error: "Only administrators can change this password." };
  }

  const parsed = adminPasswordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the password fields." };
  }

  const admin = await db.user.findFirst({
    where: { id: sessionUser.id, role: UserRole.ADMIN, isActive: true },
    select: { password: true },
  });
  if (!admin || !(await bcrypt.compare(parsed.data.currentPassword, admin.password))) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const changed = await changeAdminPasswordWithCurrentPassword({
      userId: sessionUser.id,
      currentPasswordHash: admin.password,
      passwordHash,
    });
    if (!changed) return { success: false, error: "Your password changed before this update finished. Try again." };
  } catch {
    return { success: false, error: "Unable to change your password right now. Please try again." };
  }

  const sessionRestored = await restoreProfileSession(sessionUser.id);
  return {
    success: true,
    message: sessionRestored
      ? "Password updated. Other devices have been signed out."
      : "Password updated. Please sign in again on this device. Other devices have been signed out.",
  };
};

export const requestAdminPasswordChangeOtpAction = async () => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== ROLES.ADMIN) {
    return { success: false, error: "Only administrators can change this password." };
  }

  const admin = await db.user.findFirst({
    where: { id: sessionUser.id, role: UserRole.ADMIN, isActive: true },
    select: { id: true, email: true },
  });
  if (!admin?.email) return { success: false, error: "Add an account email before using email verification." };

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  try {
    const claimed = await claimAdminPasswordReset({
      userId: admin.id,
      otpHash,
      otpExpiresAt,
      cooldownMs: OTP_RESEND_COOLDOWN_MS,
    });
    if (!claimed) {
      const latest = await db.user.findUnique({ where: { id: admin.id }, select: { passwordResetOtpLastSentAt: true } });
      const resendAvailableAt = latest?.passwordResetOtpLastSentAt
        ? new Date(latest.passwordResetOtpLastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS)
        : undefined;
      const seconds = resendAvailableAt ? Math.max(1, Math.ceil((resendAvailableAt.getTime() - Date.now()) / 1000)) : 1;
      return { success: false, error: `Wait ${seconds} seconds before requesting another code.`, resendAvailableAt };
    }

    try {
      await sendAdminPasswordOtpEmail(admin.email, otp, "change");
    } catch {
      await removeAdminPasswordResetRequest(admin.id, otpHash).catch(() => undefined);
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

export const changeAdminPasswordWithOtpAction = async (input: unknown) => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== ROLES.ADMIN) {
    return { success: false, error: "Only administrators can change this password." };
  }

  const parsed = adminPasswordChangeOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the code and password fields." };
  }

  const pending = await findAdminPasswordResetRequest(sessionUser.id);
  const now = new Date();
  if (!pending || pending.otpExpiresAt <= now || pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    if (pending?.otpExpiresAt && pending.otpExpiresAt <= now) {
      await removeAdminPasswordResetRequest(sessionUser.id);
    }
    return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  }

  const codeHash = hashOtp(parsed.data.code);
  if (pending.otpHash !== codeHash) {
    const attempts = await incrementAdminPasswordResetAttempts(sessionUser.id);
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
    const changed = await completeAdminPasswordReset({
      userId: sessionUser.id,
      otpHash: codeHash,
      passwordHash,
      action: UserAuditAction.USER_PASSWORD_CHANGED,
      detail: "Administrator password changed after OTP verification",
    });
    if (!changed) return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  } catch {
    return { success: false, error: "Unable to change your password right now. Please try again." };
  }

  const sessionRestored = await restoreProfileSession(sessionUser.id);
  return {
    success: true,
    message: sessionRestored
      ? "Password updated. Other devices may remain signed in for up to 15 minutes."
      : "Password updated. Please sign in again. Other devices may remain signed in for up to 15 minutes.",
  };
};
