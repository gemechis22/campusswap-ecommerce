// ============================================
// JWT TOKEN UTILITY - Digital Passport System
// ============================================

import jwt from 'jsonwebtoken';

/**
 * What is a JWT Token?
 * Think of it like an airport security badge:
 * - Contains your identity (user ID, email)
 * - Has an expiration time (24 hours in our case)
 * - Signed by the server (like a hologram on your ID)
 * - Can't be faked without the secret key
 * 
 * Why JWT instead of sessions?
 * - Stateless: Server doesn't need to remember anything
 * - Scalable: Works across multiple servers
 * - Mobile-friendly: Easy to store in apps
 */

// Get secret key from environment variable
// This is like the master key only your server knows
const JWT_SECRET = process.env.JWT_SECRET || 'campusswap-dev-secret-key-2025';

// How long before the token expires
const JWT_EXPIRATION = '24h'; // 24 hours

/**
 * What goes inside a JWT token?
 * Just the essential user info we need for every request
 */
export interface JWTPayload {
  userId: string;        // Unique user ID from database
  email: string;         // User's email
  firstName: string;     // For personalization ("Hi, John!")
  lastName: string;      // Full name if needed
}

/**
 * CREATE TOKEN - Issue a digital passport
 * 
 * When user logs in successfully, we create this token
 * They send it back with every request to prove who they are
 * 
 * @param payload - User information to embed in token
 * @returns Signed JWT string
 */
export function generateToken(payload: JWTPayload): string {
  try {
    // jwt.sign() is like putting a tamper-proof seal on the data
    // If anyone tries to modify it, the signature breaks
    const token = jwt.sign(
      payload,              // The data we're sealing
      JWT_SECRET,           // Our secret signing key
      { 
        expiresIn: JWT_EXPIRATION,  // Auto-expire after 24h
        issuer: 'campusswap',       // Who created this token
      }
    );
    
    console.log(`🔐 Token generated for user: ${payload.email}`);
    return token;
    
  } catch (error) {
    console.error('❌ Token generation failed:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * VERIFY TOKEN - Check if passport is valid
 * 
 * Every protected API route calls this to verify:
 * 1. Token hasn't been tampered with
 * 2. Token hasn't expired
 * 3. Token was signed by our server
 * 
 * @param token - The JWT string from Authorization header
 * @returns Decoded user data if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // Remove "Bearer " prefix if present
    // Frontend might send: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const cleanToken = token.replace('Bearer ', '').trim();
    
    // jwt.verify() checks:
    // 1. Signature is correct (wasn't tampered)
    // 2. Token hasn't expired
    // 3. All claims are valid
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as JWTPayload;
    
    console.log(`✅ Token verified for user: ${decoded.email}`);
    return decoded;
    
  } catch (error) {
    // Common errors:
    // - TokenExpiredError: Token is too old
    // - JsonWebTokenError: Token is malformed or signature is wrong
    // - NotBeforeError: Token used before it's valid
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('⏰ Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('🚫 Invalid token signature');
    } else {
      console.error('❌ Token verification failed:', error);
    }
    
    return null; // Invalid token = not authenticated
  }
}

/**
 * DECODE TOKEN (without verification)
 * 
 * Sometimes we just want to peek at what's inside without verifying
 * Useful for debugging or getting non-sensitive info
 * 
 * ⚠️ NEVER trust this data for authentication!
 * Always use verifyToken() for security checks
 * 
 * @param token - The JWT string
 * @returns Decoded payload (unverified!)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const cleanToken = token.replace('Bearer ', '').trim();
    const decoded = jwt.decode(cleanToken) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('❌ Token decode failed:', error);
    return null;
  }
}

/**
 * REFRESH TOKEN (Future feature)
 * 
 * Idea: When token is about to expire, generate a new one
 * This keeps users logged in without re-entering password
 * 
 * For now, users need to login again after 24h
 * We can implement refresh tokens later if needed
 */
export function needsRefresh(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  // Check if token expires in less than 1 hour
  // @ts-ignore - 'exp' is added by jwt.sign()
  const expiresAt = decoded.exp * 1000; // Convert to milliseconds
  const oneHourFromNow = Date.now() + (60 * 60 * 1000);
  
  return expiresAt < oneHourFromNow;
}
