import Link from "next/link";
import { ArrowRight, Banknote, Ban, CheckCircle2, Clock3, ReceiptText } from "lucide-react";

interface TodayOperationsProps {
  revenue: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
  averageOrder: number;
}

const money = (value: number) => `฿${Math.round(value).toLocaleString()}`;

export function TodayOperations(props: TodayOperationsProps) {
  const metrics = [
    { label: "Revenue", value: money(props.revenue), icon: Banknote, href: "/admin/revenue?period=today" },
    { label: "Completed", value: props.completedCount.toLocaleString(), icon: CheckCircle2, href: "/admin/orders?status=COMPLETED" },
    { label: "Pending", value: props.pendingCount.toLocaleString(), icon: Clock3, href: "/admin/orders?status=PENDING" },
    { label: "Cancelled", value: props.cancelledCount.toLocaleString(), icon: Ban, href: "/admin/orders?status=CANCELLED" },
    { label: "Average order", value: money(props.averageOrder), icon: ReceiptText, href: "/admin/revenue?period=today" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Today&apos;s operations</h2>
          <p className="mt-1 text-xs text-muted-foreground">Live shop activity in Bangkok time</p>
        </div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          All orders <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:text-primary">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">{label}</span>
              <span className="mt-0.5 block truncate text-lg font-semibold tabular-nums text-foreground">{value}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
