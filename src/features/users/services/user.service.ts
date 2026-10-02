import { db as defaultDb } from "@/lib/db";
import { UserRole } from "@prisma/client";

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
  return await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      userMotors: {
        include: {
          motor: {
            include: { motorBrand: true },
          },
        },
      },
    },
  });
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
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserRole = async (userId: number, role: UserRole, db = defaultDb) => {
  return await db.user.update({
    where: { id: userId },
    data: { role },
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
