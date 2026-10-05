import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";

function AuthBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold leading-none text-primary">H</span>
      <span className="text-lg font-semibold tracking-tight text-foreground">HrungMoto</span>
    </div>
  );
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === ROLES.ADMIN) redirect("/admin");
    if (user.role === ROLES.STAFF) redirect("/staff");
    redirect("/member");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
        <aside className="hidden flex-col justify-between border-r border-border/70 bg-card px-12 py-12 lg:flex xl:px-20 xl:py-14">
          <AuthBrand />

          <div className="max-w-md space-y-5">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
              Your workshop account starts here.
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Sign in to continue to the tools and information available to your account.
            </p>
          </div>

          <div className="max-w-sm border-t border-border/70 pt-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Member and staff access is arranged through the shop team.
            </p>
          </div>
        </aside>

        <div className="flex min-h-dvh flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10 lg:px-14 xl:px-20">
          <header className="mx-auto w-full max-w-[460px] lg:hidden">
            <AuthBrand />
          </header>

          <main className="flex flex-1 items-center justify-center py-10 lg:py-14">
            <div className="w-full max-w-[460px]">{children}</div>
          </main>

          <footer className="mx-auto w-full max-w-[460px] border-t border-border/60 pt-4 text-xs text-muted-foreground lg:border-0 lg:pt-0 lg:text-right">
            HrungMoto · Workshop management
          </footer>
        </div>
      </div>
    </div>
  );
}
