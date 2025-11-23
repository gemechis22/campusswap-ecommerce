// ============================================
// SIMPLE AUTH MIDDLEWARE - Like Session Check in Java
// ============================================

import { NextApiRequest } from 'next';

// Simple user type for now
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Simple Authentication Middleware
 * For now, we'll use a mock user for testing
 * Later we'll implement real JWT authentication
 */
export class AuthMiddleware {
  
  /**
   * Mock authentication for development
   * In real app, this would verify JWT token
   */
  static async verifyToken(req: NextApiRequest): Promise<AuthenticatedUser | null> {
    // For now, return a mock user
    // In real implementation, we'd verify JWT token from Authorization header
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null; // No auth header = not logged in
    }

    // Mock user for testing
    return {
      id: 'mock-user-123',
      email: 'student@yorku.ca',
      firstName: 'Test',
      lastName: 'Student',
    };
  }

  /**
   * Create mock user for development
   */
  static createMockUser(): AuthenticatedUser {
    return {
      id: 'mock-user-123',
      email: 'student@yorku.ca',
      firstName: 'Test',
      lastName: 'Student',
    };
  }
}