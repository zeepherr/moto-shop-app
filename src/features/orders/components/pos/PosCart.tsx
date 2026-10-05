"use client";

import React from "react";
import { Clock3, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PosCustomerSelector } from "./PosCustomerSelector";
import { PosCartItem } from "./CartItem";
import { PosPayment } from "./PosPayment";
import { PosCartActions } from "./PosCartAction";
import { PendingOrders } from "./PendingOrders";
import { PosReceiptDialog } from "./PosReceiptDialog";
import type { PaymentMethod } from "@prisma/client";
import { ORDER_CANCELLATION_REASONS } from "../../constants/cancellation-reasons";
import { usePosCartController } from "./usePosCartController";

interface PosCheckoutPanelProps {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  totalDue: number;
  productDiscountRate: number;
  appliedDiscountRate: number;
  hasMember: boolean;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  receivedAmount: string;
  onReceivedAmountChange: (value: string) => void;
  changeAmount: number;
  isQrPaymentConfirmed: boolean;
  onQrPaymentConfirmationChange: (confirmed: boolean) => void;
  isPaymentRequired: boolean;
  hasItems: boolean;
  isPending: boolean;
  canComplete: boolean;
  isEditingPending: boolean;
  onHold: () => void;
  onClear: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

function PosCheckoutPanel({
  itemCount,
  subtotal,
  discountAmount,
  totalDue,
  productDiscountRate,
  appliedDiscountRate,
  hasMember,
  paymentMethod,
  onPaymentMethodChange,
  receivedAmount,
  onReceivedAmountChange,
  changeAmount,
  isQrPaymentConfirmed,
  onQrPaymentConfirmationChange,
  isPaymentRequired,
  hasItems,
  isPending,
  canComplete,
  isEditingPending,
  onHold,
  onClear,
  onComplete,
  onCancel,
}: PosCheckoutPanelProps) {
  return (
    <div className="shrink-0 lg:max-2xl:col-start-2 lg:max-2xl:row-span-2 lg:max-2xl:row-start-1 lg:max-2xl:overflow-y-auto lg:max-2xl:border-l lg:max-2xl:border-border/60">
      <div className="border-b border-border/60 px-3 py-2 lg:px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Items</span>
            <span className="font-semibold text-foreground">{itemCount}</span>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm font-semibold text-foreground">
                ฿{subtotal.toLocaleString()}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-baseline justify-end gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <span>Product discount ({appliedDiscountRate}%)</span>
                <span>−฿{discountAmount.toLocaleString()}</span>
              </div>
            )}
            {productDiscountRate > 0 && (
              <p className="text-xs text-muted-foreground">
                {hasMember
                  ? `Member discount: ${productDiscountRate}% on products`
                  : `Product discount ${productDiscountRate}% is for members only`}
              </p>
            )}
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-xs font-medium text-muted-foreground">Total due</span>
              <span className="text-lg font-bold text-foreground">
                ฿{totalDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <PosPayment
        paymentMethod={paymentMethod}
        setPaymentMethod={onPaymentMethodChange}
        receivedAmount={receivedAmount}
        setReceivedAmount={onReceivedAmountChange}
        subtotal={totalDue}
        changeAmount={changeAmount}
        isQrPaymentConfirmed={isQrPaymentConfirmed}
        isPaymentRequired={isPaymentRequired}
        onQrPaymentConfirmationChange={onQrPaymentConfirmationChange}
      />
      <PosCartActions
        hasItems={hasItems}
        isPending={isPending}
        canComplete={canComplete}
        onHold={onHold}
        onClear={onClear}
        onComplete={onComplete}
        isEditingPending={isEditingPending}
        onCancel={onCancel}
      />
    </div>
  );
}

interface CancelOrderDialogProps {
  open: boolean;
  isPending: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
  onKeepOrder: () => void;
  onConfirmCancel: () => void;
}

