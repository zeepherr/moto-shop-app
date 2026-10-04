"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CheckoutReceipt } from "../../types";

interface PosReceiptDialogProps {
  receipt: CheckoutReceipt | null;
  onOpenChange: (open: boolean) => void;
}

const money = (amount: number) => `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PosReceiptDialog({ receipt, onOpenChange }: PosReceiptDialogProps) {
  return (
    <Dialog open={receipt !== null} onOpenChange={onOpenChange}>
      <DialogContent data-pos-modal="true" className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sale completed</DialogTitle>
          <DialogDescription>Review or print the customer receipt.</DialogDescription>
        </DialogHeader>
        {receipt && <>
          <section id="printable-receipt" aria-label="Completed sale receipt" className="space-y-5 rounded-xl border border-border/70 bg-background p-5 text-foreground">
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
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/60 text-left text-xs text-muted-foreground"><th scope="col" className="py-2">Item</th><th scope="col" className="py-2 text-center">Qty</th><th scope="col" className="py-2 text-right">Amount</th></tr></thead>
              <tbody>{receipt.items.map((item, index) => <tr className="border-b border-border/40" key={`${item.name}-${index}`}><th scope="row" className="py-2 text-left font-normal">{item.name}<span className="block text-xs text-muted-foreground">{money(item.unitPrice)} each</span></th><td className="py-2 text-center tabular-nums">{item.quantity}</td><td className="py-2 text-right tabular-nums">{money(item.lineTotal)}</td></tr>)}</tbody>
            </table>
            <dl className="ml-auto max-w-52 space-y-1 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(receipt.subtotal)}</dd></div>{receipt.discountAmount > 0 && <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400"><dt>Products discount ({receipt.discountRate}%)</dt><dd>−{money(receipt.discountAmount)}</dd></div>}<div className="flex justify-between border-t border-border/60 pt-2 font-semibold"><dt>Total</dt><dd>{money(receipt.total)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Received</dt><dd>{money(receipt.receivedAmount)}</dd></div>{receipt.paymentMethod === "CASH" && <div className="flex justify-between"><dt className="text-muted-foreground">Change</dt><dd>{money(Math.max(receipt.receivedAmount - receipt.total, 0))}</dd></div>}</dl>
            <footer className="border-t border-border/60 pt-3 text-center text-xs text-muted-foreground">Thank you for choosing HrungMoto.</footer>
          </section>
          <div className="flex justify-end" data-no-print><Button type="button" onClick={() => window.print()} className="gap-2"><Printer className="size-4" />Print receipt</Button></div>
          <style>{`@page { margin: 12mm; } @media print { html, body { background: #fff !important; } body * { visibility: hidden !important; } #printable-receipt, #printable-receipt * { visibility: visible !important; } #printable-receipt { position: fixed; inset: 0; z-index: 9999; width: 100%; max-width: none; border: 0 !important; padding: 0 !important; background: #fff !important; color: #000 !important; box-shadow: none !important; } #printable-receipt .text-muted-foreground { color: #555 !important; } [data-no-print] { display: none !important; } }`}</style>
        </>}
      </DialogContent>
    </Dialog>
  );
}
