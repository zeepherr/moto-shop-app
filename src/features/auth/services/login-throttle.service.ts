import { db as defaultDb } from "@/lib/db";
import { clearDevelopmentLoginFailures, isDevelopmentLoginBlocked, recordDevelopmentLoginFailures } from "./login-throttle-memory";
export { getLoginThrottleKeys } from "../login-throttle-policy";

export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_IP_ATTEMPT_LIMIT = 50;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_RETENTION_MS = 48 * 60 * 60 * 1000;
const LOGIN_ATTEMPT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let lastCleanupAt = 0;

const isDevelopment = () => process.env.NODE_ENV === "development";

export const isLoginBlocked = async (keys: string[], db = defaultDb, now = new Date()) => {
  try {
    const count = await db.loginAttempt.count({ where: { key: { in: keys }, blockedUntil: { gt: now } } });
    return count > 0;
  } catch (error) {
    if (!isDevelopment()) throw error;
    return isDevelopmentLoginBlocked(keys, now, LOGIN_WINDOW_MS);
  }
};

export const recordFailedLogin = async (keys: string[], db = defaultDb) => {
  const now = new Date();
  try {
    await db.$transaction(keys.map((key, index) => {
      const limit = index === 0 ? LOGIN_ATTEMPT_LIMIT : LOGIN_IP_ATTEMPT_LIMIT;
      return db.$executeRaw`
    INSERT INTO "LoginAttempt" ("key", "attemptCount", "windowStartedAt", "updatedAt")
    VALUES (${key}, 1, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "attemptCount" = CASE
        WHEN "LoginAttempt"."windowStartedAt" <= ${new Date(now.getTime() - LOGIN_WINDOW_MS)} THEN 1
        ELSE "LoginAttempt"."attemptCount" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "LoginAttempt"."windowStartedAt" <= ${new Date(now.getTime() - LOGIN_WINDOW_MS)} THEN ${now}
        ELSE "LoginAttempt"."windowStartedAt"
      END,
      "blockedUntil" = CASE
        WHEN "LoginAttempt"."windowStartedAt" <= ${new Date(now.getTime() - LOGIN_WINDOW_MS)} THEN NULL
        WHEN "LoginAttempt"."attemptCount" + 1 >= ${limit} THEN ${new Date(now.getTime() + LOGIN_BLOCK_MS)}
        ELSE "LoginAttempt"."blockedUntil"
      END,
      "updatedAt" = ${now}
  `;
    }));

    if (now.getTime() - lastCleanupAt >= LOGIN_ATTEMPT_CLEANUP_INTERVAL_MS) {
      lastCleanupAt = now.getTime();
      await db.loginAttempt.deleteMany({ where: { updatedAt: { lt: new Date(now.getTime() - LOGIN_ATTEMPT_RETENTION_MS) } } });
    }
  } catch (error) {
    if (!isDevelopment()) throw error;
    recordDevelopmentLoginFailures(keys, now, LOGIN_WINDOW_MS, LOGIN_BLOCK_MS, LOGIN_ATTEMPT_LIMIT, LOGIN_IP_ATTEMPT_LIMIT);
  }
};

export const clearLoginFailures = async (keys: string[], db = defaultDb) => {
  try {
    await db.loginAttempt.deleteMany({ where: { key: { in: keys } } });
  } catch (error) {
    if (!isDevelopment()) throw error;
  }
  clearDevelopmentLoginFailures(keys);
};
