export interface StaffProfileData {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  emailChangeOtpLastSentAt: string | null;
  emailResendCooldownSeconds: number;
  emailChangeExpiresSeconds: number;
  emailChangeRequest: { newEmail: string; otpExpiresAt: string; otpAttempts: number } | null;
  userInfo: { photoUrl: string | null } | null;
}
