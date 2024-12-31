import { PrismaClient } from "@prisma/client";

declare global {
  var db: PrismaClient | undefined;
}

const prisma = global.db ?? new PrismaClient();

global.db = prisma;

export { prisma };
