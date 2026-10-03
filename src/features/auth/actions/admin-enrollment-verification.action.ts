"use server";

import { EnrollmentMethod, EnrollmentStatus, UserAuditAction } from "@prisma/client";
import { assistedOtpSchema, type AssistedOtpInput } from "../schemas";
import { findEnrollmentById, incrementEnrollmentOtpAttempts, recordEnrollmentEvent } from "../services/enrollment.service";
import { resendAssistedOtp, verifyAssistedOtp } from "../services/enrollment-assisted.service";
import { generateOtp, getOtpCooldownSeconds, hashOtp, sendRegistrationOtpEmail } from "../services/otp.service";
import { MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "../constants";
import { requireAdmin, revalidateUsers, sendPasswordSetupLink } from "./admin-enrollment.shared";

export const verifyAssistedEnrollmentOtpAction = async (input: AssistedOtpInput) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can verify assisted enrollments." };
  const parsed = assistedOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };

  const enrollment = await findEnrollmentById(parsed.data.enrollmentId);
  if (!enrollment || enrollment.method !== EnrollmentMethod.ASSISTED || enrollment.status !== EnrollmentStatus.AWAITING_OTP || enrollment.expiresAt < new Date() || !enrollment.otpExpiresAt || enrollment.otpExpiresAt < new Date()) return { success: false, error: "This assisted enrollment is no longer awaiting verification." };
  if (enrollment.otpAttempts >= MAX_OTP_ATTEMPTS) return { success: false, error: "Too many incorrect attempts. Send a new verification code." };
  if (hashOtp(parsed.data.code) !== enrollment.otpHash) {
    await incrementEnrollmentOtpAttempts(enrollment.id);
    return { success: false, error: "The verification code is incorrect." };
  }
  const verified = await verifyAssistedOtp({ enrollmentId: enrollment.id, otpHash: hashOtp(parsed.data.code) });
  if (!verified) return { success: false, error: "The verification code is no longer valid." };
  await recordEnrollmentEvent({ enrollmentId: enrollment.id, actorUserId: admin.id, action: UserAuditAction.ENROLLMENT_OTP_VERIFIED });

  try {
    const result = await sendPasswordSetupLink(enrollment.id, enrollment.email, admin.id);
    if (!result.success) return result;
  } catch {
    return { success: false, error: "Email was verified, but the password setup email could not be sent. Try sending it again." };
  }
  revalidateUsers();
  return { success: true, message: "Email verified. Password setup and login links were sent to the customer." };
};

export const resendAssistedEnrollmentOtpAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can resend verification codes." };
  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.method !== EnrollmentMethod.ASSISTED) return { success: false, error: "Assisted enrollment not found." };
  if (enrollment.otpLastSentAt && getOtpCooldownSeconds(enrollment.otpLastSentAt) > 0) return { success: false, error: "Please wait before sending another verification code." };

  const otp = generateOtp();
  const resent = await resendAssistedOtp({ enrollmentId, otpHash: hashOtp(otp), otpExpiresAt: new Date(Date.now() + OTP_TTL_MS) });
  if (!resent) return { success: false, error: "This enrollment is no longer awaiting verification." };
  try {
    await sendRegistrationOtpEmail(enrollment.email, otp);
  } catch {
    await recordEnrollmentEvent({ enrollmentId, actorUserId: admin.id, action: UserAuditAction.ENROLLMENT_OTP_DELIVERY_FAILED });
    return { success: false, error: "Could not send the verification email. Try again." };
  }
  await recordEnrollmentEvent({ enrollmentId, actorUserId: admin.id, action: UserAuditAction.ENROLLMENT_OTP_SENT });
  revalidateUsers();
  return { success: true, message: "A new verification code was sent." };
};