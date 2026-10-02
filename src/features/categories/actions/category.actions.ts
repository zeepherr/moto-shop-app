"use server";

import { revalidatePath } from "next/cache";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../schemas";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  findCategoryByName,
} from "../services/category.service";

export const createCategoryAction = async (input: CreateCategoryInput) => {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const existing = await findCategoryByName(parsed.data.name);
  if (existing) {
    return { success: false, error: "A category with this name already exists" };
  }

  const category = await createCategory(parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true, data: category };
};

export const updateCategoryAction = async (id: number, input: UpdateCategoryInput) => {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const category = await updateCategory(id, parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true, data: category };
};

export const deleteCategoryAction = async (id: number) => {
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, message: "Category deleted successfully" };
  } catch {
    return {
      success: false,
      error: "Cannot delete category because products are associated with it",
    };
  }
};
