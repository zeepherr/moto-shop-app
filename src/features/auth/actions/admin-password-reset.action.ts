"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS, MAX_OTP_ATTEMPTS } from "@/features/auth/constants";
import {
  generateOtp,
  hashOtp,
  sendAdminPasswordOtpEmail,
} from "@/features/auth/services/otp.service";
import {
  claimAdminPasswordReset,
  completeAdminPasswordReset,
  findAdminPasswordResetRequest,
  incrementAdminPasswordResetAttempts,
  removeAdminPasswordResetRequest,
} from "@/features/auth/services/admin-password-reset.service";
import {
  completeAdminPasswordResetSchema,
  requestAdminPasswordResetSchema,
} from "@/features/auth/schemas";

const genericRequestMessage = "If an active admin account matches this address, follow the reset instructions sent to it. Check your inbox and spam folder.";
const invalidCodeMessage = "That code is invalid or expired. Request a new code to continue.";

export const requestAdminPasswordResetAction = async (input: unknown) => {
  const parsed = requestAdminPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (user?.role === UserRole.ADMIN && user.isActive && user.email) {
      const otp = generateOtp();
      const otpHash = hashOtp(otp);
      const claimed = await claimAdminPasswordReset({
        userId: user.id,
        otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
        cooldownMs: OTP_RESEND_COOLDOWN_MS,
      });

      if (claimed) {
        try {
          await sendAdminPasswordOtpEmail(user.email, otp);
        } catch {
          await removeAdminPasswordResetRequest(user.id, otpHash).catch(() => undefined);
        }
      }
    }
  } catch {
    // Keep the public response the same for unknown accounts and delivery or storage failures.
  }

  return { success: true, message: genericRequestMessage };
};

export const completeAdminPasswordResetAction = async (input: unknown) => {
  const parsed = completeAdminPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Check the code and password fields." };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, isActive: true },
  });
  if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
    return { success: false, error: invalidCodeMessage };
  }

  const pending = await findAdminPasswordResetRequest(user.id);
  const codeHash = hashOtp(parsed.data.code);
  if (!pending || pending.otpExpiresAt <= new Date() || pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    if (pending?.otpExpiresAt && pending.otpExpiresAt <= new Date()) {
      await removeAdminPasswordResetRequest(user.id);
    }
    return { success: false, error: invalidCodeMessage };
  }

  if (pending.otpHash !== codeHash) {
    await incrementAdminPasswordResetAttempts(user.id);
    return { success: false, error: invalidCodeMessage };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const completed = await completeAdminPasswordReset({ userId: user.id, otpHash: codeHash, passwordHash });
    if (!completed) return { success: false, error: invalidCodeMessage };
  } catch {
    return { success: false, error: "Unable to reset your password right now. Please try again." };
  }

  return { success: true, message: "Your password has been reset. Sign in with your new password." };
};
