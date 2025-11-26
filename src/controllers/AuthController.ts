// ============================================
// AUTH CONTROLLER - The Brain of Authentication
// MVC Pattern: This is the "Controller" for user auth
// ============================================

import { Request, Response } from 'express';
import { UserDAO } from '../dao/UserDAO';
import { generateToken } from '../utils/jwt';
import { AuthMiddleware } from '../middleware/auth';

/**
 * What data do we need to register a new user?
 * These are the form fields from the frontend
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;  // Optional: YU123456
  program?: string;    // Optional: EECS, Math, Business...
  year?: number;       // Optional: 1, 2, 3, 4, Graduate
  phoneNumber?: string;
}

/**
 * What data do we need to login?
 * Just email and password
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * AUTH CONTROLLER
 * 
 * Handles all authentication business logic:
 * - Register new users
 * - Login existing users
 * - Get current user profile
 * - Logout (clear token on frontend)
 */
export class AuthController {
  
  /**
   * REGISTER - Create New User Account
   * 
   * Flow:
   * 1. Validate input (email format, password strength, etc.)
   * 2. Check if email already exists
   * 3. Hash password (security!)
   * 4. Save user to database
   * 5. Generate JWT token
   * 6. Return token + user info
   * 
   * POST /api/auth/register
   * Body: { email, password, firstName, lastName, ... }
   */
  static async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;
      
      // STEP 1: Validate required fields
      // Making sure frontend sent everything we need
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, first name, and last name are required',
        });
      }
      
      // STEP 2: Validate email format
      // Must be a York University email (ends with @yorku.ca)
      const emailRegex = /^[^\s@]+@yorku\.ca$/;
      if (!emailRegex.test(data.email.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email',
          message: 'Please use your York University email (@yorku.ca)',
        });
      }
      
      // STEP 3: Validate password strength
      // At least 8 characters long
      if (data.password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Weak password',
          message: 'Password must be at least 8 characters long',
        });
      }
      
      // STEP 4: Check if email already exists
      // Prevent duplicate accounts
      const existingUser = await UserDAO.findByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ // 409 = Conflict
          success: false,
          error: 'Email already registered',
          message: 'An account with this email already exists. Try logging in instead.',
        });
      }
      
      // STEP 5: Check if student ID already exists (if provided)
      if (data.studentId) {
        const existingStudent = await UserDAO.findByStudentId(data.studentId);
        if (existingStudent) {
          return res.status(409).json({
            success: false,
            error: 'Student ID already registered',
            message: 'This student ID is already in use',
          });
        }
      }
      
      // STEP 6: Create user in database
      // UserDAO.create() will automatically hash the password
      const user = await UserDAO.create({
        email: data.email.toLowerCase(), // Store emails in lowercase
        password: data.password,         // Will be hashed by UserDAO
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
        program: data.program,
        year: data.year,
        phoneNumber: data.phoneNumber,
      });
      
      // STEP 7: Generate JWT token
      // This is their "digital passport" for future requests
      const token = generateToken({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      
      // STEP 8: Return success response
      // DON'T send back the password (even though it's hashed)
      return res.status(201).json({ // 201 = Created
        success: true,
        message: 'Registration successful! Welcome to CampusSwap.',
        data: {
          token,  // Frontend stores this
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            studentId: user.studentId,
            program: user.program,
            year: user.year,
            // Never send password!
          },
        },
      });
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }
  
  /**
   * LOGIN - Authenticate Existing User
   * 
   * Flow:
   * 1. Validate input (email & password provided)
   * 2. Find user by email
   * 3. Verify password matches (using bcrypt.compare)
   * 4. Update last login timestamp
   * 5. Generate JWT token
   * 6. Return token + user info
   * 
   * POST /api/auth/login
   * Body: { email, password }
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;
      
      // STEP 1: Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required',
        });
      }
      
      // STEP 2 & 3: Find user and verify password
      // UserDAO.verifyPassword() does both in one call
      const user = await UserDAO.verifyPassword(email.toLowerCase(), password);
      
      if (!user) {
        // Don't specify whether email or password was wrong (security best practice)
        return res.status(401).json({ // 401 = Unauthorized
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }
      
      // STEP 4: Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ // 403 = Forbidden
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated. Contact support.',
        });
      }
      
      // STEP 5: Update last login timestamp
      // Track when user last logged in (useful for analytics)
      await UserDAO.updateLastLogin(user.id);
      
      // STEP 6: Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      
      // STEP 7: Return success response
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.firstName}!`,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            studentId: user.studentId,
            program: user.program,
            year: user.year,
            profileImage: user.profileImage,
            lastLoginAt: new Date(), // Just logged in now
          },
        },
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'An unexpected error occurred during login',
      });
    }
  }
  
  /**
   * GET PROFILE - Get Current User Info
   * 
   * Flow:
   * 1. Verify JWT token (who is making this request?)
   * 2. Fetch full user data from database
   * 3. Include statistics (products, purchases, sales)
   * 4. Return user profile
   * 
   * GET /api/auth/me
   * Headers: Authorization: Bearer <token>
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // STEP 1: Verify authentication
      // requireAuth will automatically send 401 if not authenticated
      const currentUser = await AuthMiddleware.requireAuth(req, res);
      if (!currentUser) return; // Already sent 401 response
      
      // STEP 2: Fetch full user data
      // Get fresh data from database (not just what's in the token)
      const user = await UserDAO.findById(currentUser.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Your account could not be found',
        });
      }
      
      // STEP 3: Return profile data
      // Include everything except password
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          studentId: user.studentId,
          program: user.program,
          year: user.year,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          // Statistics from database
          stats: {
            // @ts-ignore - _count is added by Prisma
            productsListed: user._count?.products || 0,
            // @ts-ignore
            purchasesMade: user._count?.purchases || 0,
            // @ts-ignore
            itemsSold: user._count?.sales || 0,
          },
        },
      });
      
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        message: 'An unexpected error occurred',
      });
    }
  }
  
  /**
   * LOGOUT - Clear User Session
   * 
   * Note: JWT tokens are stateless (server doesn't track them)
   * So "logout" just means telling the frontend to delete the token
   * The frontend should:
   * 1. Delete token from localStorage/cookies
   * 2. Redirect to login page
   * 3. Clear any cached user data
   * 
   * POST /api/auth/logout
   * Headers: Authorization: Bearer <token>
   */
  static async logout(req: Request, res: Response) {
    try {
      // Verify user is authenticated
      const user = await AuthMiddleware.optionalAuth(req);
      
      if (user) {
        console.log(`👋 User logged out: ${user.email}`);
      }
      
      // Return success
      // Frontend will delete the token
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: 'An unexpected error occurred',
      });
    }
  }
  
  // Alias for routes compatibility
  static async getCurrentUser(req: Request, res: Response) {
    return this.getProfile(req, res);
  }
}
