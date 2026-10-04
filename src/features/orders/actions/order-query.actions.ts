"use server";

import { findPendingOrders, findOrderById } from "../services/order.service";
import type { CustomerType, OrderItemType, OrderStatus, PaymentMethod } from "@prisma/client";
import type { SelectedMember } from "../types";
import { getPosOperator } from "./pos-auth";

type OrderForClient = {
  id: number;
  orderNumber: string;
  memberId: number | null;
  handledById: number;
  motorId: number | null;
  customerType: CustomerType;
  subtotal: { toString: () => string } | number;
  discountRate: { toString: () => string } | number;
  discountAmount: { toString: () => string } | number;
  finalTotal: { toString: () => string } | number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  receivedAmount: { toString: () => string } | number | null;
  createdAt: Date;
  completedAt: Date | null;
  member: SelectedMember | null;
  orderItems: Array<{
    id: number;
    orderId: number;
    productId: number | null;
    serviceId: number | null;
    itemType: OrderItemType;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: { toString: () => string } | number;
    lineTotal: { toString: () => string } | number;
    product?: { stockQuantity: number; isActive: boolean } | null;
  }>;
};

const serializeOrder = (order: OrderForClient) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  memberId: order.memberId,
  handledById: order.handledById,
  motorId: order.motorId,
  customerType: order.customerType,
  subtotal: Number(order.subtotal),
  discountRate: Number(order.discountRate),
  discountAmount: Number(order.discountAmount),
  finalTotal: Number(order.finalTotal),
  status: order.status,
  paymentMethod: order.paymentMethod,
  receivedAmount: order.receivedAmount === null ? null : Number(order.receivedAmount),
  createdAt: order.createdAt.toISOString(),
  completedAt: order.completedAt?.toISOString() ?? null,
  member: order.member
    ? {
        id: order.member.id,
        firstName: order.member.firstName,
        lastName: order.member.lastName,
        email: order.member.email,
        phone: order.member.phone,
      }
    : null,
  orderItems: order.orderItems.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    serviceId: item.serviceId,
    itemType: item.itemType,
    itemNameSnapshot: item.itemNameSnapshot,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
    availableStock: item.product ? (item.product.isActive ? item.product.stockQuantity : 0) : null,
  })),
});

export const getPendingOrdersAction = async () => {
  const user = await getPosOperator();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const orders = await findPendingOrders();
    return { success: true, data: orders.map(serializeOrder) };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to load pending orders" };
  }
};

export const getOrderByIdAction = async (orderId: number) => {
  const user = await getPosOperator();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const order = await findOrderById(orderId);
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: serializeOrder(order) };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to load order" };
  }
};
