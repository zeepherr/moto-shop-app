"use server";

import { ROLES } from "@/features/auth/constants";
import { getCurrentUser } from "@/features/auth/actions/session.action";

export async function getPosOperator() {
  const user = await getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    return null;
  }
  return user;
}
