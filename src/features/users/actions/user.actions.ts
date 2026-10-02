"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { searchMembers, findMemberById, updateUserRole } from "../services/user.service";

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

export const updateUserRoleAction = async (userId: number, role: "STAFF" | "MEMBER") => {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Only admins can change user roles" };
  }

  try {
    const updated = await updateUserRole(userId, role as any);
    revalidatePath("/admin/users");
    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to update user role" };
  }
};
