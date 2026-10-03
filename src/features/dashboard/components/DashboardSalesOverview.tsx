"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface MixValue {
  label: string;
  revenue: number;
  count?: number;
  color: string;
}

function MixPanel({ title, description, data }: { title: string; description: string; data: MixValue[] }) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);
  return (
    <div className="grid min-w-0 grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="revenue" nameKey="label" innerRadius={34} outerRadius={50} paddingAngle={2} strokeWidth={0}>
              {data.map((item) => <Cell key={item.label} fill={item.color} />)}
            </Pie>
            <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        <div className="mt-3 space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}{item.count !== undefined ? ` · ${item.count}` : ""}</span>
              </span>
              <span className="font-semibold tabular-nums text-foreground">{total ? Math.round((item.revenue / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DashboardSalesOverviewProps {
  products: number;
  services: number;
  cash: { revenue: number; count: number };
  qr: { revenue: number; count: number };
}

export function DashboardSalesOverview(props: DashboardSalesOverviewProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-base font-semibold text-foreground">Sales composition</h2>
        <p className="mt-1 text-xs text-muted-foreground">Current-month revenue and payment mix</p>
      </div>
      <div className="grid gap-6 pt-5 sm:grid-cols-2 sm:divide-x sm:divide-border/60">
        <MixPanel title="Products and services" description="Revenue contribution" data={[
          { label: "Products", revenue: props.products, color: "#2997ff" },
          { label: "Services", revenue: props.services, color: "#7a7a7a" },
        ]} />
        <div className="sm:pl-6">
          <MixPanel title="Payment methods" description="Revenue · transactions" data={[
            { label: "Cash", revenue: props.cash.revenue, count: props.cash.count, color: "#333333" },
            { label: "QR", revenue: props.qr.revenue, count: props.qr.count, color: "#2997ff" },
          ]} />
        </div>
      </div>
    </section>
  );
}
