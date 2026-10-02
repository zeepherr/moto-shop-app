import type { Prisma } from "@prisma/client";

export interface ProductDTO {
  id: number;
  productCategoryId: number;
  sku: string;
  name: string;
  description: string | null;
  costPrice: number | string | Prisma.Decimal;
  sellingPrice: number | string | Prisma.Decimal;
  stockQuantity: number;
  unit: string;
  imageKey: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productCategory?: {
    id: number;
    name: string;
  };
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}
