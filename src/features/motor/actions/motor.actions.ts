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
  const existing = await findBrandByName(parsed.data.name);
  if (existing) {
    return { success: false, error: "A brand with this name already exists" };
  }
  const brand = await createBrand(parsed.data);
  revalidatePath("/admin/motor-brands");
  revalidatePath("/admin/motors");
  return { success: true, data: brand };
};

export const updateBrandAction = async (id: number, input: UpdateMotorBrandInput) => {
  const parsed = updateMotorBrandSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const brand = await updateBrand(id, parsed.data);
  revalidatePath("/admin/motor-brands");
  return { success: true, data: brand };
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
  const motor = await createMotor(parsed.data);
  revalidatePath("/admin/motors");
  return { success: true, data: motor };
};

export const updateMotorAction = async (id: number, input: UpdateMotorInput) => {
  const parsed = updateMotorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const motor = await updateMotor(id, parsed.data);
  revalidatePath("/admin/motors");
  return { success: true, data: motor };
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
