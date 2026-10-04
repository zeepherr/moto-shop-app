import { OrderItemType, PaymentMethod } from "@prisma/client";
import type { PosCartItem, SelectedMember } from "../types";
import type { CheckoutOrderInput, HoldOrderInput } from "../schemas";

export const productToCartItem = (product: {
  id: number;
  name: string;
  sellingPrice: number | string | { toString: () => string };
  stockQuantity: number;
  imageKey?: string | null;
  imageUrl?: string | null;
}): PosCartItem => {
  const price = Number(product.sellingPrice);
  return {
    id: product.id,
    itemType: OrderItemType.PRODUCT,
    name: product.name,
    price,
    unitPrice: price,
    quantity: 1,
    maxQuantity: Math.max(Number(product.stockQuantity) || 0, 0),
    imageKey: product.imageKey || null,
  };
};

export const serviceToCartItem = (service: {
  id: number;
  name: string;
  price: number | string | { toString: () => string };
}): PosCartItem => {
  const price = Number(service.price);
  return {
    id: service.id,
    itemType: OrderItemType.SERVICE,
    name: service.name,
    price,
    unitPrice: price,
    quantity: 1,
    maxQuantity: null,
  };
};

export const buildCheckoutPayload = ({
  cartItems,
  selectedMember,
  selectedMotorId,
  paymentMethod,
  receivedAmount,
  pendingOrderId,
  discountRate,
}: {
  cartItems: PosCartItem[];
  selectedMember?: SelectedMember | null;
  selectedMotorId?: number | null;
  paymentMethod: PaymentMethod | null;
  receivedAmount: number;
  pendingOrderId?: number | null;
  discountRate: number;
}): CheckoutOrderInput => {
  return {
    memberId: selectedMember?.id ?? null,
    motorId: selectedMember ? selectedMotorId ?? null : null,
    paymentMethod,
    receivedAmount,
    discountRate,
    pendingOrderId: pendingOrderId ?? null,
    items: cartItems.filter((item) => item.quantity > 0).map((item) => ({
      itemType: item.itemType,
      productId: item.itemType === OrderItemType.PRODUCT ? item.id : null,
      serviceId: item.itemType === OrderItemType.SERVICE ? item.id : null,
      quantity: item.quantity,
    })),
  };
};

export const buildHoldPayload = ({
  cartItems,
  selectedMember,
  selectedMotorId,
  pendingOrderId,
}: {
  cartItems: PosCartItem[];
  selectedMember?: SelectedMember | null;
  selectedMotorId?: number | null;
  pendingOrderId?: number | null;
}): HoldOrderInput => {
  return {
    orderId: pendingOrderId ?? null,
    memberId: selectedMember?.id ?? null,
    motorId: selectedMember ? selectedMotorId ?? null : null,
    items: cartItems.filter((item) => item.quantity > 0).map((item) => ({
      itemType: item.itemType,
      productId: item.itemType === OrderItemType.PRODUCT ? item.id : null,
      serviceId: item.itemType === OrderItemType.SERVICE ? item.id : null,
      quantity: item.quantity,
    })),
  };
};

export const pendingOrderToCartItems = (
  orderItems: Array<{
    itemType: OrderItemType;
    productId: number | null;
    serviceId: number | null;
    itemNameSnapshot: string;
    unitPrice: number | string | { toString: () => string };
    quantity: number;
    availableStock?: number | null;
  }> = [],
): PosCartItem[] => {
  return orderItems.map((item) => {
    const id = item.itemType === OrderItemType.PRODUCT ? item.productId! : item.serviceId!;
    const price = Number(item.unitPrice);
    const availableStock = item.itemType === OrderItemType.PRODUCT ? item.availableStock ?? null : null;
    return {
      id,
      itemType: item.itemType,
      name: item.itemNameSnapshot,
      price,
      unitPrice: price,
      quantity: availableStock === null ? item.quantity : Math.min(item.quantity, availableStock),
      maxQuantity: availableStock,
      stockLimited: availableStock !== null && availableStock < item.quantity,
    };
  });
};
