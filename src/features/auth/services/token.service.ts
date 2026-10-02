import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import { config } from "@/config";
import type { AuthSessionPayload } from "../types";

const getSecretKey = () => new TextEncoder().encode(config.auth.jwtSecret);

export const createAccessToken = async (payload: AuthSessionPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.auth.accessTokenExpiresIn)
    .sign(getSecretKey());
};

export const verifyAccessToken = async (token: string): Promise<AuthSessionPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
};

export const createRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
