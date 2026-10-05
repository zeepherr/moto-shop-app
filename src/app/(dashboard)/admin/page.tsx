import React from "react";
import type { Metadata } from "next";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { RecentOrdersList } from "@/features/dashboard/components/RecentOrdersList";
import { InventoryAlertWidget } from "@/features/dashboard/components/InventoryAlertWidget";
import { TodayOperations } from "@/features/dashboard/components/TodayOperations";
import { DashboardActionCenter } from "@/features/dashboard/components/DashboardActionCenter";
import { DashboardSalesOverview } from "@/features/dashboard/components/DashboardSalesOverview";
import { BestSellers } from "@/features/dashboard/components/BestSellers";
import { StaffActivity } from "@/features/dashboard/components/StaffActivity";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { DollarSign, ShoppingBag, AlertTriangle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - HrungMoto",
  description: "Shop operations and sales metrics",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();
  const { trends } = summary;

  const toTrend = (change: number | null) =>
    change === null
      ? undefined
      : {
          value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
          isPositive: change >= 0,
        };

  return (
    <ManagementLayout className="!space-y-4 sm:!space-y-6">
      <DashboardHeader />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          href="/admin/revenue"
          value={`฿${summary.totalRevenue.toLocaleString()}`}
          subtext="This month vs previous month"
          trend={toTrend(trends.revenueChange)}
          tone="blue"
          icon={<DollarSign className="size-4" />}
        />
        <MetricCard
          label="Completed Orders"
          href="/admin/orders?status=COMPLETED"
          value={summary.completedOrdersCount.toString()}
          subtext={`This month · Avg. ฿${Math.round(summary.avgOrderValue).toLocaleString()}`}
          trend={toTrend(trends.ordersChange)}
          tone="blue"
          icon={<ShoppingBag className="size-4" />}
        />
        <MetricCard
          label="Low Stock Alert"
          href="/admin/products"
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
          href="/admin/users"
          value={summary.membersCount.toString()}
          subtext="Active customer profiles"
          trend={
            trends.newMembersCount > 0
              ? { value: `+${trends.newMembersCount} this month`, isPositive: true }
              : undefined
          }
          tone="success"
          icon={<Users className="size-4" />}
        />
      </div>

      <TodayOperations {...summary.today} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={summary.revenueTrend} />
        </div>
        <DashboardActionCenter {...summary.attention} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <DashboardSalesOverview
          products={summary.salesMix.products}
          services={summary.salesMix.services}
          cash={summary.paymentMix.cash}
          qr={summary.paymentMix.qr}
        />
        <BestSellers products={summary.bestSellers.products} services={summary.bestSellers.services} />
      </div>

      <StaffActivity items={summary.staffActivity} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersList orders={summary.recentOrders} />
        </div>
        <InventoryAlertWidget items={summary.lowStockProducts} />
      </div>
    </ManagementLayout>
  );
}
