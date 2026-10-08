export const startAuthTimer = () => performance.now();

export const logAuthPerformance = (stage: string, startedAt: number) => {
  if (process.env.NODE_ENV !== "development" || process.env.AUTH_PERF_DIAGNOSTICS !== "1") return;
  console.info(`[auth-perf] ${stage}: ${(performance.now() - startedAt).toFixed(1)}ms`);
};
