import { OrderItemType, OrderStatus, type PaymentMethod, type UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

const SHOP_TIME_ZONE = "Asia/Bangkok";
const SHOP_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_SALES_LIMIT = 30;

const getBangkokDayRange = (now: Date) => {
  const shopDate = new Date(now.getTime() + SHOP_UTC_OFFSET_MS);
  const start = new Date(
    Date.UTC(shopDate.getUTCFullYear(), shopDate.getUTCMonth(), shopDate.getUTCDate()) -
      SHOP_UTC_OFFSET_MS,
  );
  return { start, end: new Date(start.getTime() + DAY_MS) };
};

const getBangkokDateKey = (date: Date) => {
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

export interface StaffDailySalesReport {
  date: string;
  metrics: {
    completedOrderCount: number;
    revenue: number;
    averageOrderValue: number;
  };
  payments: Array<{
    method: PaymentMethod | "UNSPECIFIED";
    orderCount: number;
    revenue: number;
  }>;
  itemSales: Array<{
    type: "PRODUCT" | "SERVICE";
    quantity: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: number;
    orderNumber: string;
    completedAt: string | null;
    customerType: "MEMBER" | "GUEST";
    paymentMethod: PaymentMethod | null;
    total: number;
    items: Array<{ name: string; type: "PRODUCT" | "SERVICE"; quantity: number; total: number }>;
  }>;
}

export const getStaffDailySales = async (
  staffId: number,
  now = new Date(),
  db = defaultDb,
): Promise<StaffDailySalesReport> => {
  const { start, end } = getBangkokDayRange(now);
  const where = {
    handledById: staffId,
    status: OrderStatus.COMPLETED,
    completedAt: { gte: start, lt: end },
  } as const;

  const [aggregate, paymentGroups, itemGroups, orders] = await Promise.all([
    db.order.aggregate({
      where,
      _count: { _all: true },
      _sum: { finalTotal: true },
      _avg: { finalTotal: true },
    }),
    db.order.groupBy({
      by: ["paymentMethod"],
      where,
      _count: { _all: true },
      _sum: { finalTotal: true },
    }),
    db.orderItem.groupBy({
      by: ["itemType"],
      where: {
        order: {
          is: {
            handledById: staffId,
            status: OrderStatus.COMPLETED,
            completedAt: { gte: start, lt: end },
          },
        },
      },
      _sum: { quantity: true, lineTotal: true },
    }),
    db.order.findMany({
      where,
      take: RECENT_SALES_LIMIT,
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        completedAt: true,
        customerType: true,
        paymentMethod: true,
        finalTotal: true,
        orderItems: {
          select: {
            itemType: true,
            itemNameSnapshot: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    }),
  ]);

  return {
    date: getBangkokDateKey(now),
    metrics: {
      completedOrderCount: aggregate._count._all,
      revenue: Number(aggregate._sum.finalTotal ?? 0),
      averageOrderValue: Number(aggregate._avg.finalTotal ?? 0),
    },
    payments: paymentGroups.map((group) => ({
      method: group.paymentMethod ?? "UNSPECIFIED",
      orderCount: group._count._all,
      revenue: Number(group._sum.finalTotal ?? 0),
    })),
    itemSales: itemGroups.map((group) => ({
      type: group.itemType === OrderItemType.PRODUCT ? "PRODUCT" : "SERVICE",
      quantity: group._sum.quantity ?? 0,
      revenue: Number(group._sum.lineTotal ?? 0),
    })),
    recentSales: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      completedAt: order.completedAt?.toISOString() ?? null,
      customerType: order.customerType,
      paymentMethod: order.paymentMethod,
      total: Number(order.finalTotal),
      items: order.orderItems.map((item) => ({
        name: item.itemNameSnapshot,
        type: item.itemType === OrderItemType.PRODUCT ? "PRODUCT" : "SERVICE",
        quantity: item.quantity,
        total: Number(item.lineTotal),
      })),
    })),
  };
};

export const getStaffDailySalesForUser = async (
  user: { id: number; role: UserRole },
  now = new Date(),
  db = defaultDb,
) => {
  if (user.role !== "STAFF") return null;
  return getStaffDailySales(user.id, now, db);
};
