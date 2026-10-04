import { z } from "zod";

export const productDiscountRateSchema = z.number()
  .finite("Enter a valid percentage")
  .min(0, "Discount cannot be below 0%")
  .max(100, "Discount cannot exceed 100%")
  .refine((rate) => Number.isInteger(Number((rate * 100).toFixed(7))), "Use no more than two decimal places");
