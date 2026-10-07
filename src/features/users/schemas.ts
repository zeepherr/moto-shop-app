import { z } from "zod";

export const requestAdminEmailChangeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
});

export const verifyAdminEmailChangeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code"),
});
