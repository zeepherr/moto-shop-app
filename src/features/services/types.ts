import type { Prisma } from "@prisma/client";

export interface MotoServiceDTO {
  id: number;
  name: string;
  description: string | null;
  price: number | string | Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
