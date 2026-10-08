// Centralized typed configuration
// Reads process.env once with strict fallbacks so no raw process.env calls are scattered in the codebase

import { resolveAuthSecret } from "./secrets";

const isProduction = process.env.NODE_ENV === "production";
const getSecret = (name: "JWT_SECRET" | "OTP_SECRET", developmentFallback: string) =>
  resolveAuthSecret(name, process.env[name], developmentFallback, isProduction);

export const config = {
  db: {
    url: process.env.DATABASE_URL || "",
    directUrl: process.env.DIRECT_URL || "",
  },
  auth: {
    get jwtSecret() {
      return getSecret("JWT_SECRET", "default_dev_jwt_secret_change_me_in_env_local");
    },
    get otpSecret() {
      return getSecret("OTP_SECRET", "default_dev_otp_secret");
    },
    cookieName: "moto_care_session",
    refreshCookieName: "refreshToken",
    accessTokenExpiresIn: "15m",
    refreshTokenExpiresDays: 7,
  },
  mail: {
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_APP_PASSWORD || "",
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    env: process.env.NODE_ENV || "development",
    isProduction,
  },
} as const;

export type AppConfig = typeof config;
