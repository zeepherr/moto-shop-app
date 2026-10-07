import { UserAuditAction, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export const changeAdminPasswordWithCurrentPassword = async (
  data: { userId: number; currentPasswordHash: string; passwordHash: string },
  db = defaultDb,
) => db.$transaction(async (tx) => {
  const changed = await tx.user.updateMany({
    where: {
      id: data.userId,
      role: UserRole.ADMIN,
      isActive: true,
      password: data.currentPasswordHash,
    },
    data: { password: data.passwordHash, passwordResetOtpLastSentAt: null },
  });
  if (changed.count !== 1) return false;

  await tx.adminPasswordResetRequest.deleteMany({ where: { userId: data.userId } });
  await tx.authSession.updateMany({
    where: { userId: data.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await tx.userAuditEvent.create({
    data: {
      action: UserAuditAction.USER_PASSWORD_CHANGED,
      actorUserId: data.userId,
      subjectUserId: data.userId,
      detail: "Administrator password changed after current-password verification",
    },
  });

  return true;
});
