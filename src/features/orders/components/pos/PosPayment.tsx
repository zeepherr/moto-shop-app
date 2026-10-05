"use client";

import React from "react";
import { Banknote, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "@prisma/client";

interface PosPaymentProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  receivedAmount: string;
  setReceivedAmount: (amount: string) => void;
  subtotal: number;
  changeAmount: number;
  isQrPaymentConfirmed: boolean;
  onQrPaymentConfirmationChange: (confirmed: boolean) => void;
  isPaymentRequired?: boolean;
}

export const PosPayment: React.FC<PosPaymentProps> = ({
  paymentMethod,
  setPaymentMethod,
  receivedAmount,
  setReceivedAmount,
  subtotal,
  changeAmount,
  isQrPaymentConfirmed,
  onQrPaymentConfirmationChange,
  isPaymentRequired = true,
}) => {
  return (
    <div className="pos-payment-panel border-b border-border/60 px-3 py-3 lg:px-4 lg:py-2">
      {!isPaymentRequired ? (
        <p className="rounded-lg bg-muted/50 px-3 py-3 text-sm font-medium text-foreground">No payment due after the product discount.</p>
      ) : <>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Payment method</p>
        <p className="text-xs text-muted-foreground">Choose one</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={paymentMethod === "CASH" ? "default" : "outline"}
          onClick={() => setPaymentMethod("CASH")}
          className="h-12 cursor-pointer gap-2 text-sm"
        >
          <Banknote className="size-4" />
          Cash
        </Button>

        <Button
          type="button"
          size="sm"
          variant={paymentMethod === "QR" ? "default" : "outline"}
          onClick={() => {
            setPaymentMethod("QR");
            setReceivedAmount("");
          }}
          className="h-12 cursor-pointer gap-2 text-sm"
        >
          <QrCode className="size-4" />
          QR PromptPay
        </Button>
      </div>

      {paymentMethod === "CASH" && (
        <div className="mt-2.5 flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Received amount (฿)
            </label>
            <Input
              type="number"
              min="0"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              placeholder="0"
              className="h-12 text-base"
            />
          </div>

          <div className="shrink-0 pb-1 text-right">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className="text-base font-semibold tabular-nums text-primary">
              ฿{changeAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {paymentMethod === "QR" && (
        <div className="mt-2.5 space-y-2 rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Verify the transfer in your payment app</span>
            <span className="shrink-0 text-sm font-semibold text-foreground">฿{subtotal.toLocaleString()}</span>
          </div>
          <Button
            type="button"
            variant={isQrPaymentConfirmed ? "default" : "outline"}
            onClick={() => onQrPaymentConfirmationChange(!isQrPaymentConfirmed)}
            className="h-12 w-full gap-2 text-sm"
          >
            <CheckCircle2 className="size-4" />
            {isQrPaymentConfirmed ? "Payment received" : "Confirm payment received"}
          </Button>
        </div>
      )}
      </>}
    </div>
  );
};
