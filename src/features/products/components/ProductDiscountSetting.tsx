"use client";

import { useState, useTransition } from "react";
import { Percent } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProductDiscountRateAction } from "../actions/discount-setting.actions";

export function ProductDiscountSetting({ initialRate }: { initialRate: number }) {
  const [rate, setRate] = useState(String(initialRate));
  const [isPending, startTransition] = useTransition();

  const save = () => {
    const value = Number(rate);
    startTransition(async () => {
      const result = await updateProductDiscountRateAction(value);
      if (!result.success) {
        toast.error(result.error || "Could not save the product discount.");
        return;
      }
      setRate(String(result.rate));
      toast.success("Product discount updated");
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-labelledby="product-discount-title">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Percent className="size-5" /></span>
        <div>
          <h2 id="product-discount-title" className="text-sm font-semibold text-foreground">POS product discount</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">Set the percentage applied to product items at checkout. Service fees are excluded. This setting is shared by admin and staff POS.</p>
        </div>
      </div>
      <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); save(); }}>
        <label htmlFor="product-discount-rate" className="sr-only">Product discount percentage</label>
        <div className="relative w-32">
          <Input id="product-discount-rate" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} className="h-11 pr-8 text-right tabular-nums" aria-describedby="product-discount-suffix" />
          <span id="product-discount-suffix" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
        </div>
        <Button type="submit" disabled={isPending || rate.trim() === ""} className="h-11 min-w-24">{isPending ? "Saving…" : "Save rate"}</Button>
      </form>
    </section>
  );
}
