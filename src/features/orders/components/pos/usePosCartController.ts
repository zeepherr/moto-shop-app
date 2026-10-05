"use client";

import { useState } from "react";
import type { PaymentMethod } from "@prisma/client";
import { toast } from "sonner";
import { getMemberByIdAction } from "@/features/users/actions/user.actions";
import {
  cancelPendingOrderAction,
  checkoutOrderAction,
  holdOrderAction,
} from "../../actions/order.actions";
import { getOrderByIdAction } from "../../actions/order-query.actions";
import { buildCheckoutPayload, buildHoldPayload, pendingOrderToCartItems } from "../../utils/cart.util";
import type { CheckoutReceipt, OrderDTO } from "../../types";
import { usePosStore } from "../../stores/usePosStore";

export function usePosCartController(productDiscountRate: number) {
  const cartItems = usePosStore((store) => store.cartItems);
  const selectedMember = usePosStore((store) => store.selectedMember);
  const selectedMotorId = usePosStore((store) => store.selectedMotorId);
  const pendingOrderId = usePosStore((store) => store.pendingOrderId);
  const setCartItems = usePosStore((store) => store.setCartItems);
  const setSelectedMember = usePosStore((store) => store.setSelectedMember);
  const setSelectedMotorId = usePosStore((store) => store.setSelectedMotorId);
  const setPendingOrderId = usePosStore((store) => store.setPendingOrderId);
  const resetOrder = usePosStore((store) => store.resetOrder);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isLoadingPendingOrder, setIsLoadingPendingOrder] = useState(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [qrConfirmedAmount, setQrConfirmedAmount] = useState<number | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const totals = cartItems.reduce(
    (result, item) => {
      const lineTotal = (item.unitPrice ?? item.price) * item.quantity;
      result.itemCount += item.quantity;
      result.hasItems ||= item.quantity > 0;
      if (item.itemType === "PRODUCT") result.productSubtotal += lineTotal;
      else result.serviceSubtotal += lineTotal;
      return result;
    },
    { itemCount: 0, productSubtotal: 0, serviceSubtotal: 0, hasItems: false },
  );
  const subtotal = totals.productSubtotal + totals.serviceSubtotal;
  const appliedDiscountRate = selectedMember ? productDiscountRate : 0;
  const discountAmount = Math.min(
    Math.round((totals.productSubtotal * appliedDiscountRate) / 100 * 100) / 100,
    totals.productSubtotal,
  );
  const totalDue = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const isQrPaymentConfirmed = qrConfirmedAmount === totalDue && qrConfirmedAmount !== null;
  const numReceived = Number(receivedAmount) || 0;
  const canComplete = totals.hasItems && (totalDue === 0 || (paymentMethod === "QR"
    ? isQrPaymentConfirmed
    : numReceived >= totalDue));
  const changeAmount = paymentMethod === "CASH" ? Math.max(numReceived - totalDue, 0) : 0;

  const withActionPending = async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsActionPending(true);
    try {
      return await action();
    } finally {
      setIsActionPending(false);
    }
  };

  const clearOrder = () => {
    resetOrder();
    setPaymentMethod("CASH");
    setReceivedAmount("");
    setQrConfirmedAmount(null);
  };

  const holdOrder = async () => {
    if (!totals.hasItems) return;
    await withActionPending(async () => {
      const payload = buildHoldPayload({ cartItems, selectedMember, selectedMotorId, pendingOrderId });
      const result = await holdOrderAction(payload);
      if (result.success) {
        toast.success(pendingOrderId ? "Pending order updated" : "Order held successfully");
        clearOrder();
      } else {
        toast.error(result.error || "Failed to hold order");
      }
    });
  };

  const completeSale = async () => {
    if (!canComplete) return;
    await withActionPending(async () => {
      const finalReceived = totalDue === 0 ? 0 : paymentMethod === "QR" ? totalDue : numReceived;
      const payload = buildCheckoutPayload({
        cartItems,
        selectedMember,
        selectedMotorId,
        paymentMethod: totalDue === 0 ? null : paymentMethod,
        receivedAmount: finalReceived,
        pendingOrderId,
        discountRate: productDiscountRate,
      });
      const result = await checkoutOrderAction(payload);
      if (result.success) {
        toast.success("Order completed successfully!");
        clearOrder();
        if ("data" in result && result.data) setReceipt(result.data);
      } else {
        toast.error(result.error || "Checkout failed");
      }
    });
  };

  const cancelOrder = (orderId: number, reason: string) =>
    withActionPending(async () => {
      const result = await cancelPendingOrderAction({ orderId, reason });
      if (result.success) {
        toast.success("Order cancelled");
        if (orderId === pendingOrderId) clearOrder();
        return true;
      }
      toast.error(result.error || "Failed to cancel order");
      return false;
    });

  const cancelCurrentOrder = async () => {
    if (!pendingOrderId) return;
    if (await cancelOrder(pendingOrderId, cancelReason)) {
      setIsCancelConfirmOpen(false);
      setCancelReason("");
    }
  };

  const selectPendingOrder = async (orderId: number) => {
    setIsLoadingPendingOrder(true);
    setIsActionPending(true);
    try {
      const result = await getOrderByIdAction(orderId);
      if (!result.success || !result.data) {
        toast.error("Failed to load order");
        return;
      }

      const order: OrderDTO = result.data;
      let member = order.member ?? null;
      if (order.memberId) {
        const memberResult = await getMemberByIdAction(order.memberId);
        if (!memberResult.success || !("data" in memberResult) || !memberResult.data) {
          toast.error(memberResult.error || "Unable to load the customer linked to this order.");
          return;
        }
        member = memberResult.data;
      }

      setCartItems(pendingOrderToCartItems(order.orderItems));
      setSelectedMember(member);
      setSelectedMotorId(order.motorId);
      setPaymentMethod(order.paymentMethod || "CASH");
      setQrConfirmedAmount(null);
      setReceivedAmount("");
      setPendingOrderId(order.id);
      setIsPendingSheetOpen(false);
    } finally {
      setIsActionPending(false);
      setIsLoadingPendingOrder(false);
    }
  };

  return {
    cartItems,
    selectedMember,
    pendingOrderId,
    itemCount: totals.itemCount,
    hasItems: totals.hasItems,
    subtotal,
    discountAmount,
    appliedDiscountRate,
    totalDue,
    canComplete,
    changeAmount,
    isQrPaymentConfirmed,
    paymentMethod,
    setPaymentMethod: (method: PaymentMethod) => {
      setPaymentMethod(method);
      setQrConfirmedAmount(null);
    },
    receivedAmount,
    setReceivedAmount,
    setQrConfirmedAmount,
    isPendingSheetOpen,
    setIsPendingSheetOpen,
    isActionPending,
    isLoadingPendingOrder,
    receipt,
    setReceipt,
    isCancelConfirmOpen,
    setIsCancelConfirmOpen,
    cancelReason,
    setCancelReason,
    clearOrder,
    holdOrder,
    completeSale,
    cancelOrder,
    cancelCurrentOrder,
    selectPendingOrder,
  };
}
