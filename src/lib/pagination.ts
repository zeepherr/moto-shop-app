export const getBoundedPageWindow = (skip = 0, take = 50, maxTake = 100) => ({
  skip: Number.isFinite(skip) ? Math.min(1_000_000, Math.max(0, Math.floor(skip))) : 0,
  take: Number.isFinite(take) ? Math.min(maxTake, Math.max(1, Math.floor(take))) : 50,
});
