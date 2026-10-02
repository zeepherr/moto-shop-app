import { db as defaultDb } from "@/lib/db";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas";

export const findAllServices = async (
  options: { isActive?: boolean; search?: string } = {},
  db = defaultDb,
) => {
  return await db.service.findMany({
    where: {
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(options.search && {
        name: { contains: options.search, mode: "insensitive" },
      }),
    },
    orderBy: { name: "asc" },
  });
};

export const findServiceById = async (id: number, db = defaultDb) => {
  return await db.service.findUnique({
    where: { id },
  });
};

export const findServiceByName = async (name: string, db = defaultDb) => {
  return await db.service.findUnique({
    where: { name },
  });
};

export const createService = async (data: CreateServiceInput, db = defaultDb) => {
  return await db.service.create({
    data,
  });
};

export const updateService = async (
  id: number,
  data: UpdateServiceInput,
  db = defaultDb,
) => {
  return await db.service.update({
    where: { id },
    data,
  });
};

export const deleteService = async (id: number, db = defaultDb) => {
  return await db.service.delete({
    where: { id },
  });
};
