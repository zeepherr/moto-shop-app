import { db as defaultDb } from "@/lib/db";
import type { CreateMotorBrandInput, UpdateMotorBrandInput } from "../schemas";

export const findAllBrands = async (
  options: { isActive?: boolean; search?: string } = {},
  db = defaultDb,
) => {
  return await db.motorBrand.findMany({
    where: {
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(options.search && {
        name: { contains: options.search, mode: "insensitive" },
      }),
    },
    include: {
      _count: {
        select: { motors: true },
      },
    },
    orderBy: { name: "asc" },
  });
};

export const findBrandById = async (id: number, db = defaultDb) => {
  return await db.motorBrand.findUnique({
    where: { id },
  });
};

export const findBrandByName = async (name: string, db = defaultDb) => {
  return await db.motorBrand.findUnique({
    where: { name },
  });
};

export const createBrand = async (data: CreateMotorBrandInput, db = defaultDb) => {
  return await db.motorBrand.create({
    data: { name: data.name },
  });
};

export const updateBrand = async (
  id: number,
  data: UpdateMotorBrandInput,
  db = defaultDb,
) => {
  return await db.motorBrand.update({
    where: { id },
    data,
  });
};

export const deleteBrand = async (id: number, db = defaultDb) => {
  return await db.motorBrand.delete({
    where: { id },
  });
};
