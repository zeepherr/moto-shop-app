"use server";

import bcrypt from "bcryptjs";
import { passwordSetupSchema, type PasswordSetupInput } from "../schemas";
import { createUserFromPasswordSetup, hashPasswordSetupToken } from "../services/enrollment-assisted.service";
import type { ActionResult } from "../types";

export const setPasswordAction = async (input: PasswordSetupInput): Promise<ActionResult> => {
  const parsed = passwordSetupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const user = await createUserFromPasswordSetup({
      tokenHash: hashPasswordSetupToken(parsed.data.token),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    });
    if (!user) {
      return { success: false, error: "This password setup link is invalid or has expired." };
    }
    return { success: true, message: "Password created. You can now sign in.", data: user };
  } catch {
    return { success: false, error: "Unable to set the password. Please ask the shop team for help." };
  }
};
