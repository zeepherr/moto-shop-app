import React from "react";
import type { Metadata } from "next";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { RecentOrdersList } from "@/features/dashboard/components/RecentOrdersList";
import { InventoryAlertWidget } from "@/features/dashboard/components/InventoryAlertWidget";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { DollarSign, ShoppingBag, AlertTriangle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - HrungMoto",
  description: "Shop operations and sales metrics",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <ManagementLayout>
      <DashboardHeader />

      {/* Apple-styled KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`฿${summary.totalRevenue.toLocaleString()}`}
          subtext="vs previous cycle"
          trend={{ value: "+12.4%", isPositive: true }}
          tone="blue"
          icon={<DollarSign className="size-4" />}
        />
        <MetricCard
          label="Completed Orders"
          value={summary.completedOrdersCount.toString()}
          subtext={`Avg. ฿${Math.round(summary.avgOrderValue).toLocaleString()}`}
          trend={{ value: "+8.1%", isPositive: true }}
          tone="blue"
          icon={<ShoppingBag className="size-4" />}
        />
        <MetricCard
          label="Low Stock Alert"
          value={summary.lowStockCount.toString()}
          subtext="Items <= 5 in inventory"
          trend={
            summary.lowStockCount > 0
              ? { value: `${summary.lowStockCount} items`, isPositive: false }
              : undefined
          }
          tone={summary.lowStockCount > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="size-4" />}
        />
        <MetricCard
          label="Registered Members"
          value={summary.membersCount.toString()}
          subtext="Active customer profiles"
          trend={{ value: "+4 this month", isPositive: true }}
          tone="success"
          icon={<Users className="size-4" />}
        />
      </div>

      {/* Main Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueTrendChart />
        </div>
        <div className="space-y-6">
          <RecentOrdersList orders={summary.recentOrders} />
          <InventoryAlertWidget items={summary.lowStockProducts} />
        </div>
      </div>
    </ManagementLayout>
  );
}
