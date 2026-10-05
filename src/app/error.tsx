"use client";

import Link from "next/link";
import { RotateCcw, WifiOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex min-h-[75dvh] flex-1 items-center justify-center px-5 py-12 sm:px-8">
      <section role="alert" className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <WifiOff aria-hidden="true" className="size-6" />
        </div>
        <p className="mb-2 text-sm font-semibold text-destructive">Connection problem</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          We couldn’t load this page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          A temporary network or server issue may have interrupted the request. Check your connection, then try again.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={retry} className="gap-2">
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
