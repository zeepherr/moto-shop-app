export interface MemberProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  emailVerifiedAt: string | null;
  emailResendCooldownSeconds: number;
  emailChangeExpiresSeconds: number;
  emailChangeRequest: { newEmail: string; otpExpiresAt: string; otpAttempts: number } | null;
  userMotors: Array<{
    motorId: number;
    licensePlate: string | null;
    motor: { model: string; type: string; motorBrand: { name: string } };
  }>;
  motorSuggestions: Array<{ id: number; brandName: string; model: string; type: string; status: string; createdAt: string; reviewNote: string | null }>;
  orders: Array<{
    id: number;
    orderNumber: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    createdAt: string;
    completedAt: string | null;
    finalTotal: number;
    motor: { model: string; motorBrand: { name: string } } | null;
    orderItems: Array<{ id: number; itemType: "PRODUCT" | "SERVICE"; itemNameSnapshot: string; quantity: number; lineTotal: number }>;
  }>;
  stats: { totalVisits: number; totalSpent: number };
}
