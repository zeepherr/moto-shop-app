import Link from "next/link";
import { ArrowRight, Package, Wrench } from "lucide-react";

interface RankedItem {
  name: string;
  quantity: number;
  revenue: number;
}

function Ranking({ title, items, icon: Icon }: { title: string; items: RankedItem[]; icon: typeof Package }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-primary" /> {title}
      </div>
      <div className="mt-3 space-y-1">
        {items.length ? items.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/40">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className="block text-xs text-muted-foreground">{item.quantity.toLocaleString()} sold</span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">฿{Math.round(item.revenue).toLocaleString()}</span>
          </div>
        )) : <p className="rounded-xl bg-muted/35 px-3 py-5 text-center text-xs text-muted-foreground">No completed sales this month.</p>}
      </div>
    </div>
  );
}

export function BestSellers({ products, services }: { products: RankedItem[]; services: RankedItem[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Best sellers</h2>
          <p className="mt-1 text-xs text-muted-foreground">Ranked by current-month revenue</p>
        </div>
        <Link href="/admin/orders?status=COMPLETED" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Sales details <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid gap-6 pt-5 md:grid-cols-2 md:divide-x md:divide-border/60">
        <Ranking title="Products" items={products} icon={Package} />
        <div className="md:pl-6"><Ranking title="Services" items={services} icon={Wrench} /></div>
      </div>
    </section>
  );
}
