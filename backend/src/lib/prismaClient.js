require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

/**
 * Serverless-safe global-reuse pattern.
 * In development, the Prisma client is cached on `globalThis` to survive
 * hot-reloads without exhausting database connections. In production, a
 * fresh client is created per cold-start (single instance on Render).
 */

const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

/** @type {PrismaClient} */
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  prisma = globalThis.__prisma;
}

module.exports = prisma;
