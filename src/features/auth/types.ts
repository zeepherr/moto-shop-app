import type { UserRole } from "./constants";

export interface AuthSessionPayload {
  userId: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthUserDTO {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  emailVerifiedAt?: Date | null;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  error?: string;
  attemptsRemaining?: number;
  resendAvailableAt?: Date;
}
