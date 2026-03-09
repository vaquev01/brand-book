import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function cleanUrl(url: string): string {
  // PrismaPg uses raw pg driver — strip Prisma-specific ?schema= param
  return url.replace(/([?&])schema=[^&]*(&|$)/, (_, pre, post) => post === "&" ? pre : "").replace(/[?&]$/, "")
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/brandbook_app"
  const connectionString = cleanUrl(raw)
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
