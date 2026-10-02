"use server";

import { getSessionTokenFromCookies } from "../services/cookie.service";
import { verifyAccessToken } from "../services/token.service";
import { findUserByEmail } from "../services/auth.service";
import type { AuthUserDTO } from "../types";

export const getCurrentUser = async (): Promise<AuthUserDTO | null> => {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.email) return null;

  const user = await findUserByEmail(payload.email);
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    emailVerifiedAt: user.emailVerifiedAt,
  };
};
