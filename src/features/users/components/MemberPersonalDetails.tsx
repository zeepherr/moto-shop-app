"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMemberProfileAction } from "@/features/users/actions/user.actions";
import type { MemberProfileData } from "./member-profile.types";

export function MemberPersonalDetails({ user }: { user: Pick<MemberProfileData, "firstName" | "lastName" | "phone"> }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [pending, startTransition] = useTransition();
  const changed = firstName.trim() !== user.firstName || lastName.trim() !== user.lastName || phone.trim() !== (user.phone ?? "");

  const cancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone ?? "");
    setEditing(false);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await updateMemberProfileAction({ firstName, lastName, phone: phone.trim() || null });
        if (!result.success) { toast.error(result.error || "Could not update your details."); return; }
        toast.success("Personal details updated.");
        setEditing(false);
        router.refresh();
      } catch { toast.error("Could not update your details. Check your connection and try again."); }
    });
  };

  return (
    <section className="min-w-0 py-6" aria-labelledby="member-details-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div><h2 id="member-details-heading" className="text-base font-semibold text-foreground">Personal details</h2><p className="mt-1 text-sm text-muted-foreground">Your name and phone number help the workshop identify your account.</p></div>
        {!editing && <Button type="button" variant="outline" className="min-h-11 w-full gap-2 min-[420px]:w-auto" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden="true" />Update details</Button>}
      </div>
      {editing ? <form className="grid gap-4 pt-5 sm:grid-cols-2" onSubmit={save}>
        <div className="space-y-2"><Label htmlFor="member-first-name">First name</Label><Input id="member-first-name" autoComplete="given-name" maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} required disabled={pending} /></div>
        <div className="space-y-2"><Label htmlFor="member-last-name">Last name</Label><Input id="member-last-name" autoComplete="family-name" maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} required disabled={pending} /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="member-phone">Phone number <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="member-phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} disabled={pending} /></div>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row"><Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={pending || !changed}>{pending ? "Saving…" : "Save changes"}</Button><Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={cancel} disabled={pending}>Cancel</Button></div>
      </form> : <div className="grid gap-4 pt-5 min-[420px]:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><UserRound className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">Full name</p><p className="mt-1 break-words text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p></div></div>
        <div className="min-w-0"><p className="text-xs text-muted-foreground">Phone number</p><p className="mt-1 break-words text-sm font-medium text-foreground">{user.phone || "Not added"}</p></div>
      </div>}
    </section>
  );
}
