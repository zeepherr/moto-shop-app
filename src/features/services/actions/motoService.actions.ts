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

  try {
    const existing = await findServiceByName(parsed.data.name);
    if (existing) {
      return { success: false, error: "A service with this name already exists" };
    }
    await createService(parsed.data);
    revalidateServicePages();
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the service. Please try again." };
  }
};

export const updateServiceAction = async (id: number, input: UpdateServiceInput) => {
  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    if (parsed.data.name) {
      const existing = await findServiceByName(parsed.data.name);
      if (existing && existing.id !== id) {
        return { success: false, error: "A service with this name already exists" };
      }
    }
    await updateService(id, parsed.data);
    revalidateServicePages();
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the service. Please try again." };
  }
};

export const deleteServiceAction = async (id: number) => {
  try {
    await deleteService(id);
    revalidateServicePages();
    return { success: true, message: "Service deleted successfully" };
  } catch {
    return {
      success: false,
      error: "Cannot delete service because it is linked to past orders",
    };
  }
};

function revalidateServicePages() {
  revalidatePath("/admin/services");
  revalidatePath("/admin/pos");
  revalidatePath("/staff/services");
  revalidatePath("/staff/pos");
}
