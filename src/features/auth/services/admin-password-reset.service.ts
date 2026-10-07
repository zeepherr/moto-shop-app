import { UserAuditAction, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export const claimAdminPasswordReset = async (
  data: { userId: number; otpHash: string; otpExpiresAt: Date; cooldownMs: number; now?: Date },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const cutoff = new Date(now.getTime() - data.cooldownMs);
  const sendSlot = await tx.user.updateMany({
    where: {
      id: data.userId,
      role: UserRole.ADMIN,
      isActive: true,
      OR: [
        { passwordResetOtpLastSentAt: null },
        { passwordResetOtpLastSentAt: { lte: cutoff } },
      ],
    },
    data: { passwordResetOtpLastSentAt: now },
  });

  if (sendSlot.count !== 1) return false;

  await tx.adminPasswordResetRequest.upsert({
    where: { userId: data.userId },
    create: {
      userId: data.userId,
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
    },
    update: {
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
    },
  });

  return true;
});

export const findAdminPasswordResetRequest = async (userId: number, db = defaultDb) =>
  db.adminPasswordResetRequest.findUnique({ where: { userId } });

export const removeAdminPasswordResetRequest = async (userId: number, otpHash?: string, db = defaultDb) =>
  db.adminPasswordResetRequest.deleteMany({ where: { userId, ...(otpHash ? { otpHash } : {}) } });

export const incrementAdminPasswordResetAttempts = async (userId: number, db = defaultDb) =>
  db.adminPasswordResetRequest.updateMany({
    where: { userId, otpAttempts: { lt: 5 } },
    data: { otpAttempts: { increment: 1 } },
  });

export const completeAdminPasswordReset = async (
  data: {
    userId: number;
    otpHash: string;
    passwordHash: string;
    action?: UserAuditAction;
    detail?: string;
    now?: Date;
  },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const request = await tx.adminPasswordResetRequest.findUnique({ where: { userId: data.userId } });
  if (!request || request.otpHash !== data.otpHash || request.otpExpiresAt <= now || request.otpAttempts >= 5) return false;

  const claim = await tx.adminPasswordResetRequest.deleteMany({
    where: {
      userId: data.userId,
      otpHash: data.otpHash,
      otpExpiresAt: { gt: now },
      otpAttempts: { lt: 5 },
    },
  });
  if (claim.count !== 1) return false;

  const updated = await tx.user.updateMany({
    where: { id: data.userId, role: UserRole.ADMIN, isActive: true },
    data: { password: data.passwordHash, passwordResetOtpLastSentAt: null },
  });
  if (updated.count !== 1) return false;

  await tx.authSession.updateMany({
    where: { userId: data.userId, revokedAt: null },
    data: { revokedAt: now },
  });
  await tx.userAuditEvent.create({
    data: {
      action: data.action ?? UserAuditAction.USER_PASSWORD_RESET,
      subjectUserId: data.userId,
      detail: data.detail ?? "Administrator password reset after OTP verification",
    },
  });

  return true;
});
