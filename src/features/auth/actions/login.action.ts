"use server";

import bcrypt from "bcryptjs";
import { loginSchema, type LoginInput } from "../schemas";
import type { ActionResult } from "../types";
import { findUserByEmail, createAuthSession } from "../services/auth.service";
import { createAccessToken, createRefreshToken, hashRefreshToken } from "../services/token.service";
import { setAuthCookies } from "../services/cookie.service";
import { headers } from "next/headers";
import { clearLoginFailures, getLoginThrottleKeys, isLoginBlocked, recordFailedLogin } from "../services/login-throttle.service";
import { logAuthPerformance, startAuthTimer } from "@/lib/auth-performance";
import { config } from "@/config";

const INVALID_CREDENTIALS = "Invalid email or password. Try again later.";
const DUMMY_PASSWORD_HASH = "$2b$10$TCG64MLQQciQTti7beVTWOIFqCG2purOW48IM8NAlNS2vh31QsX.6";

export const loginAction = async (input: LoginInput): Promise<ActionResult> => {
  const actionStartedAt = startAuthTimer();
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password } = parsed.data;
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipAddress = requestHeaders.get("x-real-ip")?.trim() || forwarded || null;
  const throttleKeys = getLoginThrottleKeys(email, ipAddress, config.auth.otpSecret);

  try {
    if (await isLoginBlocked(throttleKeys)) return { success: false, error: INVALID_CREDENTIALS };

    const userLookupStartedAt = startAuthTimer();
    const user = await findUserByEmail(email);
    logAuthPerformance("user_lookup_ms", userLookupStartedAt);
    const passwordCheckStartedAt = startAuthTimer();
    const match = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);
    logAuthPerformance("password_check_ms", passwordCheckStartedAt);
    if (!user || !user.isActive || !match) {
      await recordFailedLogin(throttleKeys);
      return { success: false, error: INVALID_CREDENTIALS };
    }

    await clearLoginFailures(throttleKeys);

  const sessionStartedAt = startAuthTimer();
  const rawRefreshToken = createRefreshToken();
  const session = await createAuthSession(user.id, hashRefreshToken(rawRefreshToken));
  const accessToken = await createAccessToken({
    sessionId: session.id,
    userId: user.id,
    email: user.email ?? "",
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  await setAuthCookies(accessToken, rawRefreshToken);
  logAuthPerformance("session_issue_ms", sessionStartedAt);
  logAuthPerformance("login_action_ms", actionStartedAt);

  return {
    success: true,
    message: "Login successful",
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
  } catch {
    return { success: false, error: INVALID_CREDENTIALS };
  }
};
