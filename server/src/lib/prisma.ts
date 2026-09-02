import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}

export default prisma;
