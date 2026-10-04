"use server";

import { revalidatePath } from "next/cache";
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
import { getPosOperator } from "./pos-auth";

export const checkoutOrderAction = async (input: CheckoutOrderInput) => {
  const user = await getPosOperator();
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
    if (!order) throw new Error("Completed order could not be loaded");

    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    revalidatePath("/admin/products");
    return {
      success: true,
      data: {
        orderNumber: order.orderNumber,
        completedAt: order.completedAt?.toISOString() ?? new Date().toISOString(),
        customerName: order.member ? `${order.member.firstName} ${order.member.lastName}`.trim() : "Guest customer",
        vehicleLabel: order.motor ? `${order.motor.motorBrand.name} ${order.motor.model}` : null,
        paymentMethod: order.paymentMethod,
        items: order.orderItems.map((item) => ({
          name: item.itemNameSnapshot,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
        subtotal: Number(order.subtotal),
        total: Number(order.finalTotal),
        receivedAmount: Number(order.receivedAmount ?? order.finalTotal),
      },
    };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Checkout failed" };
  }
};

export const holdOrderAction = async (input: HoldOrderInput) => {
  const user = await getPosOperator();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = holdOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    await holdPendingOrder({
      ...parsed.data,
      handledById: user.id,
    });

    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to hold order" };
  }
};

export const cancelPendingOrderAction = async (orderId: number) => {
  const user = await getPosOperator();
  if (!user) return { success: false, error: "Unauthorized" };

  const result = await cancelPendingOrder(orderId);
  if (result.count === 0) {
    return { success: false, error: "Pending order is no longer available" };
  }
  revalidatePath("/admin/pos");
  revalidatePath("/staff/pos");
  return { success: true, message: "Order cancelled successfully" };
};
