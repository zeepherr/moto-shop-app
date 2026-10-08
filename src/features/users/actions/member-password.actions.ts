"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { MAX_OTP_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/features/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/features/auth/services/cookie.service";
import { createAuthSession } from "@/features/auth/services/auth.service";
import { createAccessToken, createRefreshToken, hashRefreshToken } from "@/features/auth/services/token.service";
import { adminPasswordChangeOtpSchema, adminPasswordChangeSchema } from "@/features/auth/schemas";
import { generateOtp, hashOtp, sendStaffPasswordOtpEmail } from "@/features/auth/services/otp.service";
import { db } from "@/lib/db";
import {
  changeStaffPasswordWithCurrentPassword,
  claimStaffPasswordChangeOtp,
  completeStaffPasswordChangeWithOtp,
  findStaffPasswordChangeOtp,
  incrementStaffPasswordChangeOtpAttempts,
  removeStaffPasswordChangeOtp,
} from "../services/staff-password.service";

async function restoreMemberSession(userId: number) {
  await clearAuthCookies();
  try {
    const member = await db.user.findFirst({ where: { id: userId, role: UserRole.MEMBER, isActive: true }, select: { id: true, email: true, role: true, firstName: true, lastName: true } });
    if (member) {
      const refreshToken = createRefreshToken();
      const session = await createAuthSession(member.id, hashRefreshToken(refreshToken));
      const accessToken = await createAccessToken({ sessionId: session.id, userId: member.id, email: member.email ?? "", role: member.role, firstName: member.firstName, lastName: member.lastName });
      await setAuthCookies(accessToken, refreshToken);
      return true;
    }
  } catch { /* The password is already changed; continue to a clean sign-in state. */ }
  await clearAuthCookies();
  return false;
}

async function passwordChanged(userId: number) {
  const restored = await restoreMemberSession(userId);
  return { success: true as const, message: restored ? "Password updated. Other signed-in devices have been logged out." : "Password updated. Please sign in again on this device." };
}

export async function changeMemberPasswordWithCurrentPasswordAction(input: unknown) {
  const session = await getCurrentUser();
  if (!session || session.role !== UserRole.MEMBER) return { success: false, error: "Only members can change this password." };
  const parsed = adminPasswordChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the password fields." };
  const member = await db.user.findFirst({ where: { id: session.id, role: UserRole.MEMBER, isActive: true }, select: { password: true } });
  if (!member || !(await bcrypt.compare(parsed.data.currentPassword, member.password))) return { success: false, error: "Current password is incorrect." };
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const changed = await changeStaffPasswordWithCurrentPassword({ userId: session.id, currentPasswordHash: member.password, passwordHash, role: UserRole.MEMBER });
    if (!changed) return { success: false, error: "Your password changed before this update finished. Try again." };
  } catch { return { success: false, error: "Unable to change your password right now. Please try again." }; }
  return passwordChanged(session.id);
}

export async function requestMemberPasswordChangeOtpAction() {
  const session = await getCurrentUser();
  if (!session || session.role !== UserRole.MEMBER) return { success: false, error: "Only members can change this password." };
  const member = await db.user.findFirst({ where: { id: session.id, role: UserRole.MEMBER, isActive: true }, select: { id: true, email: true } });
  if (!member?.email) return { success: false, error: "Add an account email before using email verification." };
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  try {
    const claimed = await claimStaffPasswordChangeOtp({ userId: member.id, otpHash, otpExpiresAt, cooldownMs: OTP_RESEND_COOLDOWN_MS, role: UserRole.MEMBER });
    if (!claimed) {
      const latest = await db.user.findUnique({ where: { id: member.id }, select: { passwordResetOtpLastSentAt: true } });
      const resendAvailableAt = latest?.passwordResetOtpLastSentAt ? new Date(latest.passwordResetOtpLastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS) : undefined;
      const seconds = resendAvailableAt ? Math.max(1, Math.ceil((resendAvailableAt.getTime() - Date.now()) / 1000)) : 1;
      return { success: false, error: `Wait ${seconds} seconds before requesting another code.`, resendAvailableAt };
    }
    try { await sendStaffPasswordOtpEmail(member.email, otp, "member"); }
    catch {
      await removeStaffPasswordChangeOtp(member.id, otpHash).catch(() => undefined);
      return { success: false, error: "Could not send a verification code. Try again after the cooldown.", resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS) };
    }
    return { success: true, message: "A verification code was sent to your current account email.", resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS), expiresAt: otpExpiresAt };
  } catch { return { success: false, error: "Could not request a verification code. Please try again." }; }
}

export async function changeMemberPasswordWithOtpAction(input: unknown) {
  const session = await getCurrentUser();
  if (!session || session.role !== UserRole.MEMBER) return { success: false, error: "Only members can change this password." };
  const parsed = adminPasswordChangeOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the code and password fields." };
  const pending = await findStaffPasswordChangeOtp(session.id);
  const now = new Date();
  if (!pending || pending.otpExpiresAt <= now || pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    if (pending?.otpExpiresAt && pending.otpExpiresAt <= now) await removeStaffPasswordChangeOtp(session.id);
    return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  }
  const codeHash = hashOtp(parsed.data.code);
  if (pending.otpHash !== codeHash) {
    const attempts = await incrementStaffPasswordChangeOtpAttempts(session.id);
    return { success: false, error: attempts.count && pending.otpAttempts + 1 >= MAX_OTP_ATTEMPTS ? "Too many incorrect codes. Request a new code to continue." : "That code is incorrect. Check it and try again.", attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - pending.otpAttempts - 1) };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const changed = await completeStaffPasswordChangeWithOtp({ userId: session.id, otpHash: codeHash, passwordHash, role: UserRole.MEMBER });
    if (!changed) return { success: false, error: "That code is invalid or expired. Request a new code to continue." };
  } catch { return { success: false, error: "Unable to change your password right now. Please try again." }; }
  return passwordChanged(session.id);
}
