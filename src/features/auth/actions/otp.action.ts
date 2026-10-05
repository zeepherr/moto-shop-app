"use server";

import {
  verifyEmailSchema,
  resendVerificationSchema,
  type VerifyEmailInput,
  type ResendVerificationInput,
} from "../schemas";
import type { ActionResult } from "../types";
import {
  createUserFromSelfServiceEnrollment,
  clearSelfServiceOtpCooldown,
  findSelfServiceOtpEnrollment,
  incrementEnrollmentOtpAttempts,
  recordEnrollmentEvent,
  resendSelfServiceOtp,
} from "../services/enrollment.service";
import { UserAuditAction } from "@prisma/client";
import {
  hashOtp,
  generateOtp,
  getOtpCooldownSeconds,
  sendRegistrationOtpEmail,
} from "../services/otp.service";
import { MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "../constants";
import { createAuthSession } from "../services/auth.service";
import { createAccessToken, createRefreshToken, hashRefreshToken } from "../services/token.service";
import { setAuthCookies } from "../services/cookie.service";

export const verifyOtpAction = async (input: VerifyEmailInput): Promise<ActionResult> => {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, code } = parsed.data;
  const pending = await findSelfServiceOtpEnrollment(email);

  if (!pending) {
    return { success: false, code: "REGISTRATION_NOT_FOUND", error: "No pending registration found" };
  }

  if (pending.expiresAt < new Date()) {
    return { success: false, code: "ENROLLMENT_EXPIRED", error: "Registration approval has expired. Please ask the shop team to approve it again." };
  }

  if (!pending.otpExpiresAt || pending.otpExpiresAt < new Date()) {
    return { success: false, code: "OTP_EXPIRED", error: "Verification code has expired. Request a new code to continue." };
  }

  if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, code: "OTP_ATTEMPTS_EXHAUSTED", error: "Too many incorrect attempts. Request a new code to continue." };
  }

  const submittedHash = hashOtp(code);
  if (submittedHash !== pending.otpHash) {
    await incrementEnrollmentOtpAttempts(pending.id);
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - (pending.otpAttempts + 1));
    return {
      success: false,
      error: `Incorrect verification code. ${remaining} attempts remaining.`,
      attemptsRemaining: remaining,
    };
  }

  const newUser = await createUserFromSelfServiceEnrollment({ email, otpHash: submittedHash });
  if (!newUser) {
    return { success: false, error: "Verification code is no longer valid. Please request a new code." };
  }

  const accessToken = await createAccessToken({
    userId: newUser.id,
    email: newUser.email ?? "",
    role: newUser.role,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });
  const refreshToken = createRefreshToken();
  await createAuthSession(newUser.id, hashRefreshToken(refreshToken));
  await setAuthCookies(accessToken, refreshToken);

  return {
    success: true,
    message: "Email verified successfully! Your account is ready.",
    data: newUser,
  };
};

export const resendOtpAction = async (input: ResendVerificationInput): Promise<ActionResult> => {
  const parsed = resendVerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email } = parsed.data;
  const pending = await findSelfServiceOtpEnrollment(email);
  if (!pending) {
    return { success: false, code: "REGISTRATION_NOT_FOUND", error: "No pending registration was found. Start again with your approved email." };
  }

  const cooldown = pending.otpLastSentAt ? getOtpCooldownSeconds(pending.otpLastSentAt) : 0;
  if (cooldown > 0) {
    return { success: false, error: `Please wait ${cooldown} seconds before requesting a new code.` };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const updated = await resendSelfServiceOtp({ email, otpHash, otpExpiresAt: expiresAt });
  if (!updated) {
    return { success: false, code: "ENROLLMENT_EXPIRED", error: "Registration approval has expired. Please ask the shop team to approve it again." };
  }
  try {
    await sendRegistrationOtpEmail(email, otp);
  } catch {
    await clearSelfServiceOtpCooldown(email);
    await recordEnrollmentEvent({
      enrollmentId: pending.id,
      action: UserAuditAction.ENROLLMENT_OTP_DELIVERY_FAILED,
    });
    return { success: false, error: "Could not send a verification code. Please try again." };
  }
  await recordEnrollmentEvent({
    enrollmentId: pending.id,
    action: UserAuditAction.ENROLLMENT_OTP_SENT,
    detail: "SELF_SERVICE_RESEND",
  });

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
    data: { email, expiresAt },
    resendAvailableAt: new Date(Date.now() + 60 * 1000),
  };
};
