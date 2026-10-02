import { cookies } from "next/headers";
import { config } from "@/config";

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();
  const isProd = config.app.isProduction;

  // Access Token (15 minutes)
  cookieStore.set(config.auth.cookieName, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  // Refresh Token (7 days)
  cookieStore.set(config.auth.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(config.auth.cookieName);
  cookieStore.delete(config.auth.refreshCookieName);
};

export const getSessionTokenFromCookies = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(config.auth.cookieName)?.value;
};

export const getRefreshTokenFromCookies = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(config.auth.refreshCookieName)?.value;
};
