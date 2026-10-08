import crypto from "node:crypto";

export const getLoginThrottleKeys = (email: string, ipAddress: string | null, secret: string) => {
  const values = [`email:${email.trim().toLowerCase()}`];
  if (ipAddress) values.push(`ip:${ipAddress}`);
  return values.map((value) => crypto.createHmac("sha256", secret).update(value).digest("hex"));
};
