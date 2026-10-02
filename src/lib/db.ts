import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "@/config";

const createPrismaClient = () => {
  const connectionString = config.db.url;

  if (!connectionString) {
    // Return standard client or fallback if DATABASE_URL is not set yet (e.g. during build)
    return new PrismaClient();
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
  });

  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof createPrismaClient>;
}

export const db = globalThis.prismaGlobal ?? createPrismaClient();

if (config.app.env !== "production") {
  globalThis.prismaGlobal = db;
}

export type DbClient = typeof db;