function CancelOrderDialog({
  open,
  isPending,
  reason,
  onReasonChange,
  onOpenChange,
  onKeepOrder,
  onConfirmCancel,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-pos-modal="true" className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Cancel pending order?</DialogTitle>
          <DialogDescription>
            This held ticket will be marked cancelled. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <label className="mb-2 block text-sm font-medium" htmlFor="current-cancel-reason">
          Reason for cancellation
        </label>
        <Select
          id="current-cancel-reason"
          value={reason}
          onValueChange={onReasonChange}
          className="mb-4 h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
          placeholder="Select a reason"
          options={[
            { value: "", label: "Select a reason" },
            ...ORDER_CANCELLATION_REASONS.map((cancellationReason) => ({
              value: cancellationReason,
              label: cancellationReason,
            })),
          ]}
        />
        <DialogFooter className="flex-col-reverse space-x-0 sm:flex-row sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onKeepOrder}
            className="min-h-11 w-full sm:w-auto"
          >
            Keep order
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !reason}
            onClick={onConfirmCancel}
            className="min-h-11 w-full sm:w-auto"
          >
            {isPending ? "Cancelling…" : "Cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const PosCart: React.FC<{ productDiscountRate: number }> = ({ productDiscountRate }) => {
  const controller = usePosCartController(productDiscountRate);
  const {
    cartItems,
    selectedMember,
    pendingOrderId,
    itemCount,
    hasItems,
    subtotal,
    discountAmount,
    appliedDiscountRate,
    totalDue,
    canComplete,
    changeAmount,
    isQrPaymentConfirmed,
    paymentMethod,
    setPaymentMethod,
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
  } = controller;

  return (
    <>
    <aside className="mt-1.5 flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm sm:mt-4 lg:mt-0 lg:h-full lg:min-h-0 2xl:mt-4 lg:max-2xl:grid lg:max-2xl:grid-cols-[minmax(0,1fr)_minmax(18rem,27rem)] lg:max-2xl:grid-rows-[auto_minmax(0,1fr)]">
      <div className="shrink-0 lg:max-2xl:col-start-1 lg:max-2xl:row-start-1">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 p-3 lg:p-4">
          <div>
            <h2 className="font-semibold text-foreground text-sm lg:text-base">Current Order</h2>
            <p className="text-xs text-muted-foreground">
              {pendingOrderId ? `Editing ticket #${pendingOrderId}` : "New sale"}
            </p>
          </div>

          <Sheet open={isPendingSheetOpen} onOpenChange={setIsPendingSheetOpen}>
            <SheetTrigger
              render={<Button type="button" variant="outline" size="sm" />}
              className="gap-2 cursor-pointer h-11 text-xs font-medium"
            >
              <Clock3 className="size-3.5 text-muted-foreground" />
              Pending
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Pending Orders</SheetTitle>
                <SheetDescription>Search recent held tickets to resume or cancel one.</SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <PendingOrders onSelectOrder={selectPendingOrder} onCancelOrder={cancelOrder} isSelecting={isLoadingPendingOrder} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <PosCustomerSelector />
      </div>

      <div className="min-h-28 max-h-[35dvh] overflow-y-auto border-b border-border/60 p-3 scrollbar-none lg:min-h-0 lg:max-h-none lg:flex-1 lg:p-4 lg:max-2xl:col-start-1 lg:max-2xl:row-start-2">
        {cartItems.length === 0 ? (
          <div className="flex h-full min-h-36 flex-col items-center justify-center text-center lg:min-h-0">
            <ShoppingCart className="mb-2 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add a product or service to begin.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cartItems.map((item) => (
              <PosCartItem key={`${item.itemType}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <PosCheckoutPanel
        itemCount={itemCount}
        subtotal={subtotal}
        discountAmount={discountAmount}
        totalDue={totalDue}
        productDiscountRate={productDiscountRate}
        appliedDiscountRate={appliedDiscountRate}
        hasMember={Boolean(selectedMember)}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={(method) => {
          setPaymentMethod(method);
          setQrConfirmedAmount(null);
        }}
        receivedAmount={receivedAmount}
        onReceivedAmountChange={setReceivedAmount}
        changeAmount={changeAmount}
        isQrPaymentConfirmed={isQrPaymentConfirmed}
        onQrPaymentConfirmationChange={(confirmed) =>
          setQrConfirmedAmount(confirmed ? totalDue : null)
        }
        isPaymentRequired={totalDue > 0}
        hasItems={hasItems}
        isPending={isActionPending}
        canComplete={canComplete}
        isEditingPending={Boolean(pendingOrderId)}
        onHold={holdOrder}
        onClear={clearOrder}
        onComplete={completeSale}
        onCancel={() => {
          setCancelReason("");
          setIsCancelConfirmOpen(true);
        }}
      />
    </aside>
    <CancelOrderDialog
      open={isCancelConfirmOpen}
      isPending={isActionPending}
      reason={cancelReason}
      onReasonChange={setCancelReason}
      onOpenChange={(open) => !isActionPending && setIsCancelConfirmOpen(open)}
      onKeepOrder={() => {
        setIsCancelConfirmOpen(false);
        setCancelReason("");
      }}
      onConfirmCancel={cancelCurrentOrder}
    />
    <PosReceiptDialog receipt={receipt} onOpenChange={(open) => !open && setReceipt(null)} />
    </>
  );
};
