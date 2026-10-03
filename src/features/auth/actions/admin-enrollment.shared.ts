import { config } from "@/config";
import { revalidatePath } from "next/cache";
import { UserAuditAction } from "@prisma/client";
import { getCurrentUser } from "./session.action";
import { beginPasswordSetup, createPasswordSetupToken, hashPasswordSetupToken } from "../services/enrollment-assisted.service";
import { recordEnrollmentEvent } from "../services/enrollment.service";
import { sendPasswordSetupEmail } from "../services/otp.service";

const ENROLLMENT_TTL_MS = 24 * 60 * 60 * 1000;

export const requireAdmin = async () => {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
};

export const revalidateUsers = () => revalidatePath("/admin/users");

export async function sendPasswordSetupLink(enrollmentId: number, email: string, actorUserId: number) {
  const token = createPasswordSetupToken();
  const issued = await beginPasswordSetup({
    enrollmentId,
    tokenHash: hashPasswordSetupToken(token),
    expiresAt: new Date(Date.now() + ENROLLMENT_TTL_MS),
  });
  if (!issued) return { success: false, error: "Password setup is no longer available for this enrollment." };

  try {
    await sendPasswordSetupEmail(email, `${config.app.url}/set-password?token=${encodeURIComponent(token)}`, `${config.app.url}/login`);
  } catch (error) {
    await recordEnrollmentEvent({
      enrollmentId,
      actorUserId,
      action: UserAuditAction.PASSWORD_SETUP_LINK_DELIVERY_FAILED,
      detail: error instanceof Error ? error.message : "Email delivery failed",
    });
    throw error;
  }
  await recordEnrollmentEvent({ enrollmentId, actorUserId, action: UserAuditAction.PASSWORD_SETUP_LINK_SENT });
  return { success: true };
}