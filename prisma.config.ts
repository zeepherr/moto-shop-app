import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "prisma/config";

// Ensure .env.local is loaded for Prisma CLI migrations
dotenvConfig({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "",
  },
});
