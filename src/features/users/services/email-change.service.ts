import { UserAuditAction } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export const findEmailChangeRequest = async (userId: number, db = defaultDb) =>
  db.emailChangeRequest.findUnique({ where: { userId } });

export const claimEmailChangeRequest = async (
  data: { userId: number; newEmail: string; otpHash: string; otpExpiresAt: Date; now?: Date; cooldownMs: number },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const cooldownCutoff = new Date(now.getTime() - data.cooldownMs);
  const sendSlot = await tx.user.updateMany({
    where: {
      id: data.userId,
      OR: [
        { emailChangeOtpLastSentAt: null },
        { emailChangeOtpLastSentAt: { lte: cooldownCutoff } },
      ],
    },
    data: { emailChangeOtpLastSentAt: now },
  });

  if (sendSlot.count !== 1) {
    const user = await tx.user.findUnique({ where: { id: data.userId }, select: { emailChangeOtpLastSentAt: true } });
    return {
      status: "cooldown" as const,
      resendAvailableAt: user?.emailChangeOtpLastSentAt
        ? new Date(user.emailChangeOtpLastSentAt.getTime() + data.cooldownMs)
        : now,
    };
  }

  await tx.emailChangeRequest.upsert({
    where: { userId: data.userId },
    create: {
      userId: data.userId,
      newEmail: data.newEmail,
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
    },
    update: {
      newEmail: data.newEmail,
      otpHash: data.otpHash,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: 0,
    },
  });
  return { status: "claimed" as const };
});

export const incrementEmailChangeAttempts = async (userId: number, db = defaultDb) =>
  db.emailChangeRequest.updateMany({
    where: { userId, otpAttempts: { lt: 5 } },
    data: { otpAttempts: { increment: 1 } },
  });

export const removeEmailChangeRequest = async (userId: number, otpHash?: string, db = defaultDb) =>
  db.emailChangeRequest.deleteMany({ where: { userId, ...(otpHash ? { otpHash } : {}) } });

export const completeEmailChange = async (
  data: { userId: number; otpHash: string; now?: Date },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const now = data.now ?? new Date();
  const request = await tx.emailChangeRequest.findUnique({ where: { userId: data.userId } });
  if (!request || request.otpHash !== data.otpHash || request.otpExpiresAt <= now || request.otpAttempts >= 5) return null;

  const claim = await tx.emailChangeRequest.deleteMany({
    where: { userId: data.userId, otpHash: data.otpHash, otpExpiresAt: { gt: now }, otpAttempts: { lt: 5 } },
  });
  if (claim.count !== 1) return null;

  const user = await tx.user.update({
    where: { id: data.userId },
    data: { email: request.newEmail, emailVerifiedAt: now },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
  await tx.authSession.updateMany({ where: { userId: data.userId, revokedAt: null }, data: { revokedAt: now } });
  await tx.userAuditEvent.create({
    data: {
      action: UserAuditAction.USER_EMAIL_CHANGED,
      actorUserId: data.userId,
      subjectUserId: data.userId,
      detail: "Email changed after OTP verification",
    },
  });
  return user;
});
