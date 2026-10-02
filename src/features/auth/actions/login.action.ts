"use server";

import bcrypt from "bcryptjs";
import { loginSchema, type LoginInput } from "../schemas";
import type { ActionResult } from "../types";
import { findUserByEmail, createAuthSession } from "../services/auth.service";
import { createAccessToken, createRefreshToken, hashRefreshToken } from "../services/token.service";
import { setAuthCookies } from "../services/cookie.service";

export const loginAction = async (input: LoginInput): Promise<ActionResult> => {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  if (!user.isActive) {
    return { success: false, error: "Your account has been deactivated" };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { success: false, error: "Invalid email or password" };
  }

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email ?? "",
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const rawRefreshToken = createRefreshToken();
  const hashedRefreshToken = hashRefreshToken(rawRefreshToken);
  await createAuthSession(user.id, hashedRefreshToken);

  await setAuthCookies(accessToken, rawRefreshToken);

  return {
    success: true,
    message: "Login successful",
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};
