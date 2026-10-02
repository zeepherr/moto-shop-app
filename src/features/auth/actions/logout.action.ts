"use server";

import type { ActionResult } from "../types";
import { getRefreshTokenFromCookies, clearAuthCookies } from "../services/cookie.service";
import { hashRefreshToken } from "../services/token.service";
import { revokeSession } from "../services/auth.service";

export const logoutAction = async (): Promise<ActionResult> => {
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    const hashed = hashRefreshToken(refreshToken);
    await revokeSession(hashed);
  }

  await clearAuthCookies();

  return {
    success: true,
    message: "Logged out successfully",
  };
};
