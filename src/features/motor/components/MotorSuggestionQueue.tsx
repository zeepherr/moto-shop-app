"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bike, Check, Clock3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewMotorSuggestionAction } from "../actions/member-motor.actions";

export interface MotorSuggestionDTO {
  id: number;
  brandName: string;
  model: string;
  type: string;
  licensePlate: string | null;
  createdAt: string;
  user: { id: number; firstName: string; lastName: string; phone: string | null; email: string | null };
}

export function MotorSuggestionQueue({ suggestions }: { suggestions: MotorSuggestionDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!suggestions.length) return null;

  const review = (id: number, approve: boolean) => startTransition(async () => {
    try {
      const result = await reviewMotorSuggestionAction({ id, approve });
      if (!result.success) { toast.error(result.error || "Could not review this suggestion."); return; }
      toast.success(approve ? "Motorcycle approved and added to the member’s garage." : "Motorcycle suggestion declined.");
      router.refresh();
    } catch { toast.error("Could not review this suggestion. Try again."); }
  });

  return <section className="mb-6 rounded-2xl border border-border/70 bg-card p-4 sm:p-5" aria-labelledby="motor-suggestions-heading">
    <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock3 className="size-5" aria-hidden="true" /></span><div><h2 id="motor-suggestions-heading" className="text-base font-semibold text-foreground">Member motorcycle suggestions</h2><p className="mt-1 text-sm text-muted-foreground">Review entries before adding them to the shared catalog.</p></div></div>
    <ul className="mt-4 divide-y divide-border/60">{suggestions.map((suggestion) => <li key={suggestion.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3"><Bike className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{suggestion.brandName} {suggestion.model}</p><p className="mt-0.5 text-xs text-muted-foreground">{suggestion.type === "AUTOMATIC" ? "Automatic" : "Manual"}{suggestion.licensePlate ? ` · ${suggestion.licensePlate}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Submitted by {suggestion.user.firstName} {suggestion.user.lastName} · {suggestion.user.phone || suggestion.user.email || `Member #${suggestion.user.id}`}</p></div></div>
      <div className="flex gap-2 sm:shrink-0"><Button type="button" className="min-h-11 flex-1 gap-2 sm:flex-none" onClick={() => review(suggestion.id, true)} disabled={pending}><Check className="size-4" aria-hidden="true" />Approve</Button><Button type="button" variant="outline" className="min-h-11 flex-1 gap-2 sm:flex-none" onClick={() => review(suggestion.id, false)} disabled={pending}><X className="size-4" aria-hidden="true" />Decline</Button></div>
    </li>)}</ul>
  </section>;
}
