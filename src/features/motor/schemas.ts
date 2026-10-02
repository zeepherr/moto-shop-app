import { z } from "zod";

export const motorBrandNameSchema = z
  .string()
  .trim()
  .min(2, "Brand name must be at least 2 characters")
  .max(50, "Brand name must not exceed 50 characters");

export const createMotorBrandSchema = z.object({
  name: motorBrandNameSchema,
});

export const updateMotorBrandSchema = z.object({
  name: motorBrandNameSchema.optional(),
  isActive: z.boolean().optional(),
});

export const createMotorSchema = z.object({
  model: z.string().trim().min(1, "Model name is required"),
  motorBrandId: z.coerce.number().int().positive("Valid brand is required"),
  type: z.enum(["AUTOMATIC", "MANUAL"], {
    error: "Motor type must be either Automatic or Manual",
  }),
});

export const updateMotorSchema = z.object({
  model: z.string().trim().min(1, "Model name is required").optional(),
  motorBrandId: z.coerce.number().int().positive().optional(),
  type: z.enum(["AUTOMATIC", "MANUAL"]).optional(),
  isActive: z.boolean().optional(),
});

export type CreateMotorBrandInput = z.infer<typeof createMotorBrandSchema>;
export type UpdateMotorBrandInput = z.infer<typeof updateMotorBrandSchema>;
export type CreateMotorInput = z.infer<typeof createMotorSchema>;
export type UpdateMotorInput = z.infer<typeof updateMotorSchema>;
