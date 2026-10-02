import type { MotorType } from "@prisma/client";

export interface MotorBrandDTO {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    motors: number;
  };
}

export interface MotorDTO {
  id: number;
  motorBrandId: number;
  model: string;
  type: MotorType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  motorBrand?: {
    id: number;
    name: string;
  };
}
