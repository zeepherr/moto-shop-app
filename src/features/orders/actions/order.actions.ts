"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import {
  checkoutOrderSchema,
  holdOrderSchema,
  type CheckoutOrderInput,
  type HoldOrderInput,
} from "../schemas";
import {
  executeCheckoutTx,
  holdPendingOrder,
  cancelPendingOrder,
} from "../services/order.service";

export const checkoutOrderAction = async (input: CheckoutOrderInput) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = checkoutOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const order = await executeCheckoutTx({
      ...parsed.data,
      handledById: user.id,
    });

    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    revalidatePath("/admin/products");
    return { success: true, data: order };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Checkout failed" };
  }
};

export const holdOrderAction = async (input: HoldOrderInput) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = holdOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const order = await holdPendingOrder({
      ...parsed.data,
      handledById: user.id,
    });

    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    return { success: true, data: order };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to hold order" };
  }
};

export const cancelPendingOrderAction = async (orderId: number) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  await cancelPendingOrder(orderId);
  revalidatePath("/admin/pos");
  revalidatePath("/staff/pos");
  return { success: true, message: "Order cancelled successfully" };
};
