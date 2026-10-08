"use server";

import { cache } from "react";
import { getSessionTokenFromCookies } from "../services/cookie.service";
import { verifyAccessToken } from "../services/token.service";
import { findActiveAuthSession } from "../services/auth.service";
import type { AuthUserDTO } from "../types";
import { isAccessSessionValid } from "../session-validation";
import { logAuthPerformance, startAuthTimer } from "@/lib/auth-performance";

const readCurrentUser = cache(async (): Promise<AuthUserDTO | null> => {
  const lookupStartedAt = startAuthTimer();
  const finish = (user: AuthUserDTO | null) => {
    logAuthPerformance("session_lookup_ms", lookupStartedAt);
    return user;
  };
  const token = await getSessionTokenFromCookies();
  if (!token) return finish(null);

  const payload = await verifyAccessToken(token);
  if (!payload?.sessionId || !payload.userId) return finish(null);
  const session = await findActiveAuthSession(payload.sessionId);
  const user = session?.user;
  if (!session || !user || !isAccessSessionValid(payload, { ...session, user }, new Date())) return finish(null);

  const result = {
    id: user.id,
    email: user.email ?? "",
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    emailVerifiedAt: user.emailVerifiedAt,
  };
  return finish(result);
});

export const getCurrentUser = async (): Promise<AuthUserDTO | null> => readCurrentUser();
