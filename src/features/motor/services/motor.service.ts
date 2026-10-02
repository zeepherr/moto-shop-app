import { db as defaultDb } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CreateMotorInput, UpdateMotorInput } from "../schemas";

export const findAllMotors = async (
  options: { brandId?: number; isActive?: boolean; search?: string } = {},
  db = defaultDb,
) => {
  const where: Prisma.MotorWhereInput = {};

  if (options.isActive !== undefined) where.isActive = options.isActive;
  if (options.brandId) where.motorBrandId = options.brandId;
  if (options.search) {
    where.model = { contains: options.search, mode: "insensitive" };
  }

  return await db.motor.findMany({
    where,
    include: {
      motorBrand: {
        select: { id: true, name: true },
      },
    },
    orderBy: { model: "asc" },
  });
};

export const findMotorById = async (id: number, db = defaultDb) => {
  return await db.motor.findUnique({
    where: { id },
    include: {
      motorBrand: {
        select: { id: true, name: true },
      },
    },
  });
};

export const createMotor = async (data: CreateMotorInput, db = defaultDb) => {
  return await db.motor.create({
    data: {
      model: data.model,
      motorBrandId: data.motorBrandId,
      type: data.type,
    },
    include: {
      motorBrand: {
        select: { id: true, name: true },
      },
    },
  });
};

export const updateMotor = async (
  id: number,
  data: UpdateMotorInput,
  db = defaultDb,
) => {
  return await db.motor.update({
    where: { id },
    data,
    include: {
      motorBrand: {
        select: { id: true, name: true },
      },
    },
  });
};

export const deleteMotor = async (id: number, db = defaultDb) => {
  return await db.motor.delete({
    where: { id },
  });
};
