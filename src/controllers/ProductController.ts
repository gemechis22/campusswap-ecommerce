// ============================================
// PRODUCT CONTROLLER - MVC Pattern
// EECS 4413 Project - Business Logic Layer
// ============================================

import { NextApiRequest, NextApiResponse } from 'next';
import { ProductDAO } from '../dao/ProductDAO';
import { AuthMiddleware } from '../middleware/auth';

export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  condition: string;
  categoryId: string;
  courseCode?: string;
  isbn?: string;
  edition?: string;
  author?: string;
  brand?: string;
  model?: string;
  meetupLocation?: string;
  isShippable?: boolean;
  shippingCost?: number;
  imageUrl?: string;
}

export interface ProductUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  categoryId?: string;
  courseCode?: string;
  isbn?: string;
  edition?: string;
  author?: string;
  brand?: string;
  model?: string;
  meetupLocation?: string;
  isShippable?: boolean;
  shippingCost?: number;
  imageUrl?: string;
  status?: string;
}

/**
 * Product Controller - Handles product-related business logic
 * Implements MVC Controller pattern
 */
export class ProductController {
  
  /**
   * GET /api/products - Get all products with filtering and pagination
   */
  static async getProducts(req: NextApiRequest, res: NextApiResponse) {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        search,
        condition,
        minPrice,
        maxPrice,
        courseCode,
        sellerId,
        status = 'AVAILABLE'
      } = req.query;

      // Validate and parse parameters
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

      const filters = {
        category: category as string,
        search: search as string,
        condition: condition as string,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        courseCode: courseCode as string,
        sellerId: sellerId as string,
        status: status as string,
      };

      const result = await ProductDAO.findMany(pageNum, limitNum, filters);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: pageNum < result.totalPages,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error('❌ Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/products/[id] - Get single product by ID
   */
  static async getProductById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required',
        });
      }

      const product = await ProductDAO.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('❌ Get product by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/products - Create new product (requires authentication)
   */
  static async createProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const user = await AuthMiddleware.verifyToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const productData: ProductCreateRequest = req.body;

      // Validate required fields
      if (!productData.title || !productData.description || !productData.price || !productData.categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, price, categoryId',
        });
      }

      // Validate price
      if (productData.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be greater than 0',
        });
      }

      // Create product
      const product = await ProductDAO.create({
        ...productData,
        sellerId: user.id,
      });

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('❌ Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/products/[id] - Update product (requires authentication and ownership)
   */
  static async updateProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const user = await AuthMiddleware.verifyToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.query;
      const updateData: ProductUpdateRequest = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required',
        });
      }

      // Check if product exists and user owns it
      const existingProduct = await ProductDAO.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      if (existingProduct.sellerId !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own products',
        });
      }

      // Validate price if provided
      if (updateData.price !== undefined && updateData.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be greater than 0',
        });
      }

      // Update product
      const product = await ProductDAO.update(id, updateData);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error('❌ Update product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/products/[id] - Delete product (requires authentication and ownership)
   */
  static async deleteProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const user = await AuthMiddleware.verifyToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required',
        });
      }

      // Check if product exists and user owns it
      const existingProduct = await ProductDAO.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      if (existingProduct.sellerId !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own products',
        });
      }

      // Soft delete (mark as withdrawn)
      await ProductDAO.update(id, { status: 'WITHDRAWN' });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('❌ Delete product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}