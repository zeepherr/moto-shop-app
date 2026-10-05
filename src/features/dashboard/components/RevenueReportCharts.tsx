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
  serviceRevenue: number;
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
      <div className="mt-3 grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 sm:mt-4 sm:grid-cols-[132px_1fr] sm:gap-4">
        <div className="h-24 w-24 sm:h-32 sm:w-[132px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
                {data.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 space-y-2 sm:space-y-3">
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
      <table className="sr-only">
        <caption>{title} revenue breakdown</caption>
        <thead><tr><th scope="col">Category</th><th scope="col">Revenue</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.value}</td></tr>)}</tbody>
      </table>
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
        <div className="revenue-report-trend mt-4 h-56 sm:mt-5 sm:h-72" aria-hidden="true">
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
        <table className="sr-only">
          <caption>Revenue per period for the selected {props.period} range</caption>
          <thead><tr><th scope="col">Period</th><th scope="col">Revenue</th></tr></thead>
          <tbody>{props.trend.map((point) => <tr key={point.label}><th scope="row">{formatBucket(point.label, props.period)}</th><td>{point.value}</td></tr>)}</tbody>
        </table>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-1">
        <DonutCard title="Revenue mix" data={[
          { name: "Products", value: props.productRevenue, color: "#2997ff" },
          { name: "Services", value: props.serviceRevenue, color: "#7a7a7a" },
        ]} />
        <DonutCard title="Payment mix" data={[
          { name: "Cash", value: props.cashRevenue, color: "#2997ff" },
          { name: "QR", value: props.qrRevenue, color: "#333333" },
        ]} />
      </div>
    </div>
  );
}
