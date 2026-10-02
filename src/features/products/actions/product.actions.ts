"use server";

import { revalidatePath } from "next/cache";
import {
  createProductSchema,
  updateProductSchema,
  presignedUrlSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type PresignedUrlInput,
} from "../schemas";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  findProductById,
} from "../services/product.service";
import { createPresignedUploadUrl, deleteImageFromR2 } from "../services/r2.service";

export const getPresignedUploadUrlAction = async (input: PresignedUrlInput) => {
  const parsed = presignedUrlSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const result = await createPresignedUploadUrl(parsed.data.fileName, parsed.data.contentType);
  return { success: true, data: result };
};

export const createProductAction = async (input: CreateProductInput) => {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const product = await createProduct(parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/admin/pos");
  return { success: true, data: product };
};

export const updateProductAction = async (id: number, input: UpdateProductInput) => {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const product = await updateProduct(id, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/admin/pos");
  return { success: true, data: product };
};

export const deleteProductAction = async (id: number) => {
  const existing = await findProductById(id);
  if (!existing) return { success: false, error: "Product not found" };

  if (existing.imageKey) {
    try {
      await deleteImageFromR2(existing.imageKey);
    } catch {
      // ignore storage cleanup error if already missing
    }
  }

  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/pos");
  return { success: true, message: "Product deleted successfully" };
};
