// ============================================
// PRODUCT DAO - Data Access Object Pattern
// Your "JDBC Helper Class" for Products
// ============================================

import prisma from '../utils/database';

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  condition: string;
  categoryId: string;
  sellerId: string;
  courseCode?: string;
  isbn?: string;
  edition?: string;
  author?: string;
  imageUrl?: string;
  meetupLocation?: string;
  isShippable?: boolean;
  shippingCost?: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  courseCode?: string;
  sellerId?: string;
  status?: string;
}

/**
 * Product Data Access Object
 * Like your Java DAO classes but with Prisma instead of JDBC
 */
export class ProductDAO {
  
  /**
   * Create new product - Like "INSERT INTO products..."
   */
  static async create(productData: CreateProductData): Promise<any> {
    try {
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          condition: productData.condition,
          categoryId: productData.categoryId,
          sellerId: productData.sellerId,
          courseCode: productData.courseCode,
          isbn: productData.isbn,
          edition: productData.edition,
          author: productData.author,
          imageUrl: productData.imageUrl,
          meetupLocation: productData.meetupLocation,
          isShippable: productData.isShippable || false,
          shippingCost: productData.shippingCost,
          status: 'AVAILABLE',
        },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          category: true,
        }
      });
      
      console.log(`✅ Product created: ${product.title}`);
      return product;
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      throw error;
    }
  }

  /**
   * Find product by ID - Like "SELECT * FROM products WHERE id = ?"
   */
  static async findById(id: string): Promise<any | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              program: true,
            }
          },
          category: true,
          reviews: {
            include: {
              reviewer: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('❌ Product findById failed:', error);
      throw error;
    }
  }

  /**
   * Find many products with pagination and filters
   */
  static async findMany(
    page: number = 1, 
    limit: number = 10, 
    filters: ProductFilters = {}
  ): Promise<{
    products: any[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build WHERE clause (like your SQL WHERE conditions)
      const where: any = {};
      
      // Only show available products by default
      if (filters.status) {
        where.status = filters.status;
      } else {
        where.status = 'AVAILABLE';
      }
      
      // Filter by category
      if (filters.category) {
        where.categoryId = filters.category;
      }
      
      // Search functionality
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { courseCode: { contains: filters.search } },
        ];
      }
      
      // Filter by condition
      if (filters.condition) {
        where.condition = filters.condition;
      }
      
      // Price range filter
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
      }
      
      // Filter by course code
      if (filters.courseCode) {
        where.courseCode = filters.courseCode;
      }
      
      // Filter by seller
      if (filters.sellerId) {
        where.sellerId = filters.sellerId;
      }

      // Execute queries
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          skip,
          take: limit,
          where,
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                program: true,
              }
            },
            category: {
              select: {
                name: true,
                slug: true,
              }
            },
            _count: {
              select: {
                reviews: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          }
        }),
        prisma.product.count({ where })
      ]);

      console.log(`📦 Found ${products.length} products`);
      
      return {
        products,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Product findMany failed:', error);
      throw error;
    }
  }

  /**
   * Update product - Like "UPDATE products SET ... WHERE id = ?"
   */
  static async update(id: string, updateData: Partial<CreateProductData>): Promise<any> {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          category: true,
        }
      });
      
      console.log(`✅ Product updated: ${product.title}`);
      return product;
    } catch (error) {
      console.error('❌ Product update failed:', error);
      throw error;
    }
  }
}