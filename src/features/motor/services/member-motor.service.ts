import { MotorSuggestionStatus, UserRole, type MotorType } from "@prisma/client";
import { db as defaultDb } from "@/lib/db";

export async function searchMemberMotorCatalog(term: string, db = defaultDb) {
  const query = term.trim();
  if (!query) return [];
  return db.motor.findMany({
    where: {
      isActive: true,
      motorBrand: { isActive: true },
      OR: [
        { model: { contains: query, mode: "insensitive" } },
        { motorBrand: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    take: 20,
    orderBy: [{ motorBrand: { name: "asc" } }, { model: "asc" }],
    select: { id: true, model: true, type: true, motorBrand: { select: { name: true } } },
  });
}

export async function registerMemberMotor(data: { userId: number; motorId: number; licensePlate: string | null }, db = defaultDb) {
  return db.$transaction(async (tx) => {
    const member = await tx.user.findFirst({ where: { id: data.userId, role: UserRole.MEMBER, isActive: true }, select: { id: true } });
    const motor = await tx.motor.findFirst({ where: { id: data.motorId, isActive: true, motorBrand: { isActive: true } }, select: { id: true } });
    if (!member || !motor) throw new Error("Member or motorcycle is unavailable.");
    const existingGarage = await tx.userMotor.findFirst({ where: { userId: data.userId }, select: { id: true, motorId: true } });
    if (existingGarage && existingGarage.motorId !== data.motorId) {
      await tx.userMotor.delete({ where: { id: existingGarage.id } });
    }
    await tx.motorSuggestion.updateMany({
      where: { userId: data.userId, status: MotorSuggestionStatus.PENDING },
      data: { status: MotorSuggestionStatus.REJECTED, reviewNote: "Replaced by a motorcycle selected from the catalog." },
    });
    return tx.userMotor.upsert({
      where: { userId_motorId: { userId: data.userId, motorId: data.motorId } },
      create: { userId: data.userId, motorId: data.motorId, licensePlate: data.licensePlate },
      update: { licensePlate: data.licensePlate },
    });
  });
}

export async function submitMemberMotorSuggestion(data: {
  userId: number; brandName: string; model: string; type: MotorType; licensePlate: string | null;
}, db = defaultDb) {
  return db.$transaction(async (tx) => {
    const member = await tx.user.findFirst({ where: { id: data.userId, role: UserRole.MEMBER, isActive: true }, select: { id: true } });
    if (!member) throw new Error("Member account is unavailable.");
    const normalizedBrand = normalizeMotorName(data.brandName);
    const normalizedModel = normalizeMotorName(data.model);
    const brands = await tx.motorBrand.findMany({ select: { id: true, name: true } });
    const matchingBrand = brands.find((entry) => normalizeMotorName(entry.name) === normalizedBrand);
    const motors = matchingBrand
      ? await tx.motor.findMany({ where: { motorBrandId: matchingBrand.id }, select: { id: true, model: true, isActive: true } })
      : [];
    const matchingMotor = motors.find((entry) => normalizeMotorName(entry.model) === normalizedModel);
    if (matchingMotor?.isActive) throw new Error("This motorcycle is already in the catalog. Select it from the search results instead.");
    const existing = await tx.motorSuggestion.findMany({
      where: { status: MotorSuggestionStatus.PENDING },
      select: { id: true, brandName: true, model: true, userId: true },
    });
    const matchingSuggestion = existing.find((entry) =>
      normalizeMotorName(entry.brandName) === normalizedBrand && normalizeMotorName(entry.model) === normalizedModel,
    );
    const existingGarage = await tx.userMotor.findFirst({ where: { userId: data.userId }, select: { id: true } });
    if (matchingSuggestion) {
      if (matchingSuggestion.userId === data.userId) throw new Error("You already submitted this motorcycle. Its review status is shown in your profile.");
      throw new Error("A matching motorcycle is already waiting for review. Please wait for the workshop to review it.");
    }
    if (existingGarage) {
      await tx.motorSuggestion.updateMany({
        where: { userId: data.userId, status: MotorSuggestionStatus.PENDING },
        data: { status: MotorSuggestionStatus.REJECTED, reviewNote: "Replaced by a newer motorcycle change request." },
      });
    }
    return tx.motorSuggestion.create({ data });
  });
}

export async function getPendingMotorSuggestions(db = defaultDb) {
  return db.motorSuggestion.findMany({
    where: { status: MotorSuggestionStatus.PENDING },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, brandName: true, model: true, type: true, licensePlate: true, createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
    },
  });
}

export async function reviewMotorSuggestion(data: { id: number; reviewerId: number; approve: boolean }, db = defaultDb) {
  return db.$transaction(async (tx) => {
    const suggestion = await tx.motorSuggestion.findFirst({
      where: { id: data.id, status: MotorSuggestionStatus.PENDING },
    });
    if (!suggestion) throw new Error("This suggestion has already been reviewed.");
    if (data.approve) {
      const existingGarage = await tx.userMotor.findFirst({ where: { userId: suggestion.userId }, select: { id: true, motorId: true } });
      let brand: Awaited<ReturnType<typeof tx.motorBrand.findFirst>> = await tx.motorBrand.findFirst({ where: { name: { equals: suggestion.brandName.trim(), mode: "insensitive" } } });
      if (!brand) {
        const brands = await tx.motorBrand.findMany();
        brand = brands.find((entry) => normalizeMotorName(entry.name) === normalizeMotorName(suggestion.brandName)) ?? null;
      }
      if (!brand) brand = await tx.motorBrand.create({ data: { name: suggestion.brandName } });
      let motor: Awaited<ReturnType<typeof tx.motor.findFirst>> = await tx.motor.findFirst({ where: { motorBrandId: brand.id, model: { equals: suggestion.model.trim(), mode: "insensitive" } } });
      if (!motor) {
        const catalogMotors = await tx.motor.findMany({ where: { motorBrandId: brand.id } });
        motor = catalogMotors.find((entry) => normalizeMotorName(entry.model) === normalizeMotorName(suggestion.model)) ?? null;
      }
      if (!motor) motor = await tx.motor.create({ data: { motorBrandId: brand.id, model: suggestion.model, type: suggestion.type } });
      if (!motor.isActive || !brand.isActive) throw new Error("The matching catalog entry is inactive. Reactivate it before approving.");
      if (existingGarage && existingGarage.motorId !== motor.id) await tx.userMotor.delete({ where: { id: existingGarage.id } });
      await tx.userMotor.upsert({
        where: { userId_motorId: { userId: suggestion.userId, motorId: motor.id } },
        create: { userId: suggestion.userId, motorId: motor.id, licensePlate: suggestion.licensePlate },
        update: { licensePlate: suggestion.licensePlate },
      });
      await tx.motorSuggestion.updateMany({
        where: { userId: suggestion.userId, status: MotorSuggestionStatus.PENDING, id: { not: suggestion.id } },
        data: { status: MotorSuggestionStatus.REJECTED, reviewNote: "Replaced by an approved motorcycle change." },
      });
    }
    await tx.motorSuggestion.update({
      where: { id: suggestion.id },
      data: { status: data.approve ? MotorSuggestionStatus.APPROVED : MotorSuggestionStatus.REJECTED, reviewedById: data.reviewerId, reviewedAt: new Date() },
    });
  });
}

export async function cancelMemberMotorSuggestion(data: { userId: number; suggestionId: number }, db = defaultDb) {
  return db.$transaction(async (tx) => {
    const result = await tx.motorSuggestion.updateMany({
      where: { id: data.suggestionId, userId: data.userId, status: MotorSuggestionStatus.PENDING },
      data: { status: MotorSuggestionStatus.REJECTED, reviewNote: "Cancelled by member." },
    });
    if (!result.count) throw new Error("This suggestion is no longer pending. Refresh the page and check its status.");
  });
}

function normalizeMotorName(value: string) {
  return value.normalize("NFKC").trim().replace(/[\s\p{P}\p{S}]+/gu, "").toLocaleLowerCase();
}
