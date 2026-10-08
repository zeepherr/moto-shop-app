"use server";

import { MotorType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { searchMemberMotorCatalog, registerMemberMotor, submitMemberMotorSuggestion, getPendingMotorSuggestions, reviewMotorSuggestion, cancelMemberMotorSuggestion } from "../services/member-motor.service";

const plateSchema = z.string().trim().max(20, "Plate number must be 20 characters or fewer").transform((value) => value || null);
const suggestionSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(80),
  type: z.nativeEnum(MotorType),
  licensePlate: plateSchema,
});

export async function searchMemberMotorCatalogAction(term: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.MEMBER) return { success: false, error: "Only members can search the motorcycle catalog." };
  if (typeof term !== "string" || term.trim().length < 2 || term.length > 80) return { success: true, data: [] };
  try { return { success: true, data: await searchMemberMotorCatalog(term) }; }
  catch { return { success: false, error: "Could not search motorcycles. Please try again." }; }
}

export async function registerMemberMotorAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.MEMBER) return { success: false, error: "Only members can register a motorcycle." };
  const parsed = z.object({ motorId: z.number().int().positive(), licensePlate: plateSchema }).safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the motorcycle details." };
  try {
    await registerMemberMotor({ userId: user.id, ...parsed.data });
    revalidatePath("/member/profile");
    revalidatePath("/admin/users");
    revalidatePath("/staff/pos");
    revalidatePath("/admin/pos");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not register this motorcycle." };
  }
}

export async function submitMemberMotorSuggestionAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.MEMBER) return { success: false, error: "Only members can suggest a motorcycle." };
  const parsed = suggestionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the motorcycle details." };
  try {
    const suggestion = await submitMemberMotorSuggestion({ userId: user.id, ...parsed.data });
    revalidatePath("/member/profile");
    revalidatePath("/admin/motors");
    return { success: true, data: { id: suggestion.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not submit this motorcycle for review." };
  }
}

export async function cancelMemberMotorSuggestionAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.MEMBER) return { success: false, error: "Only members can cancel their own motorcycle suggestion." };
  const parsed = z.object({ suggestionId: z.number().int().positive() }).safeParse(input);
  if (!parsed.success) return { success: false, error: "Choose a valid pending motorcycle suggestion." };
  try {
    await cancelMemberMotorSuggestion({ userId: user.id, suggestionId: parsed.data.suggestionId });
    revalidatePath("/member/profile");
    revalidatePath("/admin/motors");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not cancel this motorcycle suggestion." };
  }
}

export async function getPendingMotorSuggestionsAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) return { success: false, error: "Only administrators can review motorcycle suggestions." };
  try {
    const data = await getPendingMotorSuggestions();
    return { success: true, data: data.map((suggestion) => ({ ...suggestion, createdAt: suggestion.createdAt.toISOString() })) };
  } catch { return { success: false, error: "Could not load motorcycle suggestions." }; }
}

export async function reviewMotorSuggestionAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) return { success: false, error: "Only administrators can review motorcycle suggestions." };
  const parsed = z.object({ id: z.number().int().positive(), approve: z.boolean() }).safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid motorcycle suggestion." };
  try {
    await reviewMotorSuggestion({ ...parsed.data, reviewerId: user.id });
    revalidatePath("/admin/motors");
    revalidatePath("/member/profile");
    revalidatePath("/admin/users");
    revalidatePath("/admin/pos");
    revalidatePath("/staff/pos");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not review this suggestion." };
  }
}
