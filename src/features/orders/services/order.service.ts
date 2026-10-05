import { db as defaultDb } from "@/lib/db";
import {
  OrderStatus,
  CustomerType,
  OrderItemType,
  UserRole,
  type PaymentMethod,
  type Prisma,
} from "@prisma/client";
import type { OrderItemInput } from "../schemas";

async function lockPendingOrder(
  tx: Prisma.TransactionClient,
  orderId: number,
  complete = false,
) {
  const result = await tx.order.updateMany({
    where: { id: orderId, status: OrderStatus.PENDING },
    data: { status: complete ? OrderStatus.COMPLETED : OrderStatus.PENDING },
  });

  if (result.count === 0) {
    throw new Error("Pending order is no longer available");
  }
}

async function assertMemberOwnsMotor(
  tx: Prisma.TransactionClient,
  memberId: number | null | undefined,
  motorId: number | null | undefined,
) {
  if (motorId == null) return;
  if (memberId == null) throw new Error("Select a customer before attaching a motorcycle");
  const association = await tx.userMotor.findFirst({ where: { userId: memberId, motorId } });
  if (!association) throw new Error("Selected motorcycle is not registered to this customer");
}

async function loadCatalogItems(
  tx: Prisma.TransactionClient,
  items: OrderItemInput[],
) {
  const productIds = [...new Set(
    items.flatMap((item) =>
      item.itemType === OrderItemType.PRODUCT && item.productId ? [item.productId] : [],
    ),
  )];
  const serviceIds = [...new Set(
    items.flatMap((item) =>
      item.itemType === OrderItemType.SERVICE && item.serviceId ? [item.serviceId] : [],
    ),
  )];

  const products = productIds.length
    ? await tx.product.findMany({ where: { id: { in: productIds } } })
    : [];
  const services = serviceIds.length
    ? await tx.service.findMany({ where: { id: { in: serviceIds } } })
    : [];

  return {
    productsById: new Map(products.map((product) => [product.id, product])),
    servicesById: new Map(services.map((service) => [service.id, service])),
  };
}

