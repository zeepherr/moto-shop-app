"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenuePeriod } from "../services/revenue-report.service";

interface RevenueReportChartsProps {
  period: RevenuePeriod;
  trend: Array<{ label: string; value: number }>;
  productRevenue: number;
  laborRevenue: number;
  cashRevenue: number;
  qrRevenue: number;
}

const money = (value: number) => `฿${value.toLocaleString()}`;

const formatBucket = (label: string, period: RevenuePeriod) => {
  if (period === "today") return label;
  if (period === "year") {
    return new Intl.DateTimeFormat("en", { month: "short", timeZone: "Asia/Bangkok" }).format(
      new Date(`${label}-01T00:00:00+07:00`),
    );
  }
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(
    new Date(`${label}T00:00:00+07:00`),
  );
};

function DonutCard({ title, data }: { title: string; data: Array<{ name: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid grid-cols-[132px_1fr] items-center gap-4">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={58} paddingAngle={2} strokeWidth={0}>
                {data.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {total ? `${((item.value / total) * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RevenueReportCharts(props: RevenueReportChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]">
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Revenue over time</h2>
          <p className="mt-1 text-xs text-muted-foreground">Completed sales grouped in Bangkok time</p>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.trend} margin={{ left: -12, right: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
              <XAxis dataKey="label" tickFormatter={(value) => formatBucket(String(value), props.period)} tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" />
              <YAxis tickFormatter={(value) => `฿${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip labelFormatter={(value) => formatBucket(String(value), props.period)} formatter={(value) => [money(Number(value)), "Revenue"]} cursor={{ fill: "var(--muted)", opacity: 0.45 }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
        <DonutCard title="Revenue mix" data={[
          { name: "Products", value: props.productRevenue, color: "#2997ff" },
          { name: "Labor services", value: props.laborRevenue, color: "#7a7a7a" },
        ]} />
        <DonutCard title="Payment mix" data={[
          { name: "Cash", value: props.cashRevenue, color: "#2997ff" },
          { name: "QR", value: props.qrRevenue, color: "#333333" },
        ]} />
      </div>
    </div>
  );
}
