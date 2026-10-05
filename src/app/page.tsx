import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { Wrench, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "STAFF") redirect("/staff/pos");
    redirect("/member/profile");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-cyan-500/20">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <Wrench className="size-5 stroke-[2]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Moto<span className="text-cyan-500">Care</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <div className="relative isolate overflow-hidden px-6 pt-16 lg:px-8">
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80">
            <div className="aspect-[1155/678] w-[68rem] bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-20" />
          </div>

          <div className="public-home-hero mx-auto max-w-3xl py-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-500">
              <Sparkles className="size-3.5" />
              Smart Motorcycle Workshop Management
            </div>

            <h1 className="public-home-title font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              Power Your Repair Shop with{" "}
              <span className="text-[#2997ff]">
                Precision POS
              </span>
            </h1>

            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Manage motorcycle parts, repair tickets, inventory, staff roles, and
              instant checkout in one unified, real-time operating system.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                Launch App
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Highlights */}
          <div className="mx-auto max-w-5xl pb-24">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <ShoppingBag className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">Real-time POS</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-5">
                  Barcode scanning, inventory sync, ticket holding, and QR payment integration.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Wrench className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">Service Catalog</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-5">
                  Pre-configured repair routines, motorcycle model compatibilities, and pricing.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">Role Security</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-5">
                  Granular permission control across Admin, Staff, and Customer Member portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
