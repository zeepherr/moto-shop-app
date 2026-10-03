import type { Prisma } from "@prisma/client";
import { CustomerType, MotorType, OrderStatus, PaymentMethod, UserRole } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export interface AdminOrderFilters {
  search?: string;
  status?: string;
  payment?: string;
  customerType?: string;
  productId?: string;
  memberId?: string;
  brandId?: string;
  motorType?: string;
  handledById?: string;
  from?: string;
  to?: string;
  page?: string;
}

const asPositiveInt = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const enumValue = <T extends string>(value: string | undefined, values: readonly T[]) =>
  values.includes(value as T) ? value as T : undefined;

const parseBangkokDate = (value: string, endOfDay = false) => {
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export async function getAdminOrderReport(filters: AdminOrderFilters, db = defaultDb) {
  const status = enumValue(filters.status, Object.values(OrderStatus));
  const paymentMethod = enumValue(filters.payment, Object.values(PaymentMethod));
  const customerType = enumValue(filters.customerType, Object.values(CustomerType));
  const motorType = enumValue(filters.motorType, Object.values(MotorType));
  const productId = asPositiveInt(filters.productId);
  const memberId = asPositiveInt(filters.memberId);
  const brandId = asPositiveInt(filters.brandId);
  const handledById = asPositiveInt(filters.handledById);
  const page = Math.max(1, asPositiveInt(filters.page) ?? 1);
  const pageSize = 20;
  const search = filters.search?.trim();
  const from = filters.from ? parseBangkokDate(filters.from) : undefined;
  const to = filters.to ? parseBangkokDate(filters.to, true) : undefined;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(paymentMethod && { paymentMethod }),
    ...(customerType && { customerType }),
    ...(memberId && { memberId }),
    ...(handledById && { handledById }),
    ...((from || to) && { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }),
    ...(productId && { orderItems: { some: { productId } } }),
    ...((brandId || motorType) && {
      motor: {
        ...(motorType && { type: motorType }),
        ...(brandId && { motorBrandId: brandId }),
      },
    }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { member: { firstName: { contains: search, mode: "insensitive" } } },
        { member: { lastName: { contains: search, mode: "insensitive" } } },
        { member: { email: { contains: search, mode: "insensitive" } } },
        { member: { phone: { contains: search } } },
      ],
    }),
  };

  const [orders, total, aggregate, byStatus, products, members, brands, handlers] = await Promise.all([
    db.order.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        handledBy: { select: { id: true, firstName: true, lastName: true } },
        motor: { include: { motorBrand: { select: { id: true, name: true } } } },
        orderItems: { select: { id: true, itemType: true, itemNameSnapshot: true, quantity: true, unitPrice: true, lineTotal: true } },
      },
    }),
    db.order.count({ where }),
    db.order.aggregate({ where, _sum: { finalTotal: true }, _avg: { finalTotal: true } }),
    db.order.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.product.findMany({ select: { id: true, name: true, sku: true }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: UserRole.MEMBER }, select: { id: true, firstName: true, lastName: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
    db.motorBrand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: { in: [UserRole.ADMIN, UserRole.STAFF] } }, select: { id: true, firstName: true, lastName: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
  ]);

  const statusCounts = Object.fromEntries(Object.values(OrderStatus).map((value) => [value, byStatus.find((row) => row.status === value)?._count._all ?? 0]));
  return {
    filters: { page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    metrics: { total, totalValue: Number(aggregate._sum.finalTotal ?? 0), averageValue: Number(aggregate._avg.finalTotal ?? 0), statusCounts },
    options: { products, members, brands, handlers },
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerType: order.customerType,
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      finalTotal: Number(order.finalTotal),
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt?.toISOString() ?? null,
      member: order.member,
      handledBy: order.handledBy,
      motor: order.motor ? { id: order.motor.id, model: order.motor.model, type: order.motor.type, brand: order.motor.motorBrand } : null,
      items: order.orderItems.map((item) => ({ ...item, unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal) })),
    })),
  };
}
