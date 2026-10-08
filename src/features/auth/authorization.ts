export type AppRole = "ADMIN" | "STAFF" | "MEMBER";

export const isAdminRole = (role: string | null | undefined): boolean => role === "ADMIN";

export const canUsePosRole = (role: string | null | undefined): boolean => role === "ADMIN" || role === "STAFF";

export const canUploadImageRole = (role: string | null | undefined): boolean => canUsePosRole(role);
