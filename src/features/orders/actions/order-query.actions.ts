"use server";

import { getCurrentUser } from "@/features/auth/actions/session.action";
import { findPendingOrders, findOrderById } from "../services/order.service";

export const getPendingOrdersAction = async () => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const orders = await findPendingOrders();
    return { success: true, data: orders };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to load pending orders" };
  }
};

export const getOrderByIdAction = async (orderId: number) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const order = await findOrderById(orderId);
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: order };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to load order" };
  }
};
