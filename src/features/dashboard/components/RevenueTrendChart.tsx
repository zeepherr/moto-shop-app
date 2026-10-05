"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type Period = "7D" | "30D" | "90D" | "1Y";

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface ChartProps {
  data: RevenuePoint[];
}

const periodDays: Record<Period, number> = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };

const formatDate = (date: string, long = false) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: long ? "long" : "short",
    ...(long && { year: "numeric" }),
  }).format(new Date(`${date}T00:00:00+07:00`));

export function RevenueTrendChart({ data }: ChartProps) {
  const [period, setPeriod] = useState<Period>("7D");
  const visibleData = useMemo(() => data.slice(-periodDays[period]), [data, period]);
  const periodRevenue = useMemo(
    () => visibleData.reduce((total, point) => total + point.revenue, 0),
    [visibleData],
  );
  const tickInterval = Math.max(0, Math.ceil(visibleData.length / 6) - 1);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Revenue Analytics</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ฿{periodRevenue.toLocaleString()} from completed orders · {period === "1Y" ? "last 12 months" : `last ${periodDays[period]} days`}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-full border border-border/50 bg-muted/50 p-1 text-xs" aria-label="Revenue period">
            {(["7D", "30D", "90D", "1Y"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                aria-pressed={period === option}
                className={`min-h-8 rounded-full px-2.5 py-1 font-medium transition-colors sm:px-3 ${
                  period === option
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <Link href="/admin/revenue" aria-label="Open revenue details" className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-8">
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="dashboard-revenue-chart h-[220px] w-full pt-3 sm:h-[280px] sm:pt-4" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueBlueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2997ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#66728f"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              tickFormatter={(value) => formatDate(String(value))}
            />
            <YAxis
              stroke="#66728f"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `฿${value >= 1000 ? `${Number(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as RevenuePoint | undefined;
                if (!active || !point) return null;
                return (
                  <div className="rounded-xl border border-border/80 bg-popover/95 p-2.5 text-xs shadow-xl backdrop-blur-md">
                    <p className="font-medium text-muted-foreground">{formatDate(point.date, true)}</p>
                    <p className="mt-0.5 text-base font-semibold text-primary">
                      ฿{point.revenue.toLocaleString()}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2997ff"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueBlueGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Daily revenue for the selected {period} period</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Revenue</th></tr></thead>
        <tbody>{visibleData.map((point) => <tr key={point.date}><th scope="row">{formatDate(point.date, true)}</th><td>{point.revenue}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
