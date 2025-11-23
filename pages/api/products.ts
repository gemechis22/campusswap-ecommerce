// ============================================
// PRODUCTS API ROUTE - Your Servlet URL Mapping
// Handles /api/products requests
// ============================================

import { NextApiRequest, NextApiResponse } from 'next';
import { ProductController } from '../../src/controllers/ProductController';

/**
 * Products API Route Handler
 * Like your @WebServlet("/products") annotation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Enable CORS for frontend communication
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route to different controller methods based on HTTP method
    // Like having doGet(), doPost() in your servlet
    switch (req.method) {
      case 'GET':
        // GET /api/products - Get all products
        await ProductController.getProducts(req, res);
        break;

      case 'POST':
        // POST /api/products - Create new product
        await ProductController.createProduct(req, res);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
        });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}