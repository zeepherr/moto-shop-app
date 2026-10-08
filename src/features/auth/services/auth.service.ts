import { db as defaultDb } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { PENDING_REGISTRATION_RETENTION_MS } from "../constants";

export const findUserByEmail = async (email: string, db = defaultDb) => {
  return await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      phone: true,
      firstName: true,
      lastName: true,
      password: true,
      isActive: true,
      emailVerifiedAt: true,
    },
  });
};

export const savePendingRegistration = async (
  data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    otpHash: string;
    expiresAt: Date;
  },
  db = defaultDb,
) => {
  return await db.pendingRegistration.upsert({
    where: { email: data.email },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      otpHash: data.otpHash,
      expiresAt: data.expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    create: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      otpHash: data.otpHash,
      expiresAt: data.expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
  });
};

export const getPendingByEmail = async (email: string, db = defaultDb) => {
  return await db.pendingRegistration.findUnique({
    where: { email },
  });
};

export const updatePendingOtp = async (
  data: { email: string; otpHash: string; expiresAt: Date },
  db = defaultDb,
) => {
  return await db.pendingRegistration.update({
    where: { email: data.email },
    data: {
      otpHash: data.otpHash,
      expiresAt: data.expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
  });
};

export const addAttemptsPending = async (id: number, db = defaultDb) => {
  return await db.pendingRegistration.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
};

export const deletePendingById = async (id: number, db = defaultDb) => {
  return await db.pendingRegistration.delete({
    where: { id },
  });
};

export const createUserFromPending = async (
  pending: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
  },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: pending.email } });
    if (existing) {
      await tx.pendingRegistration.delete({ where: { id: pending.id } });
      throw new Error("This email is already registered");
    }

    const newUser = await tx.user.create({
      data: {
        email: pending.email,
        firstName: pending.firstName,
        lastName: pending.lastName,
        password: pending.passwordHash,
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

    await tx.pendingRegistration.delete({ where: { id: pending.id } });
    return newUser;
  });
};

export const createAuthSession = async (
  userId: number,
  refreshTokenHash: string,
  db = defaultDb,
) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return await db.authSession.create({
    data: {
      userId,
      refreshToken: refreshTokenHash,
      expiresAt,
    },
  });
};

export const findSessionByRefreshToken = async (
  refreshTokenHash: string,
  db = defaultDb,
) => {
  return await db.authSession.findUnique({
    where: { refreshToken: refreshTokenHash },
    include: { user: true },
  });
};

export const revokeSession = async (tokenHash: string, db = defaultDb) => {
  return await db.authSession.updateMany({
    where: { refreshToken: tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const cleanExpiredPending = async (db = defaultDb) => {
  const cutoff = new Date(Date.now() - PENDING_REGISTRATION_RETENTION_MS);
  return await db.pendingRegistration.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
};
