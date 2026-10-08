import { db as defaultDb } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { deleteProfileImageFromUrl, getR2PublicUrl } from "@/features/products/services/r2.service";
import { getBoundedPageWindow } from "@/lib/pagination";

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
          licensePlate: true,
          motor: {
            select: { id: true, model: true, type: true, motorBrand: { select: { name: true } } },
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
    vehicles: member.userMotors.map(({ motor, licensePlate }) => ({
      id: motor.id,
      label: `${motor.motorBrand.name} ${motor.model}`,
      licensePlate,
    })),
  };
};

export interface UserListOptions {
  skip?: number;
  take?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const findAllUsers = async (options: UserListOptions = {}, db = defaultDb) => {
  const term = options.search?.trim();
  const page = getBoundedPageWindow(options.skip ?? 0, options.take ?? 50);
  return await db.user.findMany({
    where: {
      ...(options.role && { role: options.role }),
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(term && { OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
      ] }),
    },
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...page,
  });
};

export const countUsers = async (options: Omit<UserListOptions, "skip" | "take"> = {}, db = defaultDb) => {
  const term = options.search?.trim();
  return await db.user.count({
    where: {
      ...(options.role && { role: options.role }),
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(term && { OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
      ] }),
    },
  });
};

export const getUserRoleCounts = async (db = defaultDb) => {
  const groups = await db.user.groupBy({ by: ["role"], _count: { _all: true } });
  return {
    admin: groups.find(({ role }) => role === UserRole.ADMIN)?._count._all ?? 0,
    staff: groups.find(({ role }) => role === UserRole.STAFF)?._count._all ?? 0,
    member: groups.find(({ role }) => role === UserRole.MEMBER)?._count._all ?? 0,
  };
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

export const getMemberPortalProfile = async (userId: number, db = defaultDb) => {
  const [profile, completedOrderStats] = await Promise.all([db.user.findFirst({
    where: { id: userId, role: UserRole.MEMBER, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      emailVerifiedAt: true,
      emailChangeOtpLastSentAt: true,
      emailChangeRequest: { select: { newEmail: true, otpExpiresAt: true, otpAttempts: true } },
      userMotors: {
        orderBy: { createdAt: "desc" },
        select: {
          motorId: true,
          licensePlate: true,
          motor: { select: { model: true, type: true, motorBrand: { select: { name: true } } } },
        },
      },
      motorSuggestions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, brandName: true, model: true, type: true, status: true, createdAt: true, reviewNote: true },
      },
      memberOrders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          completedAt: true,
          finalTotal: true,
          motor: { select: { model: true, motorBrand: { select: { name: true } } } },
          orderItems: { select: { id: true, itemType: true, itemNameSnapshot: true, quantity: true, lineTotal: true } },
        },
      },
    },
  }), db.order.aggregate({
    where: { memberId: userId, status: "COMPLETED" },
    _count: { id: true },
    _sum: { finalTotal: true },
  })]);
  if (!profile) return null;

  const now = Date.now();
  const emailChangeRequest = profile.emailChangeRequest && profile.emailChangeRequest.otpExpiresAt.getTime() > now
    ? { ...profile.emailChangeRequest, otpExpiresAt: profile.emailChangeRequest.otpExpiresAt.toISOString() }
    : null;
  const emailResendCooldownSeconds = profile.emailChangeOtpLastSentAt
    ? Math.max(0, Math.ceil((profile.emailChangeOtpLastSentAt.getTime() + 60_000 - now) / 1000))
    : 0;

  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    createdAt: profile.createdAt.toISOString(),
    emailVerifiedAt: profile.emailVerifiedAt?.toISOString() ?? null,
    emailResendCooldownSeconds,
    emailChangeExpiresSeconds: emailChangeRequest
      ? Math.max(0, Math.ceil((new Date(emailChangeRequest.otpExpiresAt).getTime() - now) / 1000))
      : 0,
    emailChangeRequest,
    userMotors: profile.userMotors.map((entry) => ({
      motorId: entry.motorId,
      licensePlate: entry.licensePlate,
      motor: entry.motor,
    })),
    motorSuggestions: profile.motorSuggestions.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })),
    orders: profile.memberOrders.map((order) => ({
      ...order,
      finalTotal: Number(order.finalTotal),
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt?.toISOString() ?? null,
      orderItems: order.orderItems.map((item) => ({ ...item, lineTotal: Number(item.lineTotal) })),
    })),
    stats: {
      totalVisits: completedOrderStats._count.id,
      totalSpent: Number(completedOrderStats._sum.finalTotal ?? 0),
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
