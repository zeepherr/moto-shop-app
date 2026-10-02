"use client";

import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface ChartProps {
  data?: { name: string; revenue: number }[];
}

const defaultData = [
  { name: "Mon", revenue: 4200 },
  { name: "Tue", revenue: 6800 },
  { name: "Wed", revenue: 5100 },
  { name: "Thu", revenue: 9400 },
  { name: "Fri", revenue: 12500 },
  { name: "Sat", revenue: 16800 },
  { name: "Sun", revenue: 14200 },
];

export const RevenueTrendChart: React.FC<ChartProps> = ({ data = defaultData }) => {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D">("7D");

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-5 transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Revenue Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gross sales trend from completed orders
          </p>
        </div>

        {/* Apple Segmented Control */}
        <div className="flex items-center rounded-full bg-muted/50 p-1 border border-border/50 text-xs">
          {(["7D", "30D", "90D"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 font-medium transition-all cursor-pointer ${
                period === p
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appleBlueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2997ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="#666666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#666666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `฿${val >= 1000 ? `${val / 1000}k` : val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-border/80 bg-popover/90 backdrop-blur-md p-2.5 shadow-xl text-xs">
                      <p className="font-medium text-muted-foreground">{payload[0]?.payload.name}</p>
                      <p className="text-base font-semibold text-[#2997ff] mt-0.5">
                        ฿{Number(payload[0]?.value).toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2997ff"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#appleBlueGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
