"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";
import { createAuthSession } from "@/features/auth/services/auth.service";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS, MAX_OTP_ATTEMPTS } from "@/features/auth/constants";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "@/features/auth/services/token.service";
import { setAuthCookies } from "@/features/auth/services/cookie.service";
import {
  generateOtp,
  hashOtp,
  sendEmailChangeOtpEmail,
} from "@/features/auth/services/otp.service";
import { requestAdminEmailChangeSchema, verifyAdminEmailChangeSchema } from "@/features/users/schemas";
import {
  claimEmailChangeRequest,
  completeEmailChange,
  findEmailChangeRequest,
  incrementEmailChangeAttempts,
  removeEmailChangeRequest,
} from "@/features/users/services/email-change.service";
import { db } from "@/lib/db";

export const requestAdminEmailChangeAction = async (input: unknown) => {
  const user = await getCurrentUser();
  if (!user || user.role !== ROLES.ADMIN) return { success: false, error: "Only administrators can change this email." };

  const parsed = requestAdminEmailChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email address." };
  const email = parsed.data.email;
  if (email === user.email.toLowerCase()) return { success: false, error: "Enter a different email address." };

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { success: false, error: "That email is already associated with an account." };
  const otherRequest = await db.emailChangeRequest.findUnique({ where: { newEmail: email }, select: { userId: true } });
  if (otherRequest && otherRequest.userId !== user.id) {
    return { success: false, error: "That address has another pending email change." };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  try {
    const claim = await claimEmailChangeRequest({
      userId: user.id,
      newEmail: email,
      otpHash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      cooldownMs: OTP_RESEND_COOLDOWN_MS,
    });
    if (claim.status === "cooldown") {
      const seconds = Math.max(1, Math.ceil((claim.resendAvailableAt.getTime() - Date.now()) / 1000));
      return {
        success: false,
        error: `Wait ${seconds} seconds before requesting another code.`,
        resendAvailableAt: claim.resendAvailableAt,
      };
    }
    await sendEmailChangeOtpEmail(email, otp);
    return {
      success: true,
      message: "A verification code was sent to the new email address.",
      resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
    };
  } catch {
    try { await removeEmailChangeRequest(user.id, otpHash); } catch { /* Preserve the delivery error for the user. */ }
    const updatedUser = await db.user.findUnique({ where: { id: user.id }, select: { emailChangeOtpLastSentAt: true } });
    const resendAvailableAt = updatedUser?.emailChangeOtpLastSentAt
      ? new Date(updatedUser.emailChangeOtpLastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS)
      : undefined;
    return {
      success: false,
      error: "Could not send a verification code. Check the email address and try again.",
      resendAvailableAt,
    };
  }
};

export const cancelAdminEmailChangeAction = async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== ROLES.ADMIN) return { success: false, error: "Only administrators can change this email." };
  try {
    await removeEmailChangeRequest(user.id);
    return { success: true };
  } catch {
    return { success: false, error: "Could not cancel the email change request." };
  }
};

export const verifyAdminEmailChangeAction = async (input: unknown) => {
  const user = await getCurrentUser();
  if (!user || user.role !== ROLES.ADMIN) return { success: false, error: "Only administrators can change this email." };

  const parsed = verifyAdminEmailChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid verification code." };
  const pending = await findEmailChangeRequest(user.id);
  if (!pending) return { success: false, error: "Request a verification code for your new email first." };
  if (pending.otpExpiresAt <= new Date()) {
    await removeEmailChangeRequest(user.id);
    return { success: false, error: "That code has expired. Request a new one." };
  }
  if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, error: "Too many incorrect attempts. Request a new code." };
  }

  const codeHash = hashOtp(parsed.data.code);
  let changedUser: Awaited<ReturnType<typeof completeEmailChange>> = null;
  try {
    changedUser = await completeEmailChange({ userId: user.id, otpHash: codeHash });
  } catch {
    return { success: false, error: "That email could not be saved. It may already belong to another account." };
  }
  if (!changedUser) {
    await incrementEmailChangeAttempts(user.id);
    return {
      success: false,
      error: "That code is incorrect or no longer valid.",
      attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - pending.otpAttempts - 1),
    };
  }

  const accessToken = await createAccessToken({
    userId: changedUser.id,
    email: changedUser.email ?? "",
    role: changedUser.role,
    firstName: changedUser.firstName,
    lastName: changedUser.lastName,
  });
  const refreshToken = createRefreshToken();
  await createAuthSession(changedUser.id, hashRefreshToken(refreshToken));
  await setAuthCookies(accessToken, refreshToken);
  revalidatePath("/admin/profile");
  revalidatePath("/admin");
  return { success: true, email: changedUser.email, message: "Email address updated and verified." };
};
