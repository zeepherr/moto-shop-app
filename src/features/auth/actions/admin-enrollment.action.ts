"use server";

import { EnrollmentMethod, UserAuditAction } from "@prisma/client";
import { config } from "@/config";
import { adminEnrollmentSchema, type AdminEnrollmentInput } from "../schemas";
import { findUserByEmail } from "../services/auth.service";
import { createEnrollment, recordEnrollmentEvent } from "../services/enrollment.service";
import { generateOtp, hashOtp, sendRegistrationLinkEmail, sendRegistrationOtpEmail } from "../services/otp.service";
import { OTP_TTL_MS } from "../constants";
import { requireAdmin, revalidateUsers } from "./admin-enrollment.shared";

const ENROLLMENT_TTL_MS = 24 * 60 * 60 * 1000;

export const createEnrollmentAction = async (input: AdminEnrollmentInput) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can create enrollments." };

  const parsed = adminEnrollmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  const data = parsed.data;
  if (await findUserByEmail(data.email)) return { success: false, error: "This email is already registered." };

  const isAssisted = data.method === EnrollmentMethod.ASSISTED;
  const otp = isAssisted ? generateOtp() : undefined;
  const created = await createEnrollment({
    ...data,
    firstName: "New",
    lastName: data.role === "STAFF" ? "Staff" : "Member",
    createdById: admin.id,
    expiresAt: new Date(Date.now() + ENROLLMENT_TTL_MS),
    otpHash: otp ? hashOtp(otp) : undefined,
    otpExpiresAt: otp ? new Date(Date.now() + OTP_TTL_MS) : undefined,
  });
  if (created.conflict) {
    return { success: false, error: "This email already has an unfinished enrollment. Open it to resume, resend, cancel, or restart it.", data: { id: created.enrollment.id } };
  }

  try {
    if (otp) await sendRegistrationOtpEmail(data.email, otp);
    else await sendRegistrationLinkEmail(data.email, `${config.app.url}/register`);
  } catch {
    await recordEnrollmentEvent({
      enrollmentId: created.enrollment.id,
      actorUserId: admin.id,
      action: otp ? UserAuditAction.ENROLLMENT_OTP_DELIVERY_FAILED : UserAuditAction.REGISTRATION_LINK_DELIVERY_FAILED,
    });
    return { success: false, error: otp ? "Enrollment was saved, but the verification email could not be sent. Try resending it." : "Enrollment was saved, but the registration link email could not be sent. Open the enrollment and resend it." };
  }

  await recordEnrollmentEvent({ enrollmentId: created.enrollment.id, actorUserId: admin.id, action: otp ? UserAuditAction.ENROLLMENT_OTP_SENT : UserAuditAction.REGISTRATION_LINK_SENT });
  revalidateUsers();
  return { success: true, data: { id: created.enrollment.id }, message: isAssisted ? "Verification code sent to the customer’s email." : "Registration link sent to the customer’s email." };
};