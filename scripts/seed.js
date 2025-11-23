// ============================================
// SAMPLE DATA SEEDER - Add Test Data to Database
// Like your SQL INSERT statements
// ============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Create sample categories
    const textbooksCategory = await prisma.category.create({
      data: {
        name: 'Textbooks',
        slug: 'textbooks',
        description: 'Course books for all programs',
        icon: '📚',
      }
    });

    const electronicsCategory = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics', 
        description: 'Laptops, calculators, tablets',
        icon: '💻',
      }
    });

    const labCategory = await prisma.category.create({
      data: {
        name: 'Lab Equipment',
        slug: 'lab-equipment',
        description: 'Safety gear, lab kits, tools',
        icon: '🔬',
      }
    });

    console.log('✅ Categories created');

    // Create sample users
    const user1 = await prisma.user.create({
      data: {
        email: 'sarah@yorku.ca',
        password: 'hashed_password_123',
        firstName: 'Sarah',
        lastName: 'Chen',
        studentId: 'YU123456',
        program: 'EECS',
        year: 3,
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'mike@yorku.ca',
        password: 'hashed_password_456',
        firstName: 'Mike',
        lastName: 'Torres',
        studentId: 'YU789012',
        program: 'Mathematics',
        year: 2,
      }
    });

    console.log('✅ Users created');

    // Create sample products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          title: 'Calculus Early Transcendentals (8th Ed)',
          description: 'Excellent condition calculus textbook. Used for MATH 1013. No highlighting, all pages intact.',
          price: 85.00,
          condition: 'EXCELLENT',
          courseCode: 'MATH 1013',
          isbn: '9781285741550',
          edition: '8th Edition',
          author: 'James Stewart',
          imageUrl: '📖',
          meetupLocation: 'Scott Library',
          sellerId: user1.id,
          categoryId: textbooksCategory.id,
        }
      }),

      prisma.product.create({
        data: {
          title: 'TI-84 Plus CE Graphing Calculator',
          description: 'Perfect for math and physics courses. Includes all original accessories and manual.',
          price: 120.00,
          condition: 'LIKE_NEW',
          courseCode: 'MATH/PHYS',
          brand: 'Texas Instruments',
          model: 'TI-84 Plus CE',
          imageUrl: '💻',
          meetupLocation: 'Bergeron Centre',
          sellerId: user2.id,
          categoryId: electronicsCategory.id,
        }
      }),

      prisma.product.create({
        data: {
          title: 'Chemistry Lab Safety Kit',
          description: 'Complete safety kit for chemistry labs. Includes goggles, lab coat, and gloves.',
          price: 35.00,
          condition: 'GOOD',
          courseCode: 'CHEM 1000/1001',
          imageUrl: '⚗️',
          meetupLocation: 'Petrie Science Building',
          sellerId: user1.id,
          categoryId: labCategory.id,
        }
      }),

      prisma.product.create({
        data: {
          title: 'Engineering Drawing Set',
          description: 'Professional drawing instruments for engineering courses. Lightly used.',
          price: 25.00,
          condition: 'FAIR',
          courseCode: 'ESSE 1012',
          imageUrl: '📐',
          meetupLocation: 'Engineering Building',
          sellerId: user2.id,
          categoryId: labCategory.id,
        }
      })
    ]);

    console.log(`✅ ${products.length} products created`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log('- 3 categories (Textbooks, Electronics, Lab Equipment)');
    console.log('- 2 users (Sarah Chen, Mike Torres)'); 
    console.log('- 4 products (Calculus book, Calculator, Lab kit, Drawing set)');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDatabase();