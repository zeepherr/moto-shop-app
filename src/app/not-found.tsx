import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[75dvh] flex-1 items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Compass aria-hidden="true" className="size-6" />
        </div>
        <p className="mb-2 text-sm font-semibold text-primary">404 · Page not found</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          This page isn’t here
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The address may be incorrect, or the page may have moved. Check the link or return to the home page.
        </p>
        <div className="mt-7 flex justify-center">
          <Link href="/" className={buttonVariants({ className: "gap-2" })}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
