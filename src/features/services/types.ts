export interface MotoServiceDTO {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
