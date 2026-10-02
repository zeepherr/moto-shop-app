"use server";

import { revalidatePath } from "next/cache";
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

export const createProductAction = async (input: CreateProductInput) => {
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
  try {
    const existing = await findProductById(id);
    if (!existing) return { success: false, error: "Product not found" };

    if (existing.imageKey) {
      try {
        await deleteImageFromR2(existing.imageKey);
      } catch {
        // The database record can still be removed when storage cleanup fails.
      }
    }

    await deleteProduct(id);
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
