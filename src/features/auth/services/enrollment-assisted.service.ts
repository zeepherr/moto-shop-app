import crypto from "node:crypto";
import { db as defaultDb } from "@/lib/db";
import { EnrollmentMethod, EnrollmentStatus } from "@prisma/client";

export const createPasswordSetupToken = () => crypto.randomBytes(32).toString("hex");

export const hashPasswordSetupToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const beginPasswordSetup = async (
  data: { enrollmentId: number; tokenHash: string; expiresAt: Date },
  db = defaultDb,
) => {
  const result = await db.enrollment.updateMany({
    where: {
      id: data.enrollmentId,
      method: EnrollmentMethod.ASSISTED,
      status: EnrollmentStatus.AWAITING_PASSWORD_SETUP,
      expiresAt: { gt: new Date() },
    },
    data: {
      passwordSetupTokenHash: data.tokenHash,
      passwordSetupExpiresAt: data.expiresAt,
    },
  });
  return result.count > 0;
};

export const verifyAssistedOtp = async (
  data: { enrollmentId: number; otpHash: string },
  db = defaultDb,
) => {
  const result = await db.enrollment.updateMany({
    where: {
      id: data.enrollmentId,
      method: EnrollmentMethod.ASSISTED,
      status: EnrollmentStatus.AWAITING_OTP,
      expiresAt: { gt: new Date() },
      otpExpiresAt: { gt: new Date() },
      otpHash: data.otpHash,
    },
    data: {
      status: EnrollmentStatus.AWAITING_PASSWORD_SETUP,
      otpHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });
  return result.count > 0;
};

export const resendAssistedOtp = async (
  data: { enrollmentId: number; otpHash: string; otpExpiresAt: Date },
  db = defaultDb,
) => {
  const result = await db.enrollment.updateMany({
    where: {
      id: data.enrollmentId,
      method: EnrollmentMethod.ASSISTED,
      status: EnrollmentStatus.AWAITING_OTP,
      expiresAt: { gt: new Date() },
    },
    data: {
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    },
  });
  return result.count > 0;
};

export const createUserFromPasswordSetup = async (
  data: { tokenHash: string; passwordHash: string },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: {
        passwordSetupTokenHash: data.tokenHash,
        method: EnrollmentMethod.ASSISTED,
        status: EnrollmentStatus.AWAITING_PASSWORD_SETUP,
        expiresAt: { gt: new Date() },
        passwordSetupExpiresAt: { gt: new Date() },
      },
    });
    if (!enrollment) return null;

    const user = await tx.user.create({
      data: {
        email: enrollment.email,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        password: data.passwordHash,
        role: enrollment.role,
        emailVerifiedAt: new Date(),
      },
      select: { id: true, role: true },
    });

    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.COMPLETED,
        passwordSetupTokenHash: null,
        passwordSetupExpiresAt: null,
      },
    });

    return user;
  });
};
