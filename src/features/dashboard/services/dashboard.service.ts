import { OrderItemType, OrderStatus, PaymentMethod, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_WINDOW_DAYS = 365;
const SHOP_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const SHOP_TIME_ZONE = "Asia/Bangkok";

const shopParts = (date: Date) => {
  const shifted = new Date(date.getTime() + SHOP_UTC_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
};

const shopDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day) - SHOP_UTC_OFFSET_MS);

const toShopDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};

const buildRevenueTrend = (
  orders: Array<{ completedAt: Date | null; finalTotal: unknown }>,
  now: Date,
) => {
  const revenueByDay = new Map<string, number>();
  for (const order of orders) {
    if (!order.completedAt) continue;
    const key = toShopDateKey(order.completedAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(order.finalTotal));
  }
  return Array.from({ length: CHART_WINDOW_DAYS }, (_, index) => {
    const date = new Date(now.getTime() - (CHART_WINDOW_DAYS - 1 - index) * DAY_MS);
    const key = toShopDateKey(date);
    return { date: key, revenue: revenueByDay.get(key) ?? 0 };
  });
};

const percentChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : ((current - previous) / previous) * 100;

type RankedItem = { name: string; quantity: number; revenue: number };

export const getDashboardSummary = async (db = defaultDb) => {
  const now = new Date();
  const parts = shopParts(now);
  const todayStart = shopDate(parts.year, parts.month, parts.day);
  const monthStart = shopDate(parts.year, parts.month, 1);
  const previousMonthStart = shopDate(parts.year, parts.month - 1, 1);
  const chartStart = new Date(now.getTime() - CHART_WINDOW_DAYS * DAY_MS);

  const [monthlyOrders, previousPeriod, lowStockCount, outOfStockCount, membersCount,
    newMembersCount, recentOrders, lowStockProducts, pendingOrders, pendingCount,
    todayCompleted, todayCancelledCount, chartOrders] = await Promise.all([
    db.order.findMany({
      where: { status: OrderStatus.COMPLETED, completedAt: { gte: monthStart, lte: now } },
      select: {
        finalTotal: true,
        paymentMethod: true,
        orderItems: { select: { itemType: true, itemNameSnapshot: true, quantity: true, lineTotal: true } },
      },
    }),
    db.order.aggregate({
      where: { status: OrderStatus.COMPLETED, completedAt: { gte: previousMonthStart, lt: monthStart } },
      _sum: { finalTotal: true },
      _count: { _all: true },
    }),
    db.product.count({ where: { stockQuantity: { lte: 5 }, isActive: true } }),
    db.product.count({ where: { stockQuantity: { lte: 0 }, isActive: true } }),
    db.user.count({ where: { role: UserRole.MEMBER, isActive: true } }),
    db.user.count({ where: { role: UserRole.MEMBER, isActive: true, createdAt: { gte: monthStart } } }),
    db.order.findMany({
      where: { status: OrderStatus.COMPLETED }, take: 5, orderBy: { completedAt: "desc" },
      include: { member: { select: { firstName: true, lastName: true, email: true } }, orderItems: true },
    }),
    db.product.findMany({
      where: { stockQuantity: { lte: 5 }, isActive: true }, take: 4,
      select: { id: true, name: true, sku: true, stockQuantity: true, unit: true },
      orderBy: { stockQuantity: "asc" },
    }),
    db.order.findMany({
      where: { status: OrderStatus.PENDING }, take: 4, orderBy: { createdAt: "asc" },
      select: { id: true, orderNumber: true, createdAt: true, finalTotal: true },
    }),
    db.order.count({ where: { status: OrderStatus.PENDING } }),
    db.order.aggregate({
      where: { status: OrderStatus.COMPLETED, completedAt: { gte: todayStart, lte: now } },
      _sum: { finalTotal: true }, _count: { _all: true },
    }),
    db.order.count({ where: { status: OrderStatus.CANCELLED, createdAt: { gte: todayStart, lte: now } } }),
    db.order.findMany({
      where: { status: OrderStatus.COMPLETED, completedAt: { gte: chartStart } },
      select: { completedAt: true, finalTotal: true }, orderBy: { completedAt: "asc" },
    }),
  ]);

  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.finalTotal), 0);
  const salesMix = { products: 0, services: 0 };
  const paymentMix = { cash: { revenue: 0, count: 0 }, qr: { revenue: 0, count: 0 } };
  const ranked = new Map<string, RankedItem & { type: OrderItemType }>();

  for (const order of monthlyOrders) {
    const total = Number(order.finalTotal);
    if (order.paymentMethod === PaymentMethod.CASH) {
      paymentMix.cash.revenue += total;
      paymentMix.cash.count += 1;
    }
    if (order.paymentMethod === PaymentMethod.QR) {
      paymentMix.qr.revenue += total;
      paymentMix.qr.count += 1;
    }
    for (const item of order.orderItems) {
      const revenue = Number(item.lineTotal);
      if (item.itemType === OrderItemType.PRODUCT) salesMix.products += revenue;
      else salesMix.services += revenue;
      const key = `${item.itemType}:${item.itemNameSnapshot}`;
      const current = ranked.get(key) ?? {
        name: item.itemNameSnapshot, type: item.itemType, quantity: 0, revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += revenue;
      ranked.set(key, current);
    }
  }

  const rankByType = (type: OrderItemType) => Array.from(ranked.values())
    .filter((item) => item.type === type)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(({ name, quantity, revenue }) => ({ name, quantity, revenue }));
  const completedOrdersCount = monthlyOrders.length;
  const todayRevenue = Number(todayCompleted._sum.finalTotal ?? 0);

  return {
    totalRevenue: monthlyRevenue,
    completedOrdersCount,
    avgOrderValue: completedOrdersCount ? monthlyRevenue / completedOrdersCount : 0,
    lowStockCount,
    membersCount,
    recentOrders,
    lowStockProducts,
    revenueTrend: buildRevenueTrend(chartOrders, now),
    trends: {
      revenueChange: percentChange(monthlyRevenue, Number(previousPeriod._sum.finalTotal ?? 0)),
      ordersChange: percentChange(completedOrdersCount, previousPeriod._count._all),
      newMembersCount,
    },
    today: {
      revenue: todayRevenue,
      completedCount: todayCompleted._count._all,
      pendingCount,
      cancelledCount: todayCancelledCount,
      averageOrder: todayCompleted._count._all ? todayRevenue / todayCompleted._count._all : 0,
    },
    attention: {
      pendingOrders: pendingOrders.map((order) => ({
        ...order, createdAt: order.createdAt.toISOString(), finalTotal: Number(order.finalTotal),
      })),
      outOfStockCount,
      lowStockCount,
      cancelledTodayCount: todayCancelledCount,
    },
    salesMix,
    paymentMix,
    bestSellers: {
      products: rankByType(OrderItemType.PRODUCT),
      services: rankByType(OrderItemType.SERVICE),
    },
  };
};
