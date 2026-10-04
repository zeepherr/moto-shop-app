"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { productDiscountRateSchema } from "../schemas/discount-setting.schema";
import { getProductDiscountRate, setProductDiscountRate } from "../services/discount-setting.service";

export async function updateProductDiscountRateAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return { success: false, error: "Only admins can update the product discount." };
  }

  const parsed = productDiscountRateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid discount percentage" };
  }

  try {
    await setProductDiscountRate(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    return { success: true, rate: await getProductDiscountRate() };
  } catch {
    return { success: false, error: "Could not save the product discount." };
  }
}
