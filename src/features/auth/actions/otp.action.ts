"use server";

import {
  verifyEmailSchema,
  resendVerificationSchema,
  type VerifyEmailInput,
  type ResendVerificationInput,
} from "../schemas";
import type { ActionResult } from "../types";
import {
  getPendingByEmail,
  addAttemptsPending,
  createUserFromPending,
  updatePendingOtp,
  cleanExpiredPending,
} from "../services/auth.service";
import {
  hashOtp,
  generateOtp,
  getOtpCooldownSeconds,
  sendRegistrationOtpEmail,
} from "../services/otp.service";
import { MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "../constants";

export const verifyOtpAction = async (input: VerifyEmailInput): Promise<ActionResult> => {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, code } = parsed.data;
  const pending = await getPendingByEmail(email);

  if (!pending) {
    return { success: false, error: "No pending registration found" };
  }

  if (pending.expiresAt < new Date()) {
    return { success: false, error: "Verification code has expired. Please request a new code." };
  }

  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  const submittedHash = hashOtp(code);
  if (submittedHash !== pending.otpHash) {
    await addAttemptsPending(pending.id);
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - (pending.attempts + 1));
    return {
      success: false,
      error: `Incorrect verification code. ${remaining} attempts remaining.`,
      attemptsRemaining: remaining,
    };
  }

  const newUser = await createUserFromPending(pending);
  return {
    success: true,
    message: "Email verified successfully! You can now log in.",
    data: newUser,
  };
};

export const resendOtpAction = async (input: ResendVerificationInput): Promise<ActionResult> => {
  const parsed = resendVerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email } = parsed.data;
  await cleanExpiredPending();

  const pending = await getPendingByEmail(email);
  if (!pending) {
    return { success: false, error: "Registration has expired or does not exist. Please register again." };
  }

  const cooldown = getOtpCooldownSeconds(pending.lastSentAt);
  if (cooldown > 0) {
    return { success: false, error: `Please wait ${cooldown} seconds before requesting a new code.` };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await updatePendingOtp({ email, otpHash, expiresAt });
  await sendRegistrationOtpEmail(email, otp);

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
    data: { email, expiresAt },
    resendAvailableAt: new Date(Date.now() + 60 * 1000),
  };
};
