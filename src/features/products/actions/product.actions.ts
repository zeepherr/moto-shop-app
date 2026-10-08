"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "../schemas";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  findProductById,
} from "../services/product.service";
import { deleteImageFromR2 } from "../services/r2.service";
import { countProducts, findActiveProductBySku, findAllProducts } from "../services/product.service";
import { getR2PublicUrl } from "../services/r2.service";
import { isAdminRole, canUsePosRole } from "@/features/auth/authorization";
import { deleteProductThenCleanImage } from "../services/product-deletion";
import { getBoundedPageWindow } from "@/lib/pagination";

export const searchProductsAction = async (input: { search?: string; categoryId?: number; status?: "all" | "active" | "inactive"; skip?: number; sortBy?: "name" | "sellingPrice" | "stockQuantity"; sortDirection?: "asc" | "desc" }) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false as const, error: "Unauthorized" };
  const search = typeof input?.search === "string" ? input.search.trim().slice(0, 100) : "";
  const categoryId = Number.isSafeInteger(input?.categoryId) && Number(input.categoryId) > 0 ? Number(input.categoryId) : undefined;
  const status = input?.status === "active" || input?.status === "inactive" ? input.status : "all";
  const isActive = status === "all" ? undefined : status === "active";
  const { skip } = getBoundedPageWindow(Number(input?.skip) || 0, 50);
  const sortBy = input?.sortBy === "sellingPrice" || input?.sortBy === "stockQuantity" ? input.sortBy : "name";
  const sortDirection = input?.sortDirection === "desc" ? "desc" : "asc";
  const [rows, total, activeCount, inactiveCount] = await Promise.all([
    findAllProducts({ search, categoryId, isActive, skip, take: 50, sortBy, sortDirection }),
    countProducts({ search, categoryId, isActive }),
    countProducts({ search, categoryId, isActive: true }),
    countProducts({ search, categoryId, isActive: false }),
  ]);
  return { success: true as const, total, activeCount, inactiveCount, data: rows.map((p) => ({
    id: p.id, productCategoryId: p.productCategoryId, sku: p.sku, name: p.name,
    description: p.description, costPrice: Number(p.costPrice), sellingPrice: Number(p.sellingPrice),
    stockQuantity: p.stockQuantity, unit: p.unit, imageKey: p.imageKey,
    imageUrl: p.imageKey ? getR2PublicUrl(p.imageKey) : null, isActive: p.isActive,
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(), productCategory: p.productCategory,
  })) };
};

export const searchPosProductsAction = async (input: { search?: string; categoryId?: number }) => {
  const user = await getCurrentUser();
  if (!user || !canUsePosRole(user.role)) return { success: false as const, error: "Unauthorized" };
  const search = typeof input?.search === "string" ? input.search.trim().slice(0, 100) : "";
  const categoryId = Number.isSafeInteger(input?.categoryId) && Number(input.categoryId) > 0 ? Number(input.categoryId) : undefined;
  const rows = await findAllProducts({ isActive: true, search, categoryId, take: 50 });
  return { success: true as const, data: rows.map((p) => ({
    id: p.id, sku: p.sku, name: p.name, sellingPrice: Number(p.sellingPrice),
    stockQuantity: p.stockQuantity, unit: p.unit, imageKey: p.imageKey,
    imageUrl: p.imageKey ? getR2PublicUrl(p.imageKey) : null,
    productCategoryId: p.productCategoryId, productCategory: p.productCategory,
  })) };
};

export const findPosProductBySkuAction = async (sku: string) => {
  const user = await getCurrentUser();
  if (!user || !canUsePosRole(user.role)) return { success: false as const, error: "Unauthorized" };
  const normalizedSku = typeof sku === "string" ? sku.trim().slice(0, 80) : "";
  if (!normalizedSku) return { success: true as const, data: null };
  const product = await findActiveProductBySku(normalizedSku);
  if (!product) return { success: true as const, data: null };
  return { success: true as const, data: {
    id: product.id, sku: product.sku, name: product.name, sellingPrice: Number(product.sellingPrice),
    stockQuantity: product.stockQuantity, unit: product.unit, imageKey: product.imageKey,
    imageUrl: product.imageKey ? getR2PublicUrl(product.imageKey) : null,
    productCategoryId: product.productCategoryId, productCategory: product.productCategory,
  } };
};

export const createProductAction = async (input: CreateProductInput) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage products." };
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    await createProduct(parsed.data);
    revalidateProductPages();
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the product. Check that the SKU is unique." };
  }
};

export const updateProductAction = async (id: number, input: UpdateProductInput) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage products." };
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    await updateProduct(id, parsed.data);
    revalidateProductPages();
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the product. Check that the SKU is unique." };
  }
};

export const deleteProductAction = async (id: number) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage products." };
  try {
    const existing = await findProductById(id);
    if (!existing) return { success: false, error: "Product not found" };

    await deleteProductThenCleanImage(
      () => deleteProduct(id),
      () => existing.imageKey ? deleteImageFromR2(existing.imageKey) : Promise.resolve(),
    );
    revalidateProductPages();
    return { success: true, message: "Product deleted successfully" };
  } catch {
    return { success: false, error: "Cannot delete this product because it is linked to existing orders." };
  }
};

function revalidateProductPages() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/pos");
  revalidatePath("/staff/pos");
}
