export const resolveAuthSecret = (
  name: "JWT_SECRET" | "OTP_SECRET",
  value: string | undefined,
  developmentFallback: string,
  isProduction: boolean,
) => {
  if (!isProduction) return value || developmentFallback;
  const looksLikePlaceholder = value?.toLowerCase().includes("replace-with")
    || value?.toLowerCase().includes("change-me")
    || value === developmentFallback;
  if (!value || looksLikePlaceholder || Buffer.byteLength(value, "utf8") < 32) {
    throw new Error(`${name} must be configured with an adequate random secret of at least 32 bytes in production`);
  }
  return value;
};
