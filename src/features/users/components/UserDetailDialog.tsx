"use client";

import { useEffect, useState } from "react";
import { Bike, History, ShieldCheck, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUserManagementDetailAction } from "../actions/user.actions";
import type { UserItem } from "./UserTable";

type Detail = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  completedOrders: number;
  motorcycleCount: number;
  motorcycles: Array<{ label: string; type: string; licensePlate: string | null }>;
  events: Array<{
    action: string;
    detail: string | null;
    createdAt: string;
    actor: { firstName: string; lastName: string; email: string | null } | null;
  }>;
};

interface UserDetailDialogProps {
  user: UserItem | null;
  onOpenChange: (open: boolean) => void;
}

const eventLabel = (action: string) => action.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function UserDetailDialog({ user, onOpenChange }: UserDetailDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? `${user.firstName} ${user.lastName}` : "Account details"}</DialogTitle>
          <DialogDescription>Account status, operational history, and administrator changes.</DialogDescription>
        </DialogHeader>
        {user && <UserDetailContent key={user.id} userId={user.id} />}
      </DialogContent>
    </Dialog>
  );
}

function UserDetailContent({ userId }: { userId: number }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getUserManagementDetailAction(userId).then((result) => {
      if (!result.success || !("data" in result) || !result.data) {
        setError("Unable to load this account’s detail.");
        return;
      }
      setDetail(result.data as Detail);
    });
  }, [userId]);

  return (
    <>
      {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {!detail && !error && <div className="space-y-3 py-3"><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="h-28 animate-pulse rounded-xl bg-muted" /></div>}
      {detail && <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 p-3"><ShieldCheck className="size-4 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{detail.isActive ? "Active access" : "Access paused"}</p><p className="text-xs text-muted-foreground">{detail.role.toLowerCase()} account</p></div>
            <div className="rounded-xl border border-border/70 p-3"><ShoppingBag className="size-4 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{detail.completedOrders} completed</p><p className="text-xs text-muted-foreground">Workshop orders</p></div>
            <div className="rounded-xl border border-border/70 p-3"><Bike className="size-4 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{detail.motorcycleCount} motorcycles</p><p className="text-xs text-muted-foreground">Linked to this account</p></div>
          </section>
          <section className="space-y-2 border-y border-border/60 py-4 text-sm"><p className="font-semibold text-foreground">Contact and verification</p><p className="text-muted-foreground">{detail.email || "No email address"}</p><p className="text-muted-foreground">{detail.phone || "No phone number"}</p><p className="text-xs text-muted-foreground">{detail.emailVerifiedAt ? "Email verified" : "Email has not been verified"} · Joined {new Date(detail.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p></section>
          {detail.motorcycles.length > 0 && <section className="space-y-2"><p className="text-sm font-semibold text-foreground">Registered motorcycles</p><ul className="divide-y divide-border/60 border-y border-border/60">{detail.motorcycles.map((motor, index) => <li key={`${motor.label}-${index}`} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="min-w-0 truncate text-foreground">{motor.label}<span className="ml-2 text-xs text-muted-foreground">{motor.type === "AUTOMATIC" ? "Automatic" : "Manual"}</span></span><span className="shrink-0 text-muted-foreground">{motor.licensePlate || "No plate"}</span></li>)}</ul></section>}
          <section><div className="mb-3 flex items-center gap-2"><History className="size-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Activity history</h3></div>{detail.events.length ? <ol className="space-y-3">{detail.events.map((event, index) => <li className="border-l border-border pl-3" key={`${event.action}-${event.createdAt}-${index}`}><p className="text-sm font-medium text-foreground">{eventLabel(event.action)}</p><p className="text-xs text-muted-foreground">{event.actor ? `${event.actor.firstName} ${event.actor.lastName}` : "System or account holder"} · {new Date(event.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p></li>)}</ol> : <p className="text-sm text-muted-foreground">No account events have been recorded yet.</p>}</section>
      </div>}
    </>
  );
}
