import React from "react";
import type { Metadata } from "next";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard.service";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { RecentOrdersList } from "@/features/dashboard/components/RecentOrdersList";
import { DollarSign, ShoppingBag, AlertTriangle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - HrungMoto",
  description: "Shop operations and sales metrics",
};

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of shop operations, revenue, and inventory</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`฿${summary.totalRevenue.toLocaleString()}`}
          subtext="From completed orders"
          tone="primary"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          label="Completed Orders"
          value={summary.completedOrdersCount.toString()}
          subtext={`Avg. ฿${Math.round(summary.avgOrderValue).toLocaleString()}`}
          tone="cyan"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <MetricCard
          label="Low Stock Alert"
          value={summary.lowStockCount.toString()}
          subtext="Items with <= 5 in stock"
          tone={summary.lowStockCount > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          label="Registered Members"
          value={summary.membersCount.toString()}
          subtext="Active customer accounts"
          tone="success"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <RecentOrdersList orders={summary.recentOrders} />
        </div>
      </div>
    </div>
  );
}
