import { db as defaultDb } from "@/lib/db";
import { OrderStatus, CustomerType, OrderItemType, type PaymentMethod } from "@prisma/client";
import type { OrderItemInput } from "../schemas";

export const findPendingOrders = async (db = defaultDb) => {
  return await db.order.findMany({
    where: { status: OrderStatus.PENDING },
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
  return await db.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
      member: true,
      handledBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const cancelPendingOrder = async (id: number, db = defaultDb) => {
  return await db.order.updateMany({
    where: { id, status: OrderStatus.PENDING },
    data: { status: OrderStatus.CANCELLED },
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
    let subtotal = 0;
    const preparedItems = [];

    for (const item of data.items) {
      if (item.itemType === OrderItemType.PRODUCT && item.productId) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
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
        const serv = await tx.service.findUnique({ where: { id: item.serviceId } });
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
      // Update existing pending order
      return await tx.order.update({
        where: { id: data.orderId },
        data: {
          memberId: data.memberId,
          motorId: data.motorId,
          customerType,
          subtotal,
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
    paymentMethod: PaymentMethod;
    receivedAmount: number;
    pendingOrderId?: number | null;
  },
  db = defaultDb,
) => {
  return await db.$transaction(async (tx) => {
    let subtotal = 0;
    const preparedItems = [];

    // Verify stock & calculate totals
    for (const item of data.items) {
      if (item.itemType === OrderItemType.PRODUCT && item.productId) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod || !prod.isActive) throw new Error(`Product #${item.productId} unavailable`);
        if (prod.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}" (Available: ${prod.stockQuantity})`);
        }

        // Deduct stock atomically
        await tx.product.update({
          where: { id: prod.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });

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
        const serv = await tx.service.findUnique({ where: { id: item.serviceId } });
        if (!serv || !serv.isActive) throw new Error(`Service #${item.serviceId} unavailable`);
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

    if (data.receivedAmount < subtotal) {
      throw new Error(`Received amount ($${data.receivedAmount}) is less than total ($${subtotal})`);
    }

    const customerType = data.memberId ? CustomerType.MEMBER : CustomerType.GUEST;

    // If completing an existing pending ticket
    if (data.pendingOrderId) {
      await tx.order.update({
        where: { id: data.pendingOrderId },
        data: {
          status: OrderStatus.COMPLETED,
          paymentMethod: data.paymentMethod,
          receivedAmount: data.receivedAmount,
          completedAt: new Date(),
          subtotal,
          finalTotal: subtotal,
          orderItems: {
            deleteMany: {},
            create: preparedItems,
          },
        },
      });
      return await tx.order.findUnique({
        where: { id: data.pendingOrderId },
        include: { orderItems: true },
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
        finalTotal: subtotal,
        status: OrderStatus.COMPLETED,
        paymentMethod: data.paymentMethod,
        receivedAmount: data.receivedAmount,
        completedAt: new Date(),
        orderItems: {
          create: preparedItems,
        },
      },
      include: { orderItems: true },
    });
  });
};
