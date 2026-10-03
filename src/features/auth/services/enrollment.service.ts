import { db as defaultDb } from "@/lib/db";
import { EnrollmentMethod, EnrollmentStatus, Prisma, UserAuditAction, type UserRole } from "@prisma/client";

const activeEnrollmentWhere = (email: string) => ({
  email,
  status: { notIn: [EnrollmentStatus.COMPLETED, EnrollmentStatus.CANCELLED, EnrollmentStatus.EXPIRED] },
});

export const findActiveEnrollmentByEmail = async (email: string, db = defaultDb) => {
  return await db.enrollment.findFirst({
    where: activeEnrollmentWhere(email),
  });
};

export const createEnrollment = async (
  data: {
    email: string;
    firstName: string;
    lastName: string;
    role: Exclude<UserRole, "ADMIN">;
    method: EnrollmentMethod;
    createdById: number;
    expiresAt: Date;
    otpHash?: string;
    otpExpiresAt?: Date;
  },
  db = defaultDb,
) => {
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({ where: { email: data.email } });
      const active =
        existing &&
        existing.status !== EnrollmentStatus.COMPLETED &&
        existing.status !== EnrollmentStatus.CANCELLED &&
        existing.status !== EnrollmentStatus.EXPIRED;
      if (active) return { enrollment: existing, conflict: true };

      const enrollmentData = {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        method: data.method,
        status: data.method === EnrollmentMethod.ASSISTED ? EnrollmentStatus.AWAITING_OTP : EnrollmentStatus.APPROVED,
        passwordHash: null,
        otpHash: data.otpHash ?? null,
        otpExpiresAt: data.otpExpiresAt ?? null,
        otpAttempts: 0,
        otpLastSentAt: data.otpHash ? new Date() : null,
        passwordSetupTokenHash: null,
        passwordSetupExpiresAt: null,
        expiresAt: data.expiresAt,
        createdById: data.createdById,
      };
      const enrollment = existing
        ? await tx.enrollment.update({ where: { id: existing.id }, data: enrollmentData })
        : await tx.enrollment.create({ data: { email: data.email, ...enrollmentData } });

      await tx.userAuditEvent.create({
        data: {
          action: UserAuditAction.ENROLLMENT_CREATED,
          enrollmentId: enrollment.id,
          actorUserId: data.createdById,
          detail: `${data.method}:${data.role}`,
        },
      });
      return { enrollment, conflict: false };
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const enrollment = await db.enrollment.findUnique({ where: { email: data.email } });
    if (!enrollment) throw error;
    return { enrollment, conflict: true };
  }
};

export const recordEnrollmentEvent = async (
  data: { enrollmentId: number; action: UserAuditAction; actorUserId?: number; detail?: string },
  db = defaultDb,
) => {
  return await db.userAuditEvent.create({ data });
};

export const beginSelfServiceRegistration = async (
  data: { email: string; passwordHash: string; otpHash: string; otpExpiresAt: Date },
  db = defaultDb,
) => {
  const result = await db.enrollment.updateMany({
    where: {
      email: data.email,
      method: EnrollmentMethod.SELF_SERVICE,
      status: EnrollmentStatus.APPROVED,
      expiresAt: { gt: new Date() },
    },
    data: {
      status: EnrollmentStatus.AWAITING_OTP,
      passwordHash: data.passwordHash,
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    },
  });

  return result.count > 0;
};

export const findSelfServiceOtpEnrollment = async (email: string, db = defaultDb) => {
  return await db.enrollment.findFirst({
    where: {
      email,
      method: EnrollmentMethod.SELF_SERVICE,
      status: EnrollmentStatus.AWAITING_OTP,
    },
  });
};

export const incrementEnrollmentOtpAttempts = async (id: number, db = defaultDb) => {
  return await db.enrollment.update({
    where: { id },
    data: { otpAttempts: { increment: 1 } },
  });
};

export const findEnrollmentById = async (id: number, db = defaultDb) => {
  return await db.enrollment.findUnique({ where: { id } });
};

export const findEnrollmentSummaries = async (db = defaultDb) => {
  return await db.enrollment.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      method: true,
      status: true,
      expiresAt: true,
      otpExpiresAt: true,
      createdAt: true,
      updatedAt: true,
      auditEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { action: true, createdAt: true },
      },
    },
    where: { status: { not: EnrollmentStatus.COMPLETED } },
    orderBy: { createdAt: "desc" },
  });
};

export const expireStaleEnrollments = async (db = defaultDb) => {
  return await db.enrollment.updateMany({
    where: {
      status: { in: [EnrollmentStatus.APPROVED, EnrollmentStatus.AWAITING_OTP, EnrollmentStatus.AWAITING_PASSWORD_SETUP] },
      expiresAt: { lte: new Date() },
    },
    data: { status: EnrollmentStatus.EXPIRED },
  });
};

export const cancelEnrollment = async (
  data: { enrollmentId: number; actorUserId: number },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    const result = await tx.enrollment.updateMany({
      where: {
        id: data.enrollmentId,
        status: { notIn: [EnrollmentStatus.COMPLETED, EnrollmentStatus.CANCELLED] },
      },
      data: { status: EnrollmentStatus.CANCELLED },
    });
    if (result.count === 0) return result;
    await tx.userAuditEvent.create({
      data: {
        action: UserAuditAction.ENROLLMENT_CANCELLED,
        enrollmentId: data.enrollmentId,
        actorUserId: data.actorUserId,
      },
    });
    return result;
  });
};

export const resendSelfServiceOtp = async (
  data: { email: string; otpHash: string; otpExpiresAt: Date },
  db = defaultDb,
) => {
  const result = await db.enrollment.updateMany({
    where: {
      email: data.email,
      method: EnrollmentMethod.SELF_SERVICE,
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

export const createUserFromSelfServiceEnrollment = async (
  data: { email: string; otpHash: string },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: {
        email: data.email,
        method: EnrollmentMethod.SELF_SERVICE,
        status: EnrollmentStatus.AWAITING_OTP,
        expiresAt: { gt: new Date() },
        otpExpiresAt: { gt: new Date() },
        otpHash: data.otpHash,
        passwordHash: { not: null },
      },
    });

    if (!enrollment || !enrollment.passwordHash) return null;

    const claimed = await tx.enrollment.updateMany({
      where: {
        id: enrollment.id,
        status: EnrollmentStatus.AWAITING_OTP,
        otpHash: data.otpHash,
        passwordHash: { not: null },
      },
      data: {
        status: EnrollmentStatus.COMPLETED,
        passwordHash: null,
        otpHash: null,
        otpExpiresAt: null,
      },
    });
    if (claimed.count === 0) return null;

    const user = await tx.user.create({
      data: {
        email: enrollment.email,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        password: enrollment.passwordHash,
        role: enrollment.role,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    await tx.userAuditEvent.create({
      data: {
        action: UserAuditAction.ENROLLMENT_COMPLETED,
        enrollmentId: enrollment.id,
        subjectUserId: user.id,
        detail: "SELF_SERVICE",
      },
    });

    return user;
  });
};

