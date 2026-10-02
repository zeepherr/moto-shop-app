export interface ProductDTO {
  id: number;
  productCategoryId: number;
  sku: string;
  name: string;
  description: string | null;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  unit: string;
  imageKey: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
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
