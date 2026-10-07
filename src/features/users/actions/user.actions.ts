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
import { deleteAdminProfilePhoto, updateAdminProfile } from "../services/user.service";

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
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, error: "Invalid member" };
  }

  try {
    const member = await findMemberById(id);
    if (!member) return { success: false, error: "Member not found" };
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

export const updateAdminProfileAction = async (input: {
  firstName: string;
  lastName: string;
  phone: string;
  photoKey?: string | null;
}) => {
  const user = await getCurrentUser();
  if (!user || user.role !== ROLES.ADMIN) {
    return { success: false, error: "Only administrators can update this profile." };
  }
  if (
    !input ||
    typeof input.firstName !== "string" ||
    typeof input.lastName !== "string" ||
    typeof input.phone !== "string" ||
    (input.photoKey !== undefined && input.photoKey !== null && typeof input.photoKey !== "string")
  ) {
    return { success: false, error: "Invalid profile details." };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone.trim();
  if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80) {
    return { success: false, error: "Enter a first and last name (up to 80 characters each)." };
  }
  if (phone.length > 30) {
    return { success: false, error: "Phone number must be 30 characters or fewer." };
  }
  if (input.photoKey !== undefined && input.photoKey !== null && !/^profiles\/[\w-]+\.(?:jpe?g|png|webp)$/i.test(input.photoKey)) {
    return { success: false, error: "Invalid profile photo." };
  }

  try {
    await updateAdminProfile({
      userId: user.id,
      firstName,
      lastName,
      phone: phone || null,
      photoKey: input.photoKey,
    });
    revalidatePath("/admin/profile");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = (err as Error).message || "Unable to update profile.";
    return {
      success: false,
      error: message.includes("Unique constraint")
        ? "That phone number is already used by another account."
        : "Unable to update profile. Please try again.",
    };
  }
};

export const deleteAdminProfilePhotoAction = async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== ROLES.ADMIN) {
    return { success: false, error: "Only administrators can update this profile." };
  }
  try {
    await deleteAdminProfilePhoto(user.id);
    revalidatePath("/admin/profile");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete profile photo." };
  }
};
