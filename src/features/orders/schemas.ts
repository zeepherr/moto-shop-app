import { z } from "zod";

export const orderItemInputSchema = z
  .object({
    itemType: z.enum(["PRODUCT", "SERVICE"]),
    productId: z.number().int().positive().optional().nullable(),
    serviceId: z.number().int().positive().optional().nullable(),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  })
  .superRefine((item, ctx) => {
    if (item.itemType === "PRODUCT" && !item.productId) {
      ctx.addIssue({
        code: "custom",
        path: ["productId"],
        message: "Product ID is required for PRODUCT items",
      });
    }
    if (item.itemType === "SERVICE" && !item.serviceId) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceId"],
        message: "Service ID is required for SERVICE items",
      });
    }
  });

export const checkoutOrderSchema = z.object({
  memberId: z.number().int().positive().optional().nullable(),
  motorId: z.number().int().positive().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, "Order must contain at least one item"),
  paymentMethod: z.enum(["CASH", "QR"]),
  receivedAmount: z.coerce.number().positive("Received amount must be greater than 0"),
  pendingOrderId: z.number().int().positive().optional().nullable(),
});

export const holdOrderSchema = z.object({
  orderId: z.number().int().positive().optional().nullable(),
  memberId: z.number().int().positive().optional().nullable(),
  motorId: z.number().int().positive().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, "Order must contain at least one item"),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;
export type HoldOrderInput = z.infer<typeof holdOrderSchema>;
