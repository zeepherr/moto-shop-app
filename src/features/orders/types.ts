import type { OrderStatus, PaymentMethod, CustomerType, OrderItemType, Prisma } from "@prisma/client";

export interface PosCartItem {
  id: number;
  itemType: OrderItemType;
  name: string;
  price: number;
  quantity: number;
  maxQuantity?: number;
  imageKey?: string | null;
}

export interface SelectedMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export interface OrderItemDTO {
  id: number;
  orderId: number;
  productId: number | null;
  serviceId: number | null;
  itemType: OrderItemType;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  lineTotal: number | string | Prisma.Decimal;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  memberId: number | null;
  handledById: number;
  motorId: number | null;
  customerType: CustomerType;
  subtotal: number | string | Prisma.Decimal;
  discountRate: number | string | Prisma.Decimal;
  discountAmount: number | string | Prisma.Decimal;
  finalTotal: number | string | Prisma.Decimal;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  receivedAmount: number | string | Prisma.Decimal | null;
  createdAt: Date;
  completedAt: Date | null;
  orderItems: OrderItemDTO[];
  member?: SelectedMember | null;
}
