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
