"use server";

import { getCurrentUser } from "@/features/auth/actions/session.action";
import { searchMembers, findMemberById } from "../services/user.service";

export const searchMembersAction = async (query: string) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const members = await searchMembers(query);
    return { success: true, data: members };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to search members" };
  }
};

export const getMemberByIdAction = async (id: number) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const member = await findMemberById(id);
    return { success: true, data: member };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to get member" };
  }
};