export const findPendingOrders = async (db = defaultDb) => {
  return await db.order.findMany({
    where: { status: OrderStatus.PENDING },
    take: 50,
    include: {
      orderItems: true,
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findOrderById = async (id: number, db = defaultDb) => {
  return await db.order.findFirst({
    where: { id, status: OrderStatus.PENDING },
    include: {
      orderItems: { include: { product: { select: { stockQuantity: true, isActive: true } } } },
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

const checkoutReceiptInclude = {
  orderItems: true,
  member: { select: { firstName: true, lastName: true } },
  motor: { select: { model: true, motorBrand: { select: { name: true } } } },
} satisfies Prisma.OrderInclude;

export const cancelPendingOrder = async (
  data: { id: number; cancelledById: number; reason: string },
  db = defaultDb,
) => {
  return await db.order.updateMany({
    where: { id: data.id, status: OrderStatus.PENDING },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledById: data.cancelledById,
      cancellationReason: data.reason,
    },
  });
};

export const holdPendingOrder = async (
  data: {
    orderId?: number | null;
    handledById: number;
    memberId?: number | null;
    motorId?: number | null;
    items: OrderItemInput[];
  },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    await assertMemberOwnsMotor(tx, data.memberId, data.motorId);
    const { productsById, servicesById } = await loadCatalogItems(tx, data.items);
    let subtotal = 0;
    const preparedItems = [];

    for (const item of data.items) {
      if (item.itemType === OrderItemType.PRODUCT && item.productId) {
        const prod = productsById.get(item.productId);
        if (!prod) throw new Error(`Product #${item.productId} not found`);
        const price = Number(prod.sellingPrice);
        subtotal += price * item.quantity;
        preparedItems.push({
          itemType: OrderItemType.PRODUCT,
          productId: prod.id,
          itemNameSnapshot: prod.name,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal: price * item.quantity,
        });
      } else if (item.itemType === OrderItemType.SERVICE && item.serviceId) {
        const serv = servicesById.get(item.serviceId);
        if (!serv) throw new Error(`Service #${item.serviceId} not found`);
        const price = Number(serv.price);
        subtotal += price * item.quantity;
        preparedItems.push({
          itemType: OrderItemType.SERVICE,
          serviceId: serv.id,
          itemNameSnapshot: serv.name,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal: price * item.quantity,
        });
      }
    }

    const customerType = data.memberId ? CustomerType.MEMBER : CustomerType.GUEST;

    if (data.orderId) {
      await lockPendingOrder(tx, data.orderId);

      // Update existing pending order
      return await tx.order.update({
        where: { id: data.orderId },
        data: {
          memberId: data.memberId,
          motorId: data.motorId,
          customerType,
          subtotal,
          discountRate: 0,
          discountAmount: 0,
          finalTotal: subtotal,
          orderItems: {
            deleteMany: {},
            create: preparedItems,
          },
        },
        include: { orderItems: true },
      });
    }

    // Create new pending order
    return await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        handledById: data.handledById,
        memberId: data.memberId,
        motorId: data.motorId,
        customerType,
        subtotal,
        finalTotal: subtotal,
        status: OrderStatus.PENDING,
        orderItems: {
          create: preparedItems,
        },
      },
      include: { orderItems: true },
    });
  });
};

export const executeCheckoutTx = async (
  data: {
    handledById: number;
    memberId?: number | null;
    motorId?: number | null;
    items: OrderItemInput[];
    paymentMethod: PaymentMethod | null;
    receivedAmount: number;
    discountRate: number;
    pendingOrderId?: number | null;
  },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    await assertMemberOwnsMotor(tx, data.memberId, data.motorId);
    const member = data.memberId
      ? await tx.user.findFirst({
          where: { id: data.memberId, role: UserRole.MEMBER, isActive: true },
          select: { id: true },
        })
      : null;
    if (data.memberId && !member) {
      throw new Error("Selected member is no longer active. Choose a current member or check out as a guest.");
    }
    const configuredDiscount = await tx.shopSetting.findUnique({
      where: { id: 1 },
      select: { productDiscountRate: true },
    });
    const discountRate = Number(configuredDiscount?.productDiscountRate ?? 0);
    if (discountRate !== data.discountRate) {
      throw new Error("The product discount changed. Refresh the POS before checking out.");
    }
    const appliedDiscountRate = member ? discountRate : 0;
    if (data.pendingOrderId) {
      await lockPendingOrder(tx, data.pendingOrderId, true);
    }

    const { productsById, servicesById } = await loadCatalogItems(tx, data.items);
    const remainingStockByProductId = new Map(
      [...productsById].map(([productId, product]) => [productId, product.stockQuantity]),
    );
    let productSubtotal = 0;
    let serviceSubtotal = 0;
    const preparedItems = [];

    // Verify stock & calculate totals
    for (const item of data.items) {
      if (item.itemType === OrderItemType.PRODUCT && item.productId) {
        const prod = productsById.get(item.productId);
        if (!prod || !prod.isActive) throw new Error(`Product #${item.productId} unavailable`);
        const remainingStock = remainingStockByProductId.get(prod.id) ?? 0;
        if (remainingStock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}" (Available: ${remainingStock})`);
        }

        const stockUpdated = await tx.product.updateMany({
          where: { id: prod.id, isActive: true, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (stockUpdated.count === 0) {
          throw new Error(`Insufficient stock for "${prod.name}" (Available: ${remainingStock})`);
        }
        remainingStockByProductId.set(prod.id, remainingStock - item.quantity);

        const price = Number(prod.sellingPrice);
        productSubtotal += price * item.quantity;
        preparedItems.push({
          itemType: OrderItemType.PRODUCT,
          productId: prod.id,
          itemNameSnapshot: prod.name,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal: price * item.quantity,
        });
      } else if (item.itemType === OrderItemType.SERVICE && item.serviceId) {
        const serv = servicesById.get(item.serviceId);
        if (!serv || !serv.isActive) throw new Error(`Service #${item.serviceId} unavailable`);
        const price = Number(serv.price);
        serviceSubtotal += price * item.quantity;
        preparedItems.push({
          itemType: OrderItemType.SERVICE,
          serviceId: serv.id,
          itemNameSnapshot: serv.name,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal: price * item.quantity,
        });
      }
    }

    const subtotal = productSubtotal + serviceSubtotal;
    const discountAmount = Math.min(
      Math.round((productSubtotal * appliedDiscountRate) / 100 * 100) / 100,
      productSubtotal,
    );
    const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    if (data.receivedAmount < finalTotal) {
      throw new Error(`Received amount (฿${data.receivedAmount}) is less than total (฿${finalTotal})`);
    }

    const customerType = member ? CustomerType.MEMBER : CustomerType.GUEST;

    // If completing an existing pending ticket
    if (data.pendingOrderId) {
      await tx.order.update({
        where: { id: data.pendingOrderId },
        data: {
          status: OrderStatus.COMPLETED,
          paymentMethod: data.paymentMethod,
          receivedAmount: data.receivedAmount,
          completedAt: new Date(),
          memberId: data.memberId,
          motorId: data.motorId,
          customerType,
          subtotal,
          discountRate: appliedDiscountRate,
          discountAmount,
          finalTotal,
          orderItems: {
            deleteMany: {},
            create: preparedItems,
          },
        },
      });
      return await tx.order.findUnique({
        where: { id: data.pendingOrderId },
        include: checkoutReceiptInclude,
      });
    }

    // Direct checkout
    return await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        handledById: data.handledById,
        memberId: data.memberId,
        motorId: data.motorId,
        customerType,
        subtotal,
        discountRate: appliedDiscountRate,
        discountAmount,
        finalTotal,
        status: OrderStatus.COMPLETED,
        paymentMethod: data.paymentMethod,
        receivedAmount: data.receivedAmount,
        completedAt: new Date(),
        orderItems: {
          create: preparedItems,
        },
      },
      include: checkoutReceiptInclude,
    });
  });
};
