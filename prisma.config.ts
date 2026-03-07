import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "Database/schema.prisma",
  migrations: {
    path: "Database/migrations",
    seed: "tsx Database/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/brandbook_app?schema=public",
  },
});
