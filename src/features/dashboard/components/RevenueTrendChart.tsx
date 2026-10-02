"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Weekly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d71945" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d71945" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${val / 1000}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-card p-2 shadow-sm text-xs">
                        <p className="font-semibold text-foreground">{payload[0]?.payload.name}</p>
                        <p className="text-primary font-bold">฿{Number(payload[0]?.value).toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#d71945" strokeWidth={2} fillOpacity={1} fill="url(#revenueGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
