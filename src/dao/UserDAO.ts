// ============================================
// USER DAO - Data Access Object Pattern
// EECS 4413 Project - Database Operations
// ============================================

import prisma from '../utils/database';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  program?: string;
  year?: number;
  phoneNumber?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  program?: string;
  year?: number;
  phoneNumber?: string;
  profileImage?: string;
}

/**
 * User Data Access Object
 * Implements DAO pattern for user-related database operations
 */
export class UserDAO {
  
  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<any> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });
      
      console.log(`✅ User created: ${user.email}`);
      return user;
    } catch (error) {
      const anyError: any = error;
      if (anyError && anyError.code === 'P2002') {
        throw new Error('Email or Student ID already exists');
      }
      console.error('❌ User creation failed:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          products: true,
          _count: {
            select: {
              products: true,
              purchases: true,
              sales: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('❌ User findById failed:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      console.error('❌ User findByEmail failed:', error);
      throw error;
    }
  }

  /**
   * Find user by student ID
   */
  static async findByStudentId(studentId: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { studentId },
      });
    } catch (error) {
      console.error('❌ User findByStudentId failed:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  static async update(id: string, userData: UpdateUserData): Promise<any> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...userData,
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ User updated: ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ User update failed:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, newPassword: string): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const user = await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ Password updated for user: ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ Password update failed:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Last login update failed:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(email: string, password: string): Promise<any | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      console.error('❌ Password verification failed:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin function)
   */
  static async findAll(page: number = 1, limit: number = 10): Promise<{
    users: any[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            program: true,
            year: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                products: true,
                purchases: true,
                sales: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      return {
        users: users,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ User findAll failed:', error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  static async deactivate(id: string): Promise<any> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ User deactivated: ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ User deactivation failed:', error);
      throw error;
    }
  }

  /**
   * Reactivate user
   */
  static async reactivate(id: string): Promise<any> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ User reactivated: ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ User reactivation failed:', error);
      throw error;
    }
  }
}
