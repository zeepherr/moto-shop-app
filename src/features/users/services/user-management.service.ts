import { db as defaultDb } from "@/lib/db";
import { UserAuditAction, UserRole } from "@prisma/client";

export const getUserManagementDetail = async (userId: number, db = defaultDb) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      userInfo: { select: { photoUrl: true } },
      userMotors: { select: { id: true } },
      auditEventsAsSubject: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          action: true,
          detail: true,
          createdAt: true,
          actor: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
  if (!user) return null;
  const enrollmentQuery = user.email
    ? db.enrollment.findMany({
        where: { email: user.email },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          auditEvents: {
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              action: true,
              detail: true,
              createdAt: true,
              actor: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      })
    : Promise.resolve([]);
  const [completedOrders, enrollments] = await Promise.all([
    db.order.count({ where: { memberId: user.id, status: "COMPLETED" } }),
    enrollmentQuery,
  ]);

  // Enrollment events have no subject user, so merge them with user events for one account timeline.
  const enrollmentEvents = enrollments.flatMap((enrollment) => enrollment.auditEvents);
  const events = [...user.auditEventsAsSubject, ...enrollmentEvents]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 16);

  return {
    ...user,
    completedOrders,
    motorcycleCount: user.userMotors.length,
    events,
  };
};

export const updateUserRole = async (data: { userId: number; role: UserRole; actorUserId: number }, db = defaultDb) => {
  return await db.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id: data.userId }, select: { id: true, role: true } });
    if (!current) throw new Error("User not found");
    const user = await tx.user.update({ where: { id: data.userId }, data: { role: data.role } });
    await tx.authSession.updateMany({ where: { userId: data.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.userAuditEvent.create({ data: { action: UserAuditAction.USER_ROLE_CHANGED, actorUserId: data.actorUserId, subjectUserId: data.userId, detail: `${current.role}:${data.role}` } });
    return user;
  });
};

export const updateUserAccess = async (data: { userId: number; isActive: boolean; actorUserId: number }, db = defaultDb) => {
  return await db.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id: data.userId }, select: { id: true, isActive: true } });
    if (!current) throw new Error("User not found");
    const user = await tx.user.update({ where: { id: data.userId }, data: { isActive: data.isActive } });
    await tx.authSession.updateMany({ where: { userId: data.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.userAuditEvent.create({ data: { action: data.isActive ? UserAuditAction.USER_REACTIVATED : UserAuditAction.USER_DEACTIVATED, actorUserId: data.actorUserId, subjectUserId: data.userId, detail: current.isActive === data.isActive ? "UNCHANGED" : undefined } });
    return user;
  });
};
