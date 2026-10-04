import { db as defaultDb } from "@/lib/db";

const SHOP_SETTING_ID = 1;

export async function getProductDiscountRate(db = defaultDb) {
  const setting = await db.shopSetting.findUnique({
    where: { id: SHOP_SETTING_ID },
    select: { productDiscountRate: true },
  });

  return Number(setting?.productDiscountRate ?? 0);
}

export async function setProductDiscountRate(rate: number, db = defaultDb) {
  return db.shopSetting.upsert({
    where: { id: SHOP_SETTING_ID },
    create: { id: SHOP_SETTING_ID, productDiscountRate: rate },
    update: { productDiscountRate: rate },
    select: { productDiscountRate: true },
  });
}
