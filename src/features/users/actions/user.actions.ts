"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";
import {
  findMemberById,
  searchMembers,
} from "../services/user.service";
import { getUserManagementDetail, updateUserAccess, updateUserRole } from "../services/user-management.service";

export const searchMembersAction = async (query: string) => {
  const user = await getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const members = await searchMembers(query);
    return { success: true, data: members };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to search members" };
  }
};

export const getMemberByIdAction = async (id: number) => {
  const user = await getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    return { success: false, error: "Unauthorized" };
  }

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
  if (user.id === userId) {
    return { success: false, error: "You cannot change your own role." };
  }

  try {
    await updateUserRole({
      userId,
      role: role === "STAFF" ? UserRole.STAFF : UserRole.MEMBER,
      actorUserId: user.id,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to update user role" };
  }
};

export const updateUserAccessAction = async (userId: number, isActive: boolean) => {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Only admins can change account access" };
  }
  if (user.id === userId) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  try {
    await updateUserAccess({ userId, isActive, actorUserId: user.id });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to update account access" };
  }
};

export const getUserManagementDetailAction = async (userId: number) => {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Only admins can view account details." };
  }

  try {
    const detail = await getUserManagementDetail(userId);
    if (!detail) return { success: false, error: "User not found." };
    return {
      success: true,
      data: {
        ...detail,
        createdAt: detail.createdAt.toISOString(),
        emailVerifiedAt: detail.emailVerifiedAt?.toISOString() ?? null,
        events: detail.events.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
      },
    };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Unable to load account details." };
  }
};
