import { db as defaultDb } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { deleteProfileImageFromUrl, getR2PublicUrl } from "@/features/products/services/r2.service";

export const searchMembers = async (query: string, limit = 10, db = defaultDb) => {
  const term = query.trim();
  if (!term) return [];

  return await db.user.findMany({
    where: {
      role: UserRole.MEMBER,
      isActive: true,
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    take: limit,
  });
};

export const findMemberById = async (id: number, db = defaultDb) => {
  const member = await db.user.findFirst({
    where: { id, role: UserRole.MEMBER },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      userMotors: {
        select: {
          motor: {
            select: { id: true, model: true, motorBrand: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!member) return null;
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    vehicles: member.userMotors.map(({ motor }) => ({
      id: motor.id,
      label: `${motor.motorBrand.name} ${motor.model}`,
    })),
  };
};

export const findAllUsers = async (db = defaultDb) => {
  return await db.user.findMany({
    select: {
      id: true,
      role: true,
      phone: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      userInfo: { select: { photoUrl: true } },
      authSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserProfile = async (userId: number, db = defaultDb) => {
  const [user, orderStats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        userInfo: true,
        userMotors: {
          include: {
            motor: {
              include: { motorBrand: true },
            },
          },
        },
      },
    }),
    db.order.aggregate({
      where: {
        memberId: userId,
        status: "COMPLETED",
      },
      _count: { id: true },
      _sum: { finalTotal: true },
    }),
  ]);

  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    userInfo: user.userInfo,
    userMotors: user.userMotors,
    stats: {
      totalVisits: orderStats._count.id || 0,
      totalSpent: Number(orderStats._sum.finalTotal) || 0,
    },
  };
};

export const getUserAccountProfile = async (userId: number, db = defaultDb) => {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      userInfo: {
        select: { photoUrl: true },
      },
    },
  });
};

export const getStaffProfile = async (userId: number, db = defaultDb) => {
  const profile = await db.user.findUnique({
    where: { id: userId, role: UserRole.STAFF },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      emailChangeOtpLastSentAt: true,
      emailChangeRequest: {
        select: { newEmail: true, otpExpiresAt: true, otpAttempts: true },
      },
      userInfo: { select: { photoUrl: true } },
    },
  });
  if (!profile) return null;

  const now = Date.now();
  const pendingEmailChange = profile.emailChangeRequest;
  const emailChangeRequest = pendingEmailChange && pendingEmailChange.otpExpiresAt.getTime() > now
    ? pendingEmailChange
    : null;
  const emailResendCooldownSeconds = profile.emailChangeOtpLastSentAt
    ? Math.max(0, Math.ceil((profile.emailChangeOtpLastSentAt.getTime() + 60_000 - now) / 1000))
    : 0;
  const emailChangeExpiresSeconds = emailChangeRequest
    ? Math.max(0, Math.ceil((emailChangeRequest.otpExpiresAt.getTime() - now) / 1000))
    : 0;

  return { ...profile, emailChangeRequest, emailResendCooldownSeconds, emailChangeExpiresSeconds };
};

export const getAdminProfile = async (userId: number, db = defaultDb) => {
  const profile = await db.user.findUnique({
    where: { id: userId, role: UserRole.ADMIN },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      emailChangeOtpLastSentAt: true,
      emailChangeRequest: {
        select: { newEmail: true, otpExpiresAt: true, otpAttempts: true },
      },
      userInfo: { select: { photoUrl: true } },
    },
  });
  if (!profile) return null;

  const now = Date.now();
  const pendingEmailChange = profile.emailChangeRequest;
  const emailChangeRequest = pendingEmailChange && pendingEmailChange.otpExpiresAt.getTime() > now
    ? pendingEmailChange
    : null;
  const emailResendCooldownSeconds = profile.emailChangeOtpLastSentAt
    ? Math.max(0, Math.ceil((profile.emailChangeOtpLastSentAt.getTime() + 60_000 - now) / 1000))
    : 0;

  return { ...profile, emailChangeRequest, emailResendCooldownSeconds };
};

export const updateUserProfile = async (
  data: { userId: number; firstName?: string; lastName?: string; phone?: string | null; photoKey?: string | null },
  db = defaultDb,
) => {
  const photoUrl = data.photoKey === undefined
    ? undefined
    : data.photoKey === null
      ? null
      : getR2PublicUrl(data.photoKey);

  const oldPhoto = photoUrl !== undefined
    ? await db.userInfo.findUnique({ where: { userId: data.userId }, select: { photoUrl: true } })
    : null;

  await db.$transaction(async (tx) => {
    if (data.firstName !== undefined || data.lastName !== undefined || data.phone !== undefined) {
      await tx.user.update({
        where: { id: data.userId },
        data: {
          ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
          ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
        },
      });
    }

    if (photoUrl !== undefined) {
      await tx.userInfo.upsert({
        where: { userId: data.userId },
        create: { userId: data.userId, photoUrl },
        update: { photoUrl },
      });
    }
  });

  if (oldPhoto?.photoUrl && photoUrl !== undefined && oldPhoto.photoUrl !== photoUrl) {
    try { await deleteProfileImageFromUrl(oldPhoto.photoUrl); } catch { /* Keep the database update successful if storage cleanup fails. */ }
  }
};

export const deleteUserProfilePhoto = async (userId: number, db = defaultDb) => {
  const oldPhoto = await db.userInfo.findUnique({ where: { userId }, select: { photoUrl: true } });
  if (!oldPhoto?.photoUrl) return;

  await db.userInfo.update({ where: { userId }, data: { photoUrl: null } });
  try { await deleteProfileImageFromUrl(oldPhoto.photoUrl); } catch { /* The profile is cleared even if storage cleanup fails. */ }
};

export const updateAdminProfile = updateUserProfile;
export const deleteAdminProfilePhoto = deleteUserProfilePhoto;
