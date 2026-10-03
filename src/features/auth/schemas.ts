import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm password is required"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const adminEnrollmentSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  role: z.enum(["MEMBER", "STAFF"]),
  method: z.enum(["SELF_SERVICE", "ASSISTED"]),
});

export const assistedOtpSchema = z.object({
  enrollmentId: z.number().int().positive(),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const passwordSetupSchema = z
  .object({
    token: z.string().min(32, "Invalid password setup link"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type AdminEnrollmentInput = z.infer<typeof adminEnrollmentSchema>;
export type AssistedOtpInput = z.infer<typeof assistedOtpSchema>;
export type PasswordSetupInput = z.infer<typeof passwordSetupSchema>;
