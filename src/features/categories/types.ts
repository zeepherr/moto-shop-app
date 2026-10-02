export interface ProductCategoryDTO {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    products: number;
  };
}
