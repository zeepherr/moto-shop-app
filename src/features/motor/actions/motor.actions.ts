"use server";

import { revalidatePath } from "next/cache";
import {
  createMotorBrandSchema,
  updateMotorBrandSchema,
  createMotorSchema,
  updateMotorSchema,
  type CreateMotorBrandInput,
  type UpdateMotorBrandInput,
  type CreateMotorInput,
  type UpdateMotorInput,
} from "../schemas";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  findBrandByName,
} from "../services/motorBrand.service";
import { createMotor, updateMotor, deleteMotor } from "../services/motor.service";

export const createBrandAction = async (input: CreateMotorBrandInput) => {
  const parsed = createMotorBrandSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  try {
    const existing = await findBrandByName(parsed.data.name);
    if (existing) return { success: false, error: "A brand with this name already exists" };
    await createBrand(parsed.data);
    revalidatePath("/admin/motor-brands");
    revalidatePath("/admin/motors");
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the brand. Please try again." };
  }
};

export const updateBrandAction = async (id: number, input: UpdateMotorBrandInput) => {
  const parsed = updateMotorBrandSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  try {
    if (parsed.data.name) {
      const existing = await findBrandByName(parsed.data.name);
      if (existing && existing.id !== id) {
        return { success: false, error: "A brand with this name already exists" };
      }
    }
    await updateBrand(id, parsed.data);
    revalidatePath("/admin/motor-brands");
    revalidatePath("/admin/motors");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the brand. Please try again." };
  }
};

export const deleteBrandAction = async (id: number) => {
  try {
    await deleteBrand(id);
    revalidatePath("/admin/motor-brands");
    return { success: true, message: "Brand deleted successfully" };
  } catch {
    return {
      success: false,
      error: "Cannot delete brand because models are associated with it",
    };
  }
};

export const createMotorAction = async (input: CreateMotorInput) => {
  const parsed = createMotorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  try {
    await createMotor(parsed.data);
    revalidatePath("/admin/motors");
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the motorcycle model. Check for a duplicate model." };
  }
};

export const updateMotorAction = async (id: number, input: UpdateMotorInput) => {
  const parsed = updateMotorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  try {
    await updateMotor(id, parsed.data);
    revalidatePath("/admin/motors");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the motorcycle model. Check for a duplicate model." };
  }
};

export const deleteMotorAction = async (id: number) => {
  try {
    await deleteMotor(id);
    revalidatePath("/admin/motors");
    return { success: true, message: "Motorcycle model deleted successfully" };
  } catch {
    return {
      success: false,
      error: "Cannot delete model because it is associated with orders or users",
    };
  }
};
