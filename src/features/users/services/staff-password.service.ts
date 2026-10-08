import { UserAuditAction, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export const changeStaffPasswordWithCurrentPassword = async (
  data: { userId: number; currentPasswordHash: string; passwordHash: string },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = new Date();
  const changed = await tx.user.updateMany({
    where: {
      id: data.userId,
      role: UserRole.STAFF,
      isActive: true,
      password: data.currentPasswordHash,
    },
    data: { password: data.passwordHash, passwordResetOtpLastSentAt: null },
  });
  if (changed.count !== 1) return false;

  await tx.adminPasswordResetRequest.deleteMany({ where: { userId: data.userId } });
  await tx.authSession.updateMany({
    where: { userId: data.userId, revokedAt: null },
    data: { revokedAt: now },
  });
  await tx.userAuditEvent.create({
    data: {
      action: UserAuditAction.USER_PASSWORD_CHANGED,
      actorUserId: data.userId,
      subjectUserId: data.userId,
      detail: "Staff password changed after current-password verification",
    },
  });
  return true;
});

export const claimStaffPasswordChangeOtp = async (
  data: { userId: number; otpHash: string; otpExpiresAt: Date; cooldownMs: number; now?: Date },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const sendSlot = await tx.user.updateMany({
    where: {
      id: data.userId,
      role: UserRole.STAFF,
      isActive: true,
      OR: [
        { passwordResetOtpLastSentAt: null },
        { passwordResetOtpLastSentAt: { lte: new Date(now.getTime() - data.cooldownMs) } },
      ],
    },
    data: { passwordResetOtpLastSentAt: now },
  });
  if (sendSlot.count !== 1) return false;

  await tx.adminPasswordResetRequest.upsert({
    where: { userId: data.userId },
    create: { userId: data.userId, otpHash: data.otpHash, otpExpiresAt: data.otpExpiresAt, otpAttempts: 0 },
    update: { otpHash: data.otpHash, otpExpiresAt: data.otpExpiresAt, otpAttempts: 0 },
  });
  return true;
});

export const findStaffPasswordChangeOtp = async (userId: number, db = defaultDb) =>
  db.adminPasswordResetRequest.findUnique({ where: { userId } });

export const removeStaffPasswordChangeOtp = async (userId: number, otpHash?: string, db = defaultDb) =>
  db.adminPasswordResetRequest.deleteMany({ where: { userId, ...(otpHash ? { otpHash } : {}) } });

export const incrementStaffPasswordChangeOtpAttempts = async (userId: number, db = defaultDb) =>
  db.adminPasswordResetRequest.updateMany({ where: { userId, otpAttempts: { lt: 5 } }, data: { otpAttempts: { increment: 1 } } });

export const completeStaffPasswordChangeWithOtp = async (
  data: { userId: number; otpHash: string; passwordHash: string; now?: Date },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const request = await tx.adminPasswordResetRequest.findUnique({ where: { userId: data.userId } });
  if (!request || request.otpHash !== data.otpHash || request.otpExpiresAt <= now || request.otpAttempts >= 5) return false;

  const claim = await tx.adminPasswordResetRequest.deleteMany({
    where: { userId: data.userId, otpHash: data.otpHash, otpExpiresAt: { gt: now }, otpAttempts: { lt: 5 } },
  });
  if (claim.count !== 1) return false;

  const updated = await tx.user.updateMany({
    where: { id: data.userId, role: UserRole.STAFF, isActive: true },
    data: { password: data.passwordHash, passwordResetOtpLastSentAt: null },
  });
  if (updated.count !== 1) throw new Error("Staff password update was not applied.");

  await tx.authSession.updateMany({ where: { userId: data.userId, revokedAt: null }, data: { revokedAt: now } });
  await tx.userAuditEvent.create({
    data: {
      action: UserAuditAction.USER_PASSWORD_CHANGED,
      actorUserId: data.userId,
      subjectUserId: data.userId,
      detail: "Staff password changed after email OTP verification",
    },
  });
  return true;
});
