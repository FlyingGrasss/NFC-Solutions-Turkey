import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  pool?: Pool;
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

const prismaSchemaVersion = "profiles-and-leads-v2-iban-stock-and-reviews-v1";

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForDb.prismaSchemaVersion === prismaSchemaVersion && globalForDb.prisma
    ? globalForDb.prisma
    : new PrismaClient({
        adapter,
      });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.prisma = prisma;
  globalForDb.prismaSchemaVersion = prismaSchemaVersion;
}
