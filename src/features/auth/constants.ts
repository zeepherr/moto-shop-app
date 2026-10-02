export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const MAX_OTP_ATTEMPTS = 5;
export const PENDING_REGISTRATION_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  MEMBER: "MEMBER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
