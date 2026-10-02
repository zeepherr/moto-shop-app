"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "../schemas";
import {
  createService,
  updateService,
  deleteService,
  findServiceByName,
} from "../services/motoService.service";

export const createServiceAction = async (input: CreateServiceInput) => {
  const parsed = createServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const existing = await findServiceByName(parsed.data.name);
  if (existing) {
    return { success: false, error: "A service with this name already exists" };
  }

  const service = await createService(parsed.data);
  revalidatePath("/admin/services");
  revalidatePath("/admin/pos");
  return { success: true, data: service };
};

export const updateServiceAction = async (id: number, input: UpdateServiceInput) => {
  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const service = await updateService(id, parsed.data);
  revalidatePath("/admin/services");
  revalidatePath("/admin/pos");
  return { success: true, data: service };
};

export const deleteServiceAction = async (id: number) => {
  try {
    await deleteService(id);
    revalidatePath("/admin/services");
    revalidatePath("/admin/pos");
    return { success: true, message: "Service deleted successfully" };
  } catch {
    return {
      success: false,
      error: "Cannot delete service because it is linked to past orders",
    };
  }
};
