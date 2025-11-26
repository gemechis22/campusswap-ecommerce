// ============================================
// AUTH ROUTES - Like @WebServlet("/auth/*")
// Maps authentication requests to controller
// ============================================

const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/AuthController');

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/auth/register
 * Register new user account
 */
router.post('/register', async (req, res, next) => {
  try {
    await AuthController.register(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * User login - returns JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    await AuthController.login(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', async (req, res, next) => {
  try {
    await AuthController.logout(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res, next) => {
  try {
    await AuthController.getCurrentUser(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
