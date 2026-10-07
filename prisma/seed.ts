import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { UserRole, MotorType } from "@prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Admin & Staff Users
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const seedPassword = "SeedPassword123!";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const staffHash = await bcrypt.hash(seedPassword, 12);

  const existingAdmin = await db.user.findFirst({ where: { role: UserRole.ADMIN } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: adminEmail,
        password: adminHash,
        firstName: "System",
        lastName: "Admin",
        role: UserRole.ADMIN,
        isActive: true,
        emailVerifiedAt: new Date(),
        userInfo: { create: {} },
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  const existingStaff = await db.user.findUnique({ where: { email: "staff@example.com" } });
  if (!existingStaff) {
    await db.user.create({
      data: {
        email: "staff@example.com",
        password: staffHash,
        firstName: "Shop",
        lastName: "Technician",
        phone: "0800001001",
        role: UserRole.STAFF,
        isActive: true,
        emailVerifiedAt: new Date(),
        userInfo: { create: {} },
      },
    });
    console.log("✅ Staff user created: staff@example.com");
  }

  // 2. Motor Brands & Models
  const brands = [
    { name: "Honda", models: [{ model: "Click 160", type: MotorType.AUTOMATIC }, { model: "PCX 160", type: MotorType.AUTOMATIC }, { model: "Wave 125i", type: MotorType.MANUAL }] },
    { name: "Yamaha", models: [{ model: "NMAX 155", type: MotorType.AUTOMATIC }, { model: "Aerox 155", type: MotorType.AUTOMATIC }, { model: "Finn 115", type: MotorType.MANUAL }] },
    { name: "Suzuki", models: [{ model: "Burgman Street 125EX", type: MotorType.AUTOMATIC }, { model: "Raider R150", type: MotorType.MANUAL }] },
    { name: "Kawasaki", models: [{ model: "Ninja 400", type: MotorType.MANUAL }, { model: "Z400", type: MotorType.MANUAL }] },
    { name: "Vespa", models: [{ model: "Sprint 150", type: MotorType.AUTOMATIC }, { model: "Primavera 150", type: MotorType.AUTOMATIC }] },
  ];

  for (const b of brands) {
    let brand = await db.motorBrand.findUnique({ where: { name: b.name } });
    if (!brand) {
      brand = await db.motorBrand.create({ data: { name: b.name } });
    }

    for (const m of b.models) {
      const existingModel = await db.motor.findFirst({
        where: { motorBrandId: brand.id, model: m.model },
      });
      if (!existingModel) {
        await db.motor.create({
          data: {
            motorBrandId: brand.id,
            model: m.model,
            type: m.type,
          },
        });
      }
    }
  }
  console.log("✅ Motor brands and models seeded");

  // 3. Product Categories
  const categoryNames = ["Tires", "Engine Oil & Fluids", "Brake Parts", "Drive & Chain", "Electrical", "Accessories"];
  const categoryMap = new Map<string, number>();

  for (const name of categoryNames) {
    let cat = await db.productCategory.findUnique({ where: { name } });
    if (!cat) {
      cat = await db.productCategory.create({ data: { name } });
    }
    categoryMap.set(name, cat.id);
  }
  console.log("✅ Categories seeded");

  // 4. Products
  const products = [
    { cat: "Tires", sku: "TIR-001", name: "IRC NR77 70/90-17", cost: 650, sell: 820, stock: 18, unit: "piece" },
    { cat: "Tires", sku: "TIR-002", name: "Michelin City Extra 80/90-17", cost: 1100, sell: 1350, stock: 10, unit: "piece" },
    { cat: "Engine Oil & Fluids", sku: "OIL-001", name: "Motul 5100 10W-40 1L", cost: 390, sell: 480, stock: 20, unit: "bottle" },
    { cat: "Engine Oil & Fluids", sku: "OIL-002", name: "Shell Advance AX7 10W-40 1L", cost: 250, sell: 320, stock: 24, unit: "bottle" },
    { cat: "Brake Parts", sku: "BRK-001", name: "Front Brake Pad - Honda Wave", cost: 120, sell: 180, stock: 15, unit: "set" },
    { cat: "Brake Parts", sku: "BRK-002", name: "Front Brake Pad - Yamaha NMAX", cost: 240, sell: 330, stock: 8, unit: "set" },
    { cat: "Drive & Chain", sku: "DRV-001", name: "DID O-Ring Chain 428-120L", cost: 850, sell: 1150, stock: 12, unit: "box" },
    { cat: "Electrical", sku: "ELC-001", name: "NGK Iridium Spark Plug CR8EIX", cost: 320, sell: 450, stock: 25, unit: "piece" },
  ];

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { sku: p.sku } });
    if (!existing) {
      const catId = categoryMap.get(p.cat);
      if (catId) {
        await db.product.create({
          data: {
            productCategoryId: catId,
            sku: p.sku,
            name: p.name,
            costPrice: p.cost,
            sellingPrice: p.sell,
            stockQuantity: p.stock,
            unit: p.unit,
            isActive: true,
          },
        });
      }
    }
  }
  console.log("✅ Products seeded");

  // 5. Services
  const services = [
    { name: "Engine Oil Change Service", price: 50, description: "Drain old oil, replace with new, check level" },
    { name: "Tire Replacement & Balancing", price: 150, description: "Mount tire, balance, inspect valve stem" },
    { name: "Brake Pad Inspection & Replacement", price: 100, description: "Check calipers, clean rotors, install pads" },
    { name: "Chain Cleaning & Lubrication", price: 80, description: "Deep degrease, high-speed chain lube, adjust tension" },
    { name: "Full System Diagnostic & Maintenance", price: 350, description: "ECU scan, battery check, spark plug test, 20-point safety check" },
  ];

  for (const s of services) {
    const existing = await db.service.findUnique({ where: { name: s.name } });
    if (!existing) {
      await db.service.create({
        data: {
          name: s.name,
          price: s.price,
          description: s.description,
          isActive: true,
        },
      });
    }
  }
  console.log("✅ Services seeded");
  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
