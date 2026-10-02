import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must not exceed 100 characters"),

  sku: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.string().trim().max(50, "SKU must not exceed 50 characters").optional()),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit must not exceed 30 characters"),

  costPrice: z.coerce
    .number({ error: "Cost price must be a number" })
    .min(0, "Cost price cannot be negative"),

  sellingPrice: z.coerce
    .number({ error: "Selling price must be a number" })
    .positive("Selling price must be greater than 0"),

  stockQuantity: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return 0;
      return value;
    },
    z.coerce
      .number({ error: "Stock quantity must be a number" })
      .int("Stock quantity must be a whole number")
      .min(0, "Stock quantity cannot be negative")
      .default(0),
  ),

  productCategoryId: z.coerce
    .number({ error: "Product category is required" })
    .int("Product category ID must be an integer")
    .positive("Invalid product category"),

  imageKey: z.string().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const presignedUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|gif|svg\+xml)$/, "Unsupported image format"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;
