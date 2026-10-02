import { db as defaultDb } from "@/lib/db";
import { OrderStatus, UserRole } from "@prisma/client";

export const getDashboardSummary = async (db = defaultDb) => {
  const [revenueAgg, completedOrdersCount, lowStockCount, membersCount, recentOrders] =
    await Promise.all([
      db.order.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { finalTotal: true },
      }),
      db.order.count({
        where: { status: OrderStatus.COMPLETED },
      }),
      db.product.count({
        where: { stockQuantity: { lte: 5 }, isActive: true },
      }),
      db.user.count({
        where: { role: UserRole.MEMBER },
      }),
      db.order.findMany({
        where: { status: OrderStatus.COMPLETED },
        take: 5,
        orderBy: { completedAt: "desc" },
        include: {
          member: { select: { firstName: true, lastName: true, email: true } },
          orderItems: true,
        },
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.finalTotal || 0);
  const avgOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

  return {
    totalRevenue,
    completedOrdersCount,
    avgOrderValue,
    lowStockCount,
    membersCount,
    recentOrders,
  };
};
