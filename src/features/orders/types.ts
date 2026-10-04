import type { OrderStatus, PaymentMethod, CustomerType, OrderItemType } from "@prisma/client";

export interface PosCartItem {
  id: number;
  itemType: OrderItemType;
  name: string;
  price: number;
  unitPrice?: number;
  quantity: number;
  maxQuantity?: number | null;
  stockLimited?: boolean;
  imageKey?: string | null;
}

export interface SelectedMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  vehicles?: SelectedMotor[];
}

export interface SelectedMotor {
  id: number;
  label: string;
}

export interface OrderItemDTO {
  id: number;
  orderId: number;
  productId: number | null;
  serviceId: number | null;
  itemType: OrderItemType;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  availableStock?: number | null;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  memberId: number | null;
  handledById: number;
  motorId: number | null;
  customerType: CustomerType;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  receivedAmount: number | null;
  createdAt: string;
  completedAt: string | null;
  orderItems: OrderItemDTO[];
  member?: SelectedMember | null;
}

export interface CheckoutReceipt {
  orderNumber: string;
  completedAt: string;
  customerName: string;
  vehicleLabel: string | null;
  paymentMethod: PaymentMethod | null;
  items: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  total: number;
  receivedAmount: number;
}
