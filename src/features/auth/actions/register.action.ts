"use server";

import bcrypt from "bcryptjs";
import { registerSchema, type RegisterInput } from "../schemas";
import type { ActionResult } from "../types";
import { findUserByEmail } from "../services/auth.service";
import { beginSelfServiceRegistration } from "../services/enrollment.service";
import { generateOtp, hashOtp, sendRegistrationOtpEmail } from "../services/otp.service";
import { OTP_TTL_MS } from "../constants";

export const registerAction = async (input: RegisterInput): Promise<ActionResult> => {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return { success: false, error: "This email is already registered" };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const passwordHash = await bcrypt.hash(password, 10);

  const isApproved = await beginSelfServiceRegistration({
    email,
    passwordHash,
    otpHash,
    otpExpiresAt: expiresAt,
  });

  if (!isApproved) {
    return {
      success: false,
      error: "This email is not approved for registration. Please ask the shop team for help.",
    };
  }

  try {
    await sendRegistrationOtpEmail(email, otp);
  } catch {
    // If SMTP fails, notify user but do not crash
    return {
      success: false,
      error: "Failed to send verification email. Please check your email configuration.",
    };
  }

  const resendAvailableAt = new Date(Date.now() + 60 * 1000);

  return {
    success: true,
    code: "EMAIL_VERIFICATION_REQUIRED",
    message: "Verification code sent to your email",
    data: { email, expiresAt },
    resendAvailableAt,
  };
};
