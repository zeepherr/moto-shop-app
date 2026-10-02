import { db as defaultDb } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CreateProductInput, UpdateProductInput } from "../schemas";

export const generateSku = (name: string): string => {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "ITEM";
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

export const findAllProducts = async (
  options: { categoryId?: number; isActive?: boolean; search?: string } = {},
  db = defaultDb,
) => {
  const where: Prisma.ProductWhereInput = {};

  if (options.isActive !== undefined) where.isActive = options.isActive;
  if (options.categoryId) where.productCategoryId = options.categoryId;
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { sku: { contains: options.search, mode: "insensitive" } },
    ];
  }

  return await db.product.findMany({
    where,
    include: {
      productCategory: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findProductById = async (id: number, db = defaultDb) => {
  return await db.product.findUnique({
    where: { id },
    include: {
      productCategory: {
        select: { id: true, name: true },
      },
    },
  });
};

export const createProduct = async (data: CreateProductInput, db = defaultDb) => {
  const sku = data.sku || generateSku(data.name);

  return await db.product.create({
    data: {
      name: data.name,
      sku,
      description: data.description,
      unit: data.unit,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      stockQuantity: data.stockQuantity ?? 0,
      productCategoryId: data.productCategoryId,
      imageKey: data.imageKey,
    },
    include: {
      productCategory: {
        select: { id: true, name: true },
      },
    },
  });
};

export const updateProduct = async (
  id: number,
  data: UpdateProductInput,
  db = defaultDb,
) => {
  return await db.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.sku && { sku: data.sku }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.unit && { unit: data.unit }),
      ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
      ...(data.sellingPrice !== undefined && { sellingPrice: data.sellingPrice }),
      ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
      ...(data.productCategoryId && { productCategoryId: data.productCategoryId }),
      ...(data.imageKey !== undefined && { imageKey: data.imageKey }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      productCategory: {
        select: { id: true, name: true },
      },
    },
  });
};

export const deleteProduct = async (id: number, db = defaultDb) => {
  return await db.product.delete({
    where: { id },
  });
};

export const decreaseProductStock = async (
  productId: number,
  quantity: number,
  db = defaultDb,
) => {
  return await db.product.updateMany({
    where: {
      id: productId,
      isActive: true,
      stockQuantity: { gte: quantity },
    },
    data: {
      stockQuantity: { decrement: quantity },
    },
  });
};
