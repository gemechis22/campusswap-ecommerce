# 🎓 CampusSwap Backend - EECS 4413 Project

**Backend API for CampusSwap Marketplace**  
Implementing MVC Architecture and DAO Pattern for York University Course Requirements

---

## 🏗️ Architecture

This backend follows professional software engineering patterns required for EECS 4413:

### **MVC (Model-View-Controller) Pattern**
```
pages/api/          → Routes (Entry Points)
src/controllers/    → Business Logic Layer
src/dao/            → Data Access Layer
prisma/schema.prisma → Models (Database Schema)
```

### **DAO (Data Access Object) Pattern**
- **ProductDAO**: Handles all product database operations
- **UserDAO**: Manages user data persistence
- Clean separation between business logic and data access

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (API Routes)
- **Language**: TypeScript
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: Prisma (Modern replacement for JDBC)
- **Authentication**: JWT with bcrypt

---

## 📁 Project Structure

```
campusswap-backend/
├── pages/
│   └── api/                    # API Routes (like @WebServlet)
│       ├── products.ts         # Product endpoints
│       └── products/
│           └── [id].ts         # Single product by ID
├── src/
│   ├── controllers/            # MVC Controllers
│   │   └── ProductController.ts
│   ├── dao/                    # Data Access Objects
│   │   ├── ProductDAO.ts
│   │   └── UserDAO.ts
│   ├── middleware/             # Authentication & Guards
│   │   └── auth.ts
│   └── utils/                  # Helper utilities
│       └── database.ts
├── prisma/
│   └── schema.prisma           # Database schema (9 models)
├── scripts/
│   └── seed.js                 # Sample data seeder
└── package.json
```

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Up Environment Variables**
Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

### **3. Initialize Database**
```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with sample data
node scripts/seed.js
```

### **4. Start Development Server**
```bash
npm run dev
```
Server runs at: `http://localhost:3000`

---

## 📡 API Endpoints

### **Products**

#### `GET /api/products`
Get all products with filtering and pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID
- `search` - Search in title/description
- `condition` - Filter by condition
- `minPrice` / `maxPrice` - Price range
- `courseCode` - Filter by course
- `status` - Filter by status (default: AVAILABLE)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Calculus Textbook",
      "price": 85.00,
      "seller": {
        "firstName": "Sarah",
        "program": "EECS"
      },
      "category": {
        "name": "Textbooks"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "total": 4,
    "totalPages": 1
  }
}
```

#### `GET /api/products/[id]`
Get single product by ID

#### `POST /api/products`
Create new product (requires authentication)

#### `PUT /api/products/[id]`
Update product (requires ownership)

#### `DELETE /api/products/[id]`
Delete product (requires ownership)

---

## 🗄️ Database Schema

### **Models (9 Tables)**
1. **User** - Student accounts and authentication
2. **Category** - Product categories
3. **Product** - Marketplace items
4. **CartItem** - Shopping cart persistence
5. **Order** - Transaction records
6. **OrderItem** - Order line items
7. **Review** - Product reviews
8. **Message** - User communication

### **Key Relations**
- User → Products (one-to-many)
- Product → Category (many-to-one)
- User → Orders (one-to-many as buyer/seller)
- Product → Reviews (one-to-many)

---

## 🔒 Authentication

JWT-based authentication with middleware protection:

```typescript
// Protected route example
const user = await AuthMiddleware.verifyToken(req);
if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 🧪 Sample Data

The seeder creates:
- **3 Categories**: Textbooks, Electronics, Lab Equipment
- **2 Users**: Sarah Chen (EECS), Mike Torres (Math)
- **4 Products**: Calculus book, Calculator, Lab kit, Drawing set

---

## 📚 Course Requirements Met

✅ **MVC Architecture** - Controllers separate business logic  
✅ **DAO Pattern** - Data access abstraction  
✅ **Multi-tier Design** - Clear layer separation  
✅ **RESTful API** - Standard HTTP methods  
✅ **Database Integration** - Prisma ORM (modern JDBC)  
✅ **Professional Code** - TypeScript, proper error handling  

---

## 🔗 Related Repositories

- **Frontend**: [campusswap](../campusswap) - Static HTML/CSS/JS

---

## 👨‍💻 Development

**Course**: EECS 4413 - Building E-Commerce Systems  
**Institution**: York University  
**Timeline**: 30 days (Nov 8 - Dec 3, 2025)

---

## 📝 License

MIT - Academic Project
