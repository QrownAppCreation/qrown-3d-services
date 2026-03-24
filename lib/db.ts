import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Keep one shared instance on globalThis so Next.js hot-reload never creates
// a second Prisma client (and a second LevelDB write lock) in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma;
