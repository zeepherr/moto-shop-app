import { UsersRound } from "lucide-react";

export interface StaffActivityItem {
  id: number;
  name: string;
  orderCount: number;
  handledRevenue: number;
  averageOrder: number;
}

const money = (value: number) => `฿${Math.round(value).toLocaleString()}`;

export function StaffActivity({ items }: { items: StaffActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5">
      <header className="flex items-start gap-3 border-b border-border/60 pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UsersRound className="size-4" /></div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Staff activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Completed orders handled this month · current staff accounts</p>
        </div>
      </header>
      {items.length ? (
        <div className="mt-3 divide-y divide-border/50">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)] sm:gap-6">
              <p className="truncate text-sm font-medium text-foreground">{item.name || `Staff #${item.id}`}</p>
              <p className="text-right text-sm font-semibold tabular-nums text-foreground sm:min-w-20">{item.orderCount} <span className="text-xs font-normal text-muted-foreground">orders</span></p>
              <p className="col-start-1 text-xs text-muted-foreground sm:col-auto">Handled revenue <span className="font-medium tabular-nums text-foreground">{money(item.handledRevenue)}</span></p>
              <p className="col-start-2 row-start-2 text-right text-xs text-muted-foreground sm:col-auto sm:row-auto">Avg. {money(item.averageOrder)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">No completed orders have been assigned to current staff this month.</p>
      )}
    </section>
  );
}
