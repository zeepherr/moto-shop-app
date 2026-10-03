"use server";

import bcrypt from "bcryptjs";
import { registerSchema, type RegisterInput } from "../schemas";
import type { ActionResult } from "../types";
import { findUserByEmail } from "../services/auth.service";
import {
  beginSelfServiceRegistration,
  findSelfServiceOtpEnrollment,
  recordEnrollmentEvent,
} from "../services/enrollment.service";
import { UserAuditAction } from "@prisma/client";
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
    const enrollment = await findSelfServiceOtpEnrollment(email);
    if (enrollment) {
      await recordEnrollmentEvent({
        enrollmentId: enrollment.id,
        action: UserAuditAction.ENROLLMENT_OTP_DELIVERY_FAILED,
      });
    }
    // If SMTP fails, notify user but do not crash
    return {
      success: false,
      error: "Failed to send verification email. Please check your email configuration.",
    };
  }

  const enrollment = await findSelfServiceOtpEnrollment(email);
  if (enrollment) {
    await recordEnrollmentEvent({
      enrollmentId: enrollment.id,
      action: UserAuditAction.ENROLLMENT_OTP_SENT,
      detail: "SELF_SERVICE_REGISTRATION",
    });
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
