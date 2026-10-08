type DevelopmentAttempt = { count: number; windowStartedAt: number; blockedUntil: number | null };

const developmentAttempts = new Map<string, DevelopmentAttempt>();

export const isDevelopmentLoginBlocked = (keys: string[], now: Date, windowMs: number) => keys.some((key) => {
  const attempt = developmentAttempts.get(key);
  if (!attempt) return false;
  if (now.getTime() - attempt.windowStartedAt >= windowMs) {
    developmentAttempts.delete(key);
    return false;
  }
  return attempt.blockedUntil !== null && attempt.blockedUntil > now.getTime();
});

export const recordDevelopmentLoginFailures = (
  keys: string[],
  now: Date,
  windowMs: number,
  blockMs: number,
  emailLimit: number,
  ipLimit: number,
) => {
  for (const [index, key] of keys.entries()) {
    const limit = index === 0 ? emailLimit : ipLimit;
    const existing = developmentAttempts.get(key);
    const inWindow = existing && now.getTime() - existing.windowStartedAt < windowMs;
    const count = inWindow ? existing.count + 1 : 1;
    developmentAttempts.set(key, {
      count,
      windowStartedAt: inWindow ? existing.windowStartedAt : now.getTime(),
      blockedUntil: count >= limit ? now.getTime() + blockMs : null,
    });
  }
};

export const clearDevelopmentLoginFailures = (keys: string[]) => {
  for (const key of keys) developmentAttempts.delete(key);
};
