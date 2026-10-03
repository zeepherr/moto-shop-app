import { db as defaultDb } from "@/lib/db";
import { OrderStatus, UserRole } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_WINDOW_DAYS = 30;

/** Percent change between two periods; null when there is no baseline to compare. */
const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const getDashboardSummary = async (db = defaultDb) => {
  const now = new Date();
  const currentStart = new Date(now.getTime() - TREND_WINDOW_DAYS * DAY_MS);
  const previousStart = new Date(now.getTime() - 2 * TREND_WINDOW_DAYS * DAY_MS);

  const completedIn = (gte: Date, lt: Date) => ({
    status: OrderStatus.COMPLETED,
    completedAt: { gte, lt },
  });

  const [
    revenueAgg,
    completedOrdersCount,
    lowStockCount,
    membersCount,
    recentOrders,
    lowStockProducts,
    currentPeriod,
    previousPeriod,
    newMembersCount,
  ] = await Promise.all([
    db.order.aggregate({
      where: { status: OrderStatus.COMPLETED },
      _sum: { finalTotal: true },
    }),
    db.order.count({ where: { status: OrderStatus.COMPLETED } }),
    db.product.count({ where: { stockQuantity: { lte: 5 }, isActive: true } }),
    db.user.count({ where: { role: UserRole.MEMBER } }),
    db.order.findMany({
      where: { status: OrderStatus.COMPLETED },
      take: 5,
      orderBy: { completedAt: "desc" },
      include: {
        member: { select: { firstName: true, lastName: true, email: true } },
        orderItems: true,
      },
    }),
    db.product.findMany({
      where: { stockQuantity: { lte: 5 }, isActive: true },
      take: 4,
      select: { id: true, name: true, sku: true, stockQuantity: true, unit: true },
      orderBy: { stockQuantity: "asc" },
    }),
    db.order.aggregate({
      where: completedIn(currentStart, now),
      _sum: { finalTotal: true },
      _count: { _all: true },
    }),
    db.order.aggregate({
      where: completedIn(previousStart, currentStart),
      _sum: { finalTotal: true },
      _count: { _all: true },
    }),
    db.user.count({
      where: { role: UserRole.MEMBER, createdAt: { gte: currentStart } },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.finalTotal || 0);
  const avgOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

  const trends = {
    windowDays: TREND_WINDOW_DAYS,
    revenueChange: percentChange(
      Number(currentPeriod._sum.finalTotal || 0),
      Number(previousPeriod._sum.finalTotal || 0),
    ),
    ordersChange: percentChange(currentPeriod._count._all, previousPeriod._count._all),
    newMembersCount,
  };

  return {
    totalRevenue,
    completedOrdersCount,
    avgOrderValue,
    lowStockCount,
    membersCount,
    recentOrders,
    lowStockProducts,
    trends,
  };
};
