"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bike, CheckCircle2, Clock3, Pencil, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cancelMemberMotorSuggestionAction, registerMemberMotorAction, searchMemberMotorCatalogAction, submitMemberMotorSuggestionAction } from "@/features/motor/actions/member-motor.actions";
import type { MemberProfileData } from "./member-profile.types";

type Motor = { id: number; model: string; type: string; motorBrand: { name: string } };
type MemberMotor = MemberProfileData["userMotors"][number];
type Suggestion = MemberProfileData["motorSuggestions"][number];

export function MemberMotorcycles({ motors, suggestions }: { motors: MemberMotor[]; suggestions: Suggestion[] }) {
  const router = useRouter();
  const currentMotor = motors[0];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Motor[]>([]);
  const [selected, setSelected] = useState<Motor | null>(null);
  const [plate, setPlate] = useState("");
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [type, setType] = useState("AUTOMATIC");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const pendingSuggestion = suggestions.find((suggestion) => suggestion.status === "PENDING");

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2 || (currentMotor && !open) || (currentMotor && pendingSuggestion)) return;
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchMemberMotorCatalogAction(term);
        if (result.success && result.data) setResults(result.data as Motor[]);
        else setResults([]);
      } catch { setResults([]); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [currentMotor, open, pendingSuggestion, search]);

  const resetForm = () => {
    setOpen(false); setSearch(""); setResults([]); setSelected(null); setPlate(""); setBrandName(""); setModelName(""); setType("AUTOMATIC"); setError("");
  };

  const beginEdit = () => {
    setSearch(""); setSelected(null); setPlate(currentMotor?.licensePlate ?? ""); setError(""); setOpen(true);
  };

  const register = () => {
    if (!selected) { const message = "Select a motorcycle from the results first."; setError(message); toast.error(message); return; }
    setError("");
    startTransition(async () => {
      try {
        const result = await registerMemberMotorAction({ motorId: selected.id, licensePlate: plate });
        if (!result.success) { setError(result.error || "Could not save your motorcycle."); toast.error(result.error || "Could not save your motorcycle."); return; }
        toast.success(currentMotor ? "Your motorcycle was updated." : "Motorcycle registered to your account.");
        resetForm(); router.refresh();
      } catch { const message = "Could not save your motorcycle. Check your connection and try again."; setError(message); toast.error(message); }
    });
  };

  const suggest = () => {
    const brand = brandName.trim();
    const model = (modelName || search).trim();
    if (brand.length < 2 || !model) {
      const message = "Enter a motorcycle brand and model to continue."; setError(message); toast.error(message); return;
    }
    setError("");
    startTransition(async () => {
      try {
        const result = await submitMemberMotorSuggestionAction({ brandName: brand, model, type, licensePlate: plate });
        if (!result.success) { setError(result.error || "Could not submit this motorcycle."); toast.error(result.error || "Could not submit this motorcycle."); return; }
        toast.success(currentMotor ? "Change requested. The workshop will review your motorcycle." : "Motorcycle sent to the workshop for review.");
        resetForm(); router.refresh();
      } catch { const message = "Could not submit this motorcycle. Check your connection and try again."; setError(message); toast.error(message); }
    });
  };

  const cancelSuggestion = (suggestionId: number) => startTransition(async () => {
    try {
      const result = await cancelMemberMotorSuggestionAction({ suggestionId });
      if (!result.success) { toast.error(result.error || "Could not cancel this request."); return; }
      toast.success("Motorcycle request cancelled. You can submit an updated one now.");
      router.refresh();
    } catch { toast.error("Could not cancel this request. Try again."); }
  });

  return <section aria-labelledby="member-motorcycles-heading">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
      <div><h2 id="member-motorcycles-heading" className="text-base font-semibold text-foreground">My motorcycle</h2><p className="mt-1 text-sm text-muted-foreground">Keep one motorcycle linked to your workshop account.</p></div>
      {(!pendingSuggestion || !currentMotor) && <Button type="button" variant={open ? "outline" : currentMotor ? "outline" : "default"} className="min-h-11 w-full gap-2 min-[420px]:w-auto" aria-expanded={open} aria-controls="member-motor-form" onClick={() => open ? resetForm() : beginEdit()}><span aria-hidden="true">{open ? <X className="size-4" /> : currentMotor ? <Pencil className="size-4" /> : <Plus className="size-4" />}</span>{open ? "Cancel" : currentMotor ? "Update motorcycle" : "Add motorcycle"}</Button>}
    </div>

    {currentMotor && !open && <div className="flex items-start gap-3 py-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary"><Bike className="size-5" aria-hidden="true" /></span><div className="min-w-0"><p className="break-words text-sm font-medium text-foreground">{currentMotor.motor.motorBrand.name} {currentMotor.motor.model}</p><p className="mt-1 text-xs text-muted-foreground">{currentMotor.motor.type === "AUTOMATIC" ? "Automatic" : "Manual"}{currentMotor.licensePlate ? ` · ${currentMotor.licensePlate}` : " · No plate added"}</p></div></div>}

    {pendingSuggestion && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between"><div className="flex min-w-0 items-start gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true"/><div className="min-w-0"><p className="text-sm font-medium text-foreground">Motorcycle change awaiting review</p><p className="mt-1 break-words text-sm text-muted-foreground">{pendingSuggestion.brandName} {pendingSuggestion.model}. {currentMotor ? "Your current motorcycle stays linked until the workshop approves this change." : "You can cancel this request if you need to correct it."}</p></div></div><Button type="button" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" onClick={() => cancelSuggestion(pendingSuggestion.id)} disabled={pending}>Cancel request</Button></div>}

    {open && <div id="member-motor-form" className="mt-5 space-y-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <div><p className="text-sm font-semibold text-foreground">{currentMotor ? "Choose your replacement motorcycle" : "Find your motorcycle"}</p><p className="mt-1 text-sm text-muted-foreground">Pick a catalog match, or suggest a new type for workshop approval.</p></div>
      <div><Label htmlFor="member-motor-search">Search brand or model</Label><div className="relative mt-2"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="member-motor-search" className="min-h-11 pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setSelected(null); setError(""); }} placeholder="For example, Honda Click 150" autoComplete="off" /></div></div>
      {search.trim().length >= 2 && <div className="max-h-52 overflow-y-auto rounded-xl border border-border/70" role="listbox" aria-label="Motorcycle search results">{results.length ? results.map((motor) => <button key={motor.id} type="button" role="option" aria-selected={selected?.id === motor.id} className={`flex min-h-12 w-full items-center justify-between gap-3 border-b border-border/50 px-3 text-left last:border-b-0 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected?.id === motor.id ? "bg-primary/5" : ""}`} onClick={() => { setSelected(motor); setBrandName(motor.motorBrand.name); setModelName(motor.model); setType(motor.type); setError(""); }}><span className="min-w-0"><span className="block break-words text-sm font-medium text-foreground">{motor.motorBrand.name} {motor.model}</span><span className="text-xs text-muted-foreground">{motor.type === "AUTOMATIC" ? "Automatic" : "Manual"}</span></span>{selected?.id === motor.id && <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true"/>}</button>) : <p className="px-3 py-3 text-sm text-muted-foreground">No matching motorcycle found. You can suggest it below.</p>}</div>}

      {selected && <div className="space-y-3 rounded-xl bg-muted/40 p-3"><p className="text-sm font-medium text-foreground">Selected: {selected.motorBrand.name} {selected.model}</p><div className="space-y-2"><Label htmlFor="member-motor-plate">License plate <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="member-motor-plate" value={plate} onChange={(event) => setPlate(event.target.value)} maxLength={20} autoComplete="off" placeholder="e.g. 1กข 2345" /></div><Button type="button" className="min-h-11 w-full" onClick={register} disabled={pending}>{pending ? "Saving…" : currentMotor ? "Save motorcycle" : "Register motorcycle"}</Button></div>}
      {!selected && search.trim().length < 2 && <p className="text-sm text-muted-foreground">Search at least two characters to find a catalog motorcycle.</p>}

      {!selected && search.trim().length >= 2 && <details className="border-t border-border/60 pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-primary">Can’t find it? Suggest a motorcycle</summary><div className="mt-2 grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="member-suggest-brand">Brand</Label><Input id="member-suggest-brand" value={brandName} onChange={(event) => { setBrandName(event.target.value); setError(""); }} maxLength={80} placeholder="e.g. Honda" /></div><div className="space-y-2"><Label htmlFor="member-suggest-model">Model name</Label><Input id="member-suggest-model" value={modelName || search} onChange={(event) => { setModelName(event.target.value); setError(""); }} maxLength={80} placeholder="e.g. Click 150" /></div><div className="space-y-2"><Label htmlFor="member-suggest-type">Transmission</Label><Select id="member-suggest-type" value={type} onValueChange={setType} options={[{ value: "AUTOMATIC", label: "Automatic" }, { value: "MANUAL", label: "Manual" }]} /></div><div className="space-y-2"><Label htmlFor="member-suggest-plate">License plate <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="member-suggest-plate" value={plate} onChange={(event) => setPlate(event.target.value)} maxLength={20} placeholder="e.g. 1กข 2345" /></div><p className="text-xs leading-5 text-muted-foreground sm:col-span-2">The workshop checks new motorcycle names before adding them. Similar names, such as “Click 150” and “click150,” are treated as duplicates.</p><Button type="button" className="min-h-11 sm:col-span-2" onClick={suggest} disabled={pending || brandName.trim().length < 2 || !(modelName || search).trim()}>{pending ? "Sending for review…" : currentMotor ? "Request motorcycle change" : "Send for review"}</Button></div></details>}
      {error && <p role="alert" aria-live="polite" className="text-sm text-destructive">{error}</p>}
    </div>}

    {!currentMotor && !pendingSuggestion && !open && <div className="py-5"><p className="text-sm font-medium text-foreground">No motorcycle linked yet</p><p className="mt-1 text-sm text-muted-foreground">Add your motorcycle so the workshop can connect it to future service orders.</p></div>}

    {suggestions.filter((suggestion) => suggestion.status !== "PENDING").length > 0 && <div className="mt-3 border-t border-border/60 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous requests</p><ul className="mt-2 space-y-3">{suggestions.filter((suggestion) => suggestion.status !== "PENDING").map((suggestion) => <li key={suggestion.id} className="flex items-start justify-between gap-3 text-sm"><span className="min-w-0"><span className="block break-words text-foreground">{suggestion.brandName} {suggestion.model}</span>{suggestion.reviewNote && <span className="mt-1 block text-xs text-muted-foreground">{suggestion.reviewNote}</span>}</span><span className={`inline-flex shrink-0 items-center gap-1 text-xs ${suggestion.status === "APPROVED" ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{suggestion.status === "APPROVED" ? <CheckCircle2 className="size-3.5" aria-hidden="true"/> : <X className="size-3.5" aria-hidden="true"/>}{suggestion.status === "APPROVED" ? "Approved" : "Declined"}</span></li>)}</ul></div>}
  </section>;
}
