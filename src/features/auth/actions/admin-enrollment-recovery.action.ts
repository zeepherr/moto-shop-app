"use server";

import { EnrollmentMethod, EnrollmentStatus, UserAuditAction } from "@prisma/client";
import { config } from "@/config";
import { cancelEnrollment, findEnrollmentById, recordEnrollmentEvent } from "../services/enrollment.service";
import { sendRegistrationLinkEmail } from "../services/otp.service";
import { requireAdmin, revalidateUsers, sendPasswordSetupLink } from "./admin-enrollment.shared";

export const resendPasswordSetupLinkAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can resend password setup links." };
  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment) return { success: false, error: "Enrollment not found." };
  try {
    const result = await sendPasswordSetupLink(enrollment.id, enrollment.email, admin.id);
    if (!result.success) return result;
  } catch {
    return { success: false, error: "Could not send the password setup email. Try again." };
  }
  revalidateUsers();
  return { success: true, message: "A new password setup link was sent." };
};

export const resendSelfServiceRegistrationLinkAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can resend registration links." };
  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.method !== EnrollmentMethod.SELF_SERVICE || enrollment.status !== EnrollmentStatus.APPROVED || enrollment.expiresAt <= new Date()) return { success: false, error: "This registration link is no longer available." };
  try {
    await sendRegistrationLinkEmail(enrollment.email, `${config.app.url}/register`);
  } catch {
    await recordEnrollmentEvent({ enrollmentId, actorUserId: admin.id, action: UserAuditAction.REGISTRATION_LINK_DELIVERY_FAILED });
    return { success: false, error: "Could not send the registration link. Try again." };
  }
  await recordEnrollmentEvent({ enrollmentId, actorUserId: admin.id, action: UserAuditAction.REGISTRATION_LINK_SENT });
  revalidateUsers();
  return { success: true, message: "Registration link sent to the customer." };
};

export const cancelEnrollmentAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can cancel enrollments." };
  const result = await cancelEnrollment({ enrollmentId, actorUserId: admin.id });
  if (result.count === 0) return { success: false, error: "This enrollment can no longer be cancelled." };
  revalidateUsers();
  return { success: true, message: "Enrollment cancelled." };
};