"use client";

import React from "react";
import { Banknote, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@prisma/client";

interface PosPaymentProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  receivedAmount: string;
  setReceivedAmount: (amount: string) => void;
  subtotal: number;
  changeAmount: number;
  isQrPaymentConfirmed: boolean;
  onQrPaymentConfirmationChange: (confirmed: boolean) => void;
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
}) => {
  return (
    <div className="border-b border-border/60 px-3 py-2 lg:px-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Payment Method</p>
        <p className="text-[11px] text-muted-foreground">Select method</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={paymentMethod === PaymentMethod.CASH ? "default" : "outline"}
          onClick={() => setPaymentMethod(PaymentMethod.CASH)}
          className="h-11 cursor-pointer gap-2"
        >
          <Banknote className="size-4" />
          Cash
        </Button>

        <Button
          type="button"
          size="sm"
          variant={paymentMethod === PaymentMethod.QR ? "default" : "outline"}
          onClick={() => {
            setPaymentMethod(PaymentMethod.QR);
            setReceivedAmount("");
          }}
          className="h-11 cursor-pointer gap-2"
        >
          <QrCode className="size-4" />
          QR PromptPay
        </Button>
      </div>

      {paymentMethod === PaymentMethod.CASH && (
        <div className="mt-2.5 flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Received (฿)
            </label>
            <Input
              type="number"
              min="0"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              placeholder="0"
              className="h-11 text-sm"
            />
          </div>

          <div className="shrink-0 pb-1 text-right">
            <p className="text-[11px] text-muted-foreground">Change</p>
            <p className="text-base font-semibold text-primary">
              ฿{changeAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {paymentMethod === PaymentMethod.QR && (
        <div className="mt-2.5 space-y-2 rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Verify the transfer in your payment app</span>
            <span className="shrink-0 text-sm font-semibold text-foreground">฿{subtotal.toLocaleString()}</span>
          </div>
          <Button
            type="button"
            variant={isQrPaymentConfirmed ? "default" : "outline"}
            onClick={() => onQrPaymentConfirmationChange(!isQrPaymentConfirmed)}
            className="h-11 w-full gap-2"
          >
            <CheckCircle2 className="size-4" />
            {isQrPaymentConfirmed ? "Payment received" : "Confirm payment received"}
          </Button>
        </div>
      )}
    </div>
  );
};
