import type { AuthSessionPayload } from "./types";

export const isAccessSessionValid = (
  payload: Pick<AuthSessionPayload, "sessionId" | "userId"> | null | undefined,
  session: { userId: number; revokedAt: Date | null; expiresAt: Date; user: { id: number; isActive: boolean } } | null | undefined,
  now = new Date(),
) => Boolean(
  payload?.sessionId
  && payload.userId
  && session
  && session.userId === payload.userId
  && session.user.id === payload.userId
  && session.user.isActive
  && session.revokedAt === null
  && session.expiresAt > now,
);
