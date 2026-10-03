"use server";

import { revalidatePath } from "next/cache";
import { EnrollmentMethod, EnrollmentStatus } from "@prisma/client";
import { config } from "@/config";
import { getCurrentUser } from "./session.action";
import {
  adminEnrollmentSchema,
  assistedOtpSchema,
  type AdminEnrollmentInput,
  type AssistedOtpInput,
} from "../schemas";
import { findUserByEmail } from "../services/auth.service";
import {
  createEnrollment,
  cancelEnrollment,
  findEnrollmentById,
  incrementEnrollmentOtpAttempts,
} from "../services/enrollment.service";
import {
  beginPasswordSetup,
  createPasswordSetupToken,
  hashPasswordSetupToken,
  resendAssistedOtp,
  verifyAssistedOtp,
} from "../services/enrollment-assisted.service";
import {
  generateOtp,
  getOtpCooldownSeconds,
  hashOtp,
  sendPasswordSetupEmail,
  sendRegistrationLinkEmail,
  sendRegistrationOtpEmail,
} from "../services/otp.service";
import { MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "../constants";

const ENROLLMENT_TTL_MS = 24 * 60 * 60 * 1000;

const requireAdmin = async () => {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
};

const revalidateUsers = () => revalidatePath("/admin/users");

async function sendPasswordSetupLink(enrollmentId: number, email: string) {
  const token = createPasswordSetupToken();
  const expiresAt = new Date(Date.now() + ENROLLMENT_TTL_MS);
  const issued = await beginPasswordSetup({
    enrollmentId,
    tokenHash: hashPasswordSetupToken(token),
    expiresAt,
  });

  if (!issued) {
    return { success: false, error: "Password setup is no longer available for this enrollment." };
  }

  await sendPasswordSetupEmail(
    email,
    `${config.app.url}/set-password?token=${encodeURIComponent(token)}`,
    `${config.app.url}/login`,
  );
  return { success: true };
}

export const createEnrollmentAction = async (input: AdminEnrollmentInput) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can create enrollments." };

  const parsed = adminEnrollmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };

  const data = parsed.data;
  if (await findUserByEmail(data.email)) {
    return { success: false, error: "This email is already registered." };
  }

  const isAssisted = data.method === EnrollmentMethod.ASSISTED;
  const otp = isAssisted ? generateOtp() : undefined;
  const defaultName = data.role === "STAFF" ? "New Staff" : "New Member";

  const enrollment = await createEnrollment({
    ...data,
    firstName: "New",
    lastName: defaultName.replace("New ", ""),
    method: data.method,
    createdById: admin.id,
    expiresAt: new Date(Date.now() + ENROLLMENT_TTL_MS),
    otpHash: otp ? hashOtp(otp) : undefined,
    otpExpiresAt: otp ? new Date(Date.now() + OTP_TTL_MS) : undefined,
  });

  try {
    if (otp) {
      await sendRegistrationOtpEmail(data.email, otp);
    } else {
      await sendRegistrationLinkEmail(data.email, `${config.app.url}/register`);
    }
  } catch {
    return {
      success: false,
      error: otp
        ? "Enrollment was saved, but the verification email could not be sent. Try resending it."
        : "Enrollment was saved, but the registration link email could not be sent. Try again.",
    };
  }

  revalidateUsers();
  return {
    success: true,
    data: { id: enrollment.id },
    message: isAssisted
      ? "Verification code sent to the customer’s email."
      : "Registration link sent to the customer’s email.",
  };
};

export const verifyAssistedEnrollmentOtpAction = async (input: AssistedOtpInput) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can verify assisted enrollments." };

  const parsed = assistedOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };

  const enrollment = await findEnrollmentById(parsed.data.enrollmentId);
  if (
    !enrollment ||
    enrollment.method !== EnrollmentMethod.ASSISTED ||
    enrollment.status !== EnrollmentStatus.AWAITING_OTP ||
    enrollment.expiresAt < new Date() ||
    !enrollment.otpExpiresAt ||
    enrollment.otpExpiresAt < new Date()
  ) {
    return { success: false, error: "This assisted enrollment is no longer awaiting verification." };
  }

  if (enrollment.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, error: "Too many incorrect attempts. Send a new verification code." };
  }

  if (hashOtp(parsed.data.code) !== enrollment.otpHash) {
    await incrementEnrollmentOtpAttempts(enrollment.id);
    return { success: false, error: "The verification code is incorrect." };
  }

  const verified = await verifyAssistedOtp({
    enrollmentId: enrollment.id,
    otpHash: hashOtp(parsed.data.code),
  });
  if (!verified) return { success: false, error: "The verification code is no longer valid." };

  try {
    const result = await sendPasswordSetupLink(enrollment.id, enrollment.email);
    if (!result.success) return result;
  } catch {
    return {
      success: false,
      error: "Email was verified, but the password setup email could not be sent. Try sending it again.",
    };
  }

  revalidateUsers();
  return { success: true, message: "Email verified. Password setup and login links were sent to the customer." };
};

export const resendAssistedEnrollmentOtpAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can resend verification codes." };

  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.method !== EnrollmentMethod.ASSISTED) {
    return { success: false, error: "Assisted enrollment not found." };
  }
  if (enrollment.otpLastSentAt && getOtpCooldownSeconds(enrollment.otpLastSentAt) > 0) {
    return { success: false, error: "Please wait before sending another verification code." };
  }

  const otp = generateOtp();
  const resent = await resendAssistedOtp({
    enrollmentId,
    otpHash: hashOtp(otp),
    otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  if (!resent) return { success: false, error: "This enrollment is no longer awaiting verification." };

  try {
    await sendRegistrationOtpEmail(enrollment.email, otp);
  } catch {
    return { success: false, error: "Could not send the verification email. Try again." };
  }

  revalidateUsers();
  return { success: true, message: "A new verification code was sent." };
};

export const resendPasswordSetupLinkAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can resend password setup links." };

  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment) return { success: false, error: "Enrollment not found." };

  try {
    const result = await sendPasswordSetupLink(enrollment.id, enrollment.email);
    if (!result.success) return result;
  } catch {
    return { success: false, error: "Could not send the password setup email. Try again." };
  }

  revalidateUsers();
  return { success: true, message: "A new password setup link was sent." };
};

export const cancelEnrollmentAction = async (enrollmentId: number) => {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Only admins can cancel enrollments." };

  const result = await cancelEnrollment(enrollmentId);
  if (result.count === 0) return { success: false, error: "This enrollment can no longer be cancelled." };

  revalidateUsers();
  return { success: true, message: "Enrollment cancelled." };
};
