// ============================================
// DATABASE CONNECTION - DAO PATTERN
// EECS 4413 Project - Data Access Layer
// ============================================

import { PrismaClient } from '@prisma/client';

// Global Prisma instance to prevent multiple connections in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the instance globally to prevent hot reload issues
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;

// ============================================
// DATABASE UTILITIES
// ============================================

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

/**
 * Execute raw SQL query (for complex operations)
 */
export async function executeRawQuery(query: string, params?: any[]): Promise<any> {
  try {
    return await prisma.$queryRawUnsafe(query, ...params || []);
  } catch (error) {
    console.error('❌ Raw query execution failed:', error);
    throw error;
  }
}