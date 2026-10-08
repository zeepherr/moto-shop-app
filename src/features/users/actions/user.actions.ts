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

const updateOwnProfileAction = async (input: unknown, requiredRole: UserRole, allowPartial = false) => {
  const user = await getCurrentUser();
  if (!user || user.role !== requiredRole) {
    return {
      success: false,
      error: requiredRole === UserRole.ADMIN
        ? "Only administrators can update this profile."
        : requiredRole === UserRole.STAFF
          ? "Only staff can update this profile."
          : "Only members can update this profile.",
    };
  }
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid profile details." };
  }

  const values = input as Record<string, unknown>;
  if (
    (!allowPartial && (typeof values.firstName !== "string" || typeof values.lastName !== "string" || typeof values.phone !== "string")) ||
    (values.firstName !== undefined && values.firstName !== null && typeof values.firstName !== "string") ||
    (values.lastName !== undefined && values.lastName !== null && typeof values.lastName !== "string") ||
    (values.phone !== undefined && values.phone !== null && typeof values.phone !== "string") ||
    (values.photoKey !== undefined && values.photoKey !== null && typeof values.photoKey !== "string")
  ) {
    return { success: false, error: "Invalid profile details." };
  }

  const firstName = typeof values.firstName === "string" ? values.firstName.trim() : undefined;
  const lastName = typeof values.lastName === "string" ? values.lastName.trim() : undefined;
  const phone = typeof values.phone === "string" ? values.phone.trim() || null : values.phone === null ? null : undefined;
  if ((firstName !== undefined && (!firstName || firstName.length > 80)) || (lastName !== undefined && (!lastName || lastName.length > 80))) {
    return { success: false, error: "Enter a first and last name (up to 80 characters each)." };
  }
  if (phone && phone.length > 30) {
    return { success: false, error: "Phone number must be 30 characters or fewer." };
  }
  const photoKey = values.photoKey as string | null | undefined;
  if (firstName === undefined && lastName === undefined && phone === undefined && photoKey === undefined) {
    return { success: false, error: "Choose a profile detail to update." };
  }
  if (photoKey !== undefined && photoKey !== null && !/^profiles\/[\w-]+\.(?:jpe?g|png|webp)$/i.test(photoKey)) {
    return { success: false, error: "Invalid profile photo." };
  }

  try {
    await updateAdminProfile({
      userId: user.id,
      firstName,
      lastName,
      phone,
      photoKey,
    });
    const profilePath = requiredRole === UserRole.ADMIN ? "/admin/profile" : requiredRole === UserRole.STAFF ? "/staff/profile" : "/member/profile";
    revalidatePath(profilePath);
    if (requiredRole === UserRole.ADMIN) revalidatePath("/admin");
    if (requiredRole === UserRole.STAFF) revalidatePath("/staff");
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

export const updateAdminProfileAction = async (input: unknown) =>
  updateOwnProfileAction(input, UserRole.ADMIN);

export const updateStaffProfileAction = async (input: unknown) =>
  updateOwnProfileAction(input, UserRole.STAFF, true);

export const updateMemberProfileAction = async (input: unknown) =>
  updateOwnProfileAction(input, UserRole.MEMBER);

export const updateStaffProfilePhotoAction = async (input: unknown) => {
  if (typeof input !== "object" || input === null || typeof (input as Record<string, unknown>).photoKey !== "string") {
    return { success: false, error: "Invalid profile photo." };
  }
  return updateOwnProfileAction(input, UserRole.STAFF, true);
};

const deleteOwnProfilePhotoAction = async (requiredRole: UserRole) => {
  const user = await getCurrentUser();
  if (!user || user.role !== requiredRole) {
    return {
      success: false,
      error: requiredRole === UserRole.ADMIN
        ? "Only administrators can update this profile."
        : "Only staff can update this profile.",
    };
  }
  try {
    await deleteAdminProfilePhoto(user.id);
    revalidatePath(requiredRole === UserRole.ADMIN ? "/admin/profile" : "/staff/profile");
    revalidatePath(requiredRole === UserRole.ADMIN ? "/admin" : "/staff");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete profile photo." };
  }
};

export const deleteAdminProfilePhotoAction = async () => deleteOwnProfilePhotoAction(UserRole.ADMIN);
export const deleteStaffProfilePhotoAction = async () => deleteOwnProfilePhotoAction(UserRole.STAFF);
