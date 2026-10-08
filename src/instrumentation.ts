import { resolveAuthSecret } from "./config/secrets";

export function register() {
  if (process.env.NODE_ENV !== "production") return;

  resolveAuthSecret("JWT_SECRET", process.env.JWT_SECRET, "default_dev_jwt_secret_change_me_in_env_local", true);
  resolveAuthSecret("OTP_SECRET", process.env.OTP_SECRET, "default_dev_otp_secret", true);
}
