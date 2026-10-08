"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { isAdminRole } from "@/features/auth/authorization";
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
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage categories." };
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const existing = await findCategoryByName(parsed.data.name);
    if (existing) {
      return { success: false, error: "A category with this name already exists" };
    }

    await createCategory(parsed.data);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the category. Please try again." };
  }
};

export const updateCategoryAction = async (id: number, input: UpdateCategoryInput) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage categories." };
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    if (parsed.data.name) {
      const existing = await findCategoryByName(parsed.data.name);
      if (existing && existing.id !== id) {
        return { success: false, error: "A category with this name already exists" };
      }
    }
    await updateCategory(id, parsed.data);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the category. Please try again." };
  }
};

export const deleteCategoryAction = async (id: number) => {
  if (!isAdminRole((await getCurrentUser())?.role)) return { success: false, error: "Only administrators can manage categories." };
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
