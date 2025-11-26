// ============================================
// PRODUCT ROUTES - Like @WebServlet("/products")
// Maps HTTP requests to controller methods
// ============================================

const express = require('express');
const router = express.Router();
const { ProductController } = require('../controllers/ProductController');

// ============================================
// PRODUCT API ENDPOINTS
// ============================================

/**
 * GET /api/products
 * Get all products with filtering and pagination
 * Query params: page, limit, category, search, condition, minPrice, maxPrice
 */
router.get('/', async (req, res, next) => {
  try {
    await ProductController.getProducts(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    await ProductController.getProductById(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create new product (requires authentication)
 */
router.post('/', async (req, res, next) => {
  try {
    await ProductController.createProduct(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id
 * Update product (requires authentication and ownership)
 */
router.put('/:id', async (req, res, next) => {
  try {
    await ProductController.updateProduct(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (requires authentication and ownership)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await ProductController.deleteProduct(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
