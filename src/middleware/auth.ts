// ============================================
// AUTHENTICATION MIDDLEWARE - JWT Token Verification
// Think of this as the bouncer at a VIP club
// ============================================

import { Request, Response } from 'express';
import { verifyToken as verifyJWT, JWTPayload } from '../utils/jwt';

/**
 * What is this interface?
 * When a user is authenticated, we attach their info to the request
 * So every protected route knows WHO is making the request
 */
export interface AuthenticatedUser {
  id: string;         // User's database ID
  email: string;      // User's email
  firstName: string;  // First name for personalization
  lastName: string;   // Last name
}

/**
 * AUTH MIDDLEWARE - The Security Guard
 * 
 * This checks if the user has a valid JWT token
 * Like checking if someone has a valid concert ticket before letting them in
 * 
 * How it works:
 * 1. Extract token from "Authorization: Bearer <token>" header
 * 2. Verify token signature and expiration
 * 3. Return user info if valid, null if not
 * 
 * @param req - Incoming HTTP request
 * @returns User info if authenticated, null if not
 */
export class AuthMiddleware {
  
  static async verifyToken(req: Request): Promise<AuthenticatedUser | null> {
    try {
      // Step 1: Get the Authorization header
      // Frontend sends: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        console.log('🚫 No authorization header found');
        return null; // No ticket = no entry
      }
      
      // Step 2: Verify the JWT token
      // This checks signature, expiration, etc.
      const decoded = verifyJWT(authHeader);
      
      if (!decoded) {
        console.log('🚫 Invalid or expired token');
        return null; // Fake or expired ticket = no entry
      }
      
      // Step 3: Return the authenticated user
      // Now we know WHO is making this request
      return {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
      
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return null;
    }
  }
  
  /**
   * REQUIRE AUTH - Force authentication on a route
   * 
   * Use this wrapper on any route that MUST have authentication
   * If not authenticated, automatically returns 401 Unauthorized
   * 
   * Example usage:
   * ```typescript
   * export default async function handler(req, res) {
   *   const user = await AuthMiddleware.requireAuth(req, res);
   *   if (!user) return; // Already sent 401 response
   *   
   *   // User is authenticated, continue...
   * }
   * ```
   * 
   * @param req - HTTP request
   * @param res - HTTP response
   * @returns User if authenticated, null if not (and sends 401)
   */
  static async requireAuth(
    req: Request, 
    res: Response
  ): Promise<AuthenticatedUser | null> {
    const user = await this.verifyToken(req);
    
    if (!user) {
      // User is not authenticated - send error response
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource',
      });
      return null;
    }
    
    return user;
  }
  
  /**
   * OPTIONAL AUTH - Allow both authenticated and guest users
   * 
   * Use this when authentication is optional but provides benefits
   * Example: Product listing (anyone can view, but logged-in users see personalized results)
   * 
   * @param req - HTTP request
   * @returns User if authenticated, null if guest (no error)
   */
  static async optionalAuth(req: Request): Promise<AuthenticatedUser | null> {
    // Same as verifyToken, but doesn't send error response
    return await this.verifyToken(req);
  }
}