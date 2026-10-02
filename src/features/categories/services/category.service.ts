import { db as defaultDb } from "@/lib/db";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas";

export const findAllCategories = async (
  options: { isActive?: boolean; search?: string } = {},
  db = defaultDb,
) => {
  return await db.productCategory.findMany({
    where: {
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(options.search && {
        name: { contains: options.search, mode: "insensitive" },
      }),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
};

export const findCategoryById = async (id: number, db = defaultDb) => {
  return await db.productCategory.findUnique({
    where: { id },
  });
};

export const findCategoryByName = async (name: string, db = defaultDb) => {
  return await db.productCategory.findUnique({
    where: { name },
  });
};

export const createCategory = async (data: CreateCategoryInput, db = defaultDb) => {
  return await db.productCategory.create({
    data: { name: data.name },
  });
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryInput,
  db = defaultDb,
) => {
  return await db.productCategory.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: number, db = defaultDb) => {
  return await db.productCategory.delete({
    where: { id },
  });
};
