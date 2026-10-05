"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { CheckoutReceipt } from "../../types";
import { money, openReceiptPrintWindow } from "../../utils/receipt-print";

interface PosReceiptDialogProps {
  receipt: CheckoutReceipt | null;
  onOpenChange: (open: boolean) => void;
}

export function PosReceiptDialog({ receipt, onOpenChange }: PosReceiptDialogProps) {
  const handlePrint = () => {
    if (!receipt) return;
    if (!openReceiptPrintWindow(receipt)) {
      toast.error("Printing was blocked. Allow pop-ups for this site, then try again.");
    }
  };

  return (
    <Dialog open={receipt !== null} onOpenChange={onOpenChange}>
      <DialogContent data-pos-modal="true" className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle>Sale completed</DialogTitle>
          <DialogDescription>Review or print the customer receipt.</DialogDescription>
        </DialogHeader>
        {receipt && <>
          <div className="mb-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" onClick={handlePrint} className="gap-2"><Printer className="size-4" />Print receipt</Button>
          </div>
          <section aria-label="Completed sale receipt" className="space-y-4 rounded-xl border border-border/70 bg-background p-3 text-foreground sm:space-y-5 sm:p-5">
            <header className="border-b border-border/60 pb-4 text-center">
              <p className="text-lg font-semibold">HrungMoto</p>
              <p className="text-sm text-muted-foreground">Sales receipt</p>
              <p className="mt-3 text-xs text-muted-foreground">Order {receipt.orderNumber}</p>
              <p className="text-xs text-muted-foreground">{new Date(receipt.completedAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" })}</p>
            </header>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Customer: </span>{receipt.customerName}</p>
              {receipt.vehicleLabel && <p><span className="text-muted-foreground">Motorcycle: </span>{receipt.vehicleLabel}</p>}
              <p><span className="text-muted-foreground">Payment: </span>{receipt.paymentMethod ?? "No payment due"}</p>
            </div>
            <table className="w-full table-fixed text-xs sm:text-sm">
              <thead><tr className="border-b border-border/60 text-left text-xs text-muted-foreground"><th scope="col" className="py-2">Item</th><th scope="col" className="py-2 text-center">Qty</th><th scope="col" className="py-2 text-right">Amount</th></tr></thead>
              <tbody>{receipt.items.map((item, index) => <tr className="border-b border-border/40" key={`${item.name}-${index}`}><th scope="row" className="py-2 text-left font-normal">{item.name}<span className="block text-xs text-muted-foreground">{money(item.unitPrice)} each</span></th><td className="py-2 text-center tabular-nums">{item.quantity}</td><td className="py-2 text-right tabular-nums">{money(item.lineTotal)}</td></tr>)}</tbody>
            </table>
            <dl className="ml-auto max-w-52 space-y-1 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(receipt.subtotal)}</dd></div>{receipt.discountAmount > 0 && <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400"><dt>Products discount ({receipt.discountRate}%)</dt><dd>−{money(receipt.discountAmount)}</dd></div>}<div className="flex justify-between border-t border-border/60 pt-2 font-semibold"><dt>Total</dt><dd>{money(receipt.total)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Received</dt><dd>{money(receipt.receivedAmount)}</dd></div>{receipt.paymentMethod === "CASH" && <div className="flex justify-between"><dt className="text-muted-foreground">Change</dt><dd>{money(Math.max(receipt.receivedAmount - receipt.total, 0))}</dd></div>}</dl>
            <footer className="border-t border-border/60 pt-3 text-center text-xs text-muted-foreground">Thank you for choosing HrungMoto.</footer>
          </section>
        </>}
      </DialogContent>
    </Dialog>
  );
}
