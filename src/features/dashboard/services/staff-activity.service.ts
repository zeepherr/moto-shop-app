import { OrderStatus, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export const getMonthlyStaffActivity = async (from: Date, through: Date, db = defaultDb) => {
  const handledOrders = await db.order.groupBy({
    by: ["handledById"],
    where: { status: OrderStatus.COMPLETED, completedAt: { gte: from, lte: through } },
    _count: { _all: true },
    _sum: { finalTotal: true },
  });
  if (!handledOrders.length) return [];

  const staff = await db.user.findMany({
    where: { id: { in: handledOrders.map((item) => item.handledById) }, role: UserRole.STAFF },
    select: { id: true, firstName: true, lastName: true },
  });
  const staffById = new Map(staff.map((user) => [user.id, user]));

  return handledOrders.flatMap((item) => {
    const user = staffById.get(item.handledById);
    if (!user) return [];
    const orderCount = item._count._all;
    const handledRevenue = Number(item._sum.finalTotal ?? 0);
    return [{
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      orderCount,
      handledRevenue,
      averageOrder: orderCount ? handledRevenue / orderCount : 0,
    }];
  }).sort((a, b) => b.handledRevenue - a.handledRevenue);
};
