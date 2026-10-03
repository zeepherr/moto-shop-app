import { OrderItemType, OrderStatus, PaymentMethod } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export type RevenuePeriod = "today" | "week" | "month" | "year";

const SHOP_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const shopDateParts = (date: Date) => {
  const shifted = new Date(date.getTime() + SHOP_UTC_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
  };
};

const shopDate = (year: number, month: number, day: number, hour = 0) =>
  new Date(Date.UTC(year, month, day, hour) - SHOP_UTC_OFFSET_MS);

const getRange = (period: RevenuePeriod, now: Date) => {
  const parts = shopDateParts(now);
  if (period === "today") return { start: shopDate(parts.year, parts.month, parts.day), end: now };
  if (period === "month") return { start: shopDate(parts.year, parts.month, 1), end: now };
  if (period === "year") return { start: shopDate(parts.year, 0, 1), end: now };
  const weekday = new Date(Date.UTC(parts.year, parts.month, parts.day)).getUTCDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  return {
    start: shopDate(parts.year, parts.month, parts.day - mondayOffset),
    end: now,
  };
};

const bucketKey = (date: Date, period: RevenuePeriod) => {
  const { year, month, day, hour } = shopDateParts(date);
  if (period === "today") return `${String(hour).padStart(2, "0")}:00`;
  if (period === "year") return `${year}-${String(month + 1).padStart(2, "0")}`;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const buildBuckets = (period: RevenuePeriod, start: Date, now: Date) => {
  if (period === "today") {
    const currentHour = shopDateParts(now).hour;
    return Array.from({ length: currentHour + 1 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
  }
  if (period === "year") {
    const { year, month } = shopDateParts(now);
    return Array.from({ length: month + 1 }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
  }
  const count = Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
  return Array.from({ length: count }, (_, index) => bucketKey(new Date(start.getTime() + index * DAY_MS), period));
};

export async function getRevenueReport(period: RevenuePeriod, db = defaultDb) {
  const now = new Date();
  const { start, end } = getRange(period, now);
  const orders = await db.order.findMany({
    where: { status: OrderStatus.COMPLETED, completedAt: { gte: start, lte: end } },
    select: {
      id: true,
      orderNumber: true,
      completedAt: true,
      finalTotal: true,
      discountAmount: true,
      paymentMethod: true,
      member: { select: { firstName: true, lastName: true } },
      handledBy: { select: { firstName: true, lastName: true } },
      orderItems: {
        select: {
          itemType: true,
          quantity: true,
          lineTotal: true,
          product: { select: { costPrice: true } },
        },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  let revenue = 0;
  let productRevenue = 0;
  let serviceRevenue = 0;
  let estimatedProductCost = 0;
  let discounts = 0;
  const paymentMix = { cash: 0, qr: 0 };
  const buckets = new Map(buildBuckets(period, start, now).map((key) => [key, 0]));

  for (const order of orders) {
    const orderRevenue = Number(order.finalTotal);
    revenue += orderRevenue;
    discounts += Number(order.discountAmount);
    if (order.paymentMethod === PaymentMethod.CASH) paymentMix.cash += orderRevenue;
    if (order.paymentMethod === PaymentMethod.QR) paymentMix.qr += orderRevenue;
    if (order.completedAt) {
      const key = bucketKey(order.completedAt, period);
      buckets.set(key, (buckets.get(key) ?? 0) + orderRevenue);
    }
    for (const item of order.orderItems) {
      const lineTotal = Number(item.lineTotal);
      if (item.itemType === OrderItemType.PRODUCT) {
        productRevenue += lineTotal;
        if (item.product) estimatedProductCost += Number(item.product.costPrice) * item.quantity;
      } else {
        serviceRevenue += lineTotal;
      }
    }
  }

  return {
    period,
    range: { start: start.toISOString(), end: end.toISOString() },
    metrics: {
      revenue,
      orderCount: orders.length,
      averageOrder: orders.length ? revenue / orders.length : 0,
      productRevenue,
      serviceRevenue,
      estimatedProductCost,
      estimatedGrossProfit: revenue - estimatedProductCost,
      estimatedGrossMargin: revenue ? ((revenue - estimatedProductCost) / revenue) * 100 : 0,
      discounts,
    },
    trend: Array.from(buckets, ([label, value]) => ({ label, value })),
    paymentMix,
    transactions: orders.slice(0, 25).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      completedAt: order.completedAt?.toISOString() ?? null,
      customer: order.member ? `${order.member.firstName} ${order.member.lastName}` : "Walk-in customer",
      handledBy: `${order.handledBy.firstName} ${order.handledBy.lastName}`,
      paymentMethod: order.paymentMethod,
      total: Number(order.finalTotal),
    })),
  };
}
