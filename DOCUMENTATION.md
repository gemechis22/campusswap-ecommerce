# CampusSwap - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Technology Stack](#technology-stack)
4. [Features Implementation](#features-implementation)
5. [Code Organization](#code-organization)
6. [API Documentation](#api-documentation)
7. [Security Implementation](#security-implementation)
8. [Testing Guide](#testing-guide)
9. [Deployment Instructions](#deployment-instructions)
10. [EECS 4413 Requirements Compliance](#eecs-4413-requirements-compliance)

---

## 📖 Project Overview

**CampusSwap** is a full-stack e-commerce marketplace built for York University students to buy and sell academic materials (textbooks, electronics, lab equipment, and stationery).

### Key Features
- ✅ User authentication (JWT-based)
- ✅ Product browsing with search, filtering, and sorting
- ✅ Shopping cart with persistent storage
- ✅ Secure checkout with Luhn algorithm validation
- ✅ Admin dashboard with sales analytics
- ✅ Image upload for products
- ✅ Real-time inventory management
- ✅ Order history and tracking

---

## 🏗️ Architecture & Design Patterns

### 1. **MVC (Model-View-Controller) Pattern**

#### Backend (Express.js)
```
Model (DAO Layer)
├── ProductDAO.ts - Database operations for products
├── UserDAO.ts - Database operations for users
└── [Data persistence via Prisma ORM]

View (Response Layer)
└── JSON API responses

Controller (Business Logic)
├── ProductController.ts - Product business logic
├── AuthController.ts - Authentication logic
├── AdminController.ts - Admin operations
└── [Request handlers & validation]
```

#### Frontend (Vanilla JavaScript ES6 Modules)
```
Model (Services)
├── api.service.js - HTTP communication
├── auth.service.js - Authentication state
└── cart.service.js - Shopping cart state

View (Components)
├── ProductComponent.js - Product rendering
├── CartComponent.js - Cart UI
├── AuthComponent.js - Login/Register forms
├── AdminComponent.js - Admin dashboard
├── PaymentComponent.js - Payment forms
└── ImageUploadComponent.js - Image upload

Controller (App Controller)
└── app.js - Orchestrates all modules
```

### 2. **DAO (Data Access Object) Pattern**
Separates data access logic from business logic:
- **ProductDAO**: CRUD operations for products
- **UserDAO**: User management operations
- **Benefits**: Database abstraction, easier testing, maintainability

### 3. **Separation of Concerns**
- **Services**: Business logic and data management
- **Components**: UI rendering only
- **Controllers**: Coordination between services and views
- **Middleware**: Cross-cutting concerns (auth, validation, uploads)

### 4. **Modular Architecture**
- Each module has single responsibility
- Easy to test individually
- Scalable and maintainable
- Follows industry standards

---

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **CORS**: cors middleware

### Frontend
- **Language**: JavaScript ES6+ Modules
- **Charts**: Chart.js 4.4.0
- **Styling**: Custom CSS (CSS Variables)
- **Module System**: ES6 import/export

### Database Schema (Prisma)
```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  firstName  String
  lastName   String
  isAdmin    Boolean  @default(false)
  products   Product[]
  orders     Order[]
  cart       CartItem[]
  createdAt  DateTime @default(now())
}

model Product {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Decimal
  quantity    Int
  category    Category @relation(fields: [categoryId], references: [id])
  seller      User     @relation(fields: [sellerId], references: [id])
  imageUrl    String?
  status      String   @default("AVAILABLE")
  // ... more fields
}

model Order {
  id           String  @id @default(uuid())
  orderNumber  String  @unique
  buyer        User    @relation(fields: [buyerId], references: [id])
  totalAmount  Decimal
  status       String
  // ... more fields
}
```

---

## ✨ Features Implementation

### 1. Authentication System
**Location**: `src/services/auth.service.js`, `src/controllers/AuthController.ts`

**Implementation**:
```javascript
// JWT token generation on login
const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

// Token verification middleware
export async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
}
```

**Features**:
- Secure password hashing with bcrypt
- JWT token storage in localStorage
- Auto-login on page refresh
- Protected routes requiring authentication

### 2. Shopping Cart
**Location**: `src/services/cart.service.js`, `src/components/CartComponent.js`

**Implementation**:
- Database-backed cart (persistent across sessions)
- Real-time updates
- Quantity management
- Total calculation
- Visual cart badge showing item count

**API Endpoints**:
- `POST /api/cart/add` - Add item
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/remove` - Remove item
- `GET /api/cart` - Get user's cart

### 3. Payment Processing with Luhn Algorithm
**Location**: `src/utils/payment.js`, `src/components/PaymentComponent.js`

**Luhn Algorithm Implementation**:
```javascript
export function validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}
```

**Features**:
- Card type detection (Visa, Mastercard, Amex, Discover)
- CVV validation
- Expiration date validation
- Card number formatting
- Test card numbers provided

### 4. Admin Dashboard
**Location**: `src/components/AdminComponent.js`, `src/controllers/AdminController.ts`

**Features**:
- **Overview Tab**: Platform statistics with Chart.js visualization
- **Sales Reports**: Date-filtered sales with dual-axis line chart
- **Inventory Management**: Real-time stock updates
- **User Management**: Admin role assignment

**Chart.js Implementation**:
```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Revenue',
            data: revenueData,
            yAxisID: 'y'
        }, {
            label: 'Orders',
            data: ordersData,
            yAxisID: 'y1'
        }]
    },
    options: {
        scales: {
            y: { position: 'left' },   // Revenue axis
            y1: { position: 'right' }   // Orders axis
        }
    }
});
```

### 5. Image Upload System
**Location**: `src/middleware/upload.ts`, `src/components/ImageUploadComponent.js`

**Backend (Multer)**:
```javascript
const storage = multer.diskStorage({
    destination: 'uploads/products',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

**Frontend**:
- Drag-and-drop support
- Image preview before upload
- File type and size validation
- Progress indication

---

## 📁 Code Organization

### Frontend Structure
```
src/js/
├── app.js                      # Main controller (563 lines)
├── config.js                   # Configuration (20 lines)
├── components/                 # UI Components
│   ├── AdminComponent.js       # Admin dashboard (500+ lines)
│   ├── AuthComponent.js        # Authentication (150 lines)
│   ├── CartComponent.js        # Shopping cart (180 lines)
│   ├── ImageUploadComponent.js # Image upload (120 lines)
│   ├── PaymentComponent.js     # Payment form (250 lines)
│   └── ProductComponent.js     # Product display (80 lines)
├── services/                   # Business Logic
│   ├── api.service.js          # API calls (200 lines)
│   ├── auth.service.js         # Auth management (90 lines)
│   └── cart.service.js         # Cart management (110 lines)
└── utils/                      # Utilities
    ├── helpers.js              # General helpers (70 lines)
    └── payment.js              # Luhn algorithm (200 lines)
```

### Backend Structure
```
src/
├── controllers/
│   ├── AdminController.ts      # Admin operations
│   ├── AuthController.ts       # Authentication
│   └── ProductController.ts    # Product management
├── dao/
│   ├── ProductDAO.ts           # Product data access
│   └── UserDAO.ts              # User data access
├── middleware/
│   ├── auth.ts                 # JWT verification
│   ├── adminAuth.ts            # Admin authorization
│   └── upload.ts               # File upload (Multer)
├── routes/
│   ├── adminRoutes.ts          # Admin API endpoints
│   ├── authRoutes.js           # Auth endpoints
│   ├── cartRoutes.js           # Cart endpoints
│   ├── orderRoutes.js          # Order endpoints
│   └── productRoutes.js        # Product endpoints
└── utils/
    ├── database.ts             # Prisma client
    └── jwt.ts                  # JWT utilities
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register new user
```json
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@yorku.ca",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "email": "..." }
  }
}
```

#### POST /api/auth/login
Login user
```json
Request:
{
  "email": "john@yorku.ca",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "email": "...", "isAdmin": false }
  }
}
```

#### GET /api/auth/me
Get current user (requires auth)
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "email": "john@yorku.ca",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false
  }
}
```

### Product Endpoints

#### GET /api/products
Get all products with filtering
```
Query Parameters:
- page: number (default 1)
- limit: number (default 10)
- category: string
- search: string
- sortBy: "price" | "createdAt"
- sortOrder: "asc" | "desc"

Response:
{
  "success": true,
  "data": [/* products */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### POST /api/products/upload
Upload product image (requires auth)
```
Content-Type: multipart/form-data
Form Data: image (file)

Response:
{
  "success": true,
  "data": {
    "url": "/uploads/products/image-123.jpg",
    "filename": "image-123.jpg"
  }
}
```

### Cart Endpoints

#### POST /api/cart/add
Add item to cart (requires auth)
```json
Request:
{
  "productId": "...",
  "quantity": 1
}

Response:
{
  "success": true,
  "message": "Item added to cart"
}
```

### Admin Endpoints (requires admin role)

#### GET /api/admin/dashboard
Get dashboard statistics
```json
Response:
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalProducts": 500,
      "totalOrders": 300,
      "totalRevenue": 15000
    },
    "recentOrders": [/* orders */],
    "topProducts": [/* products */]
  }
}
```

#### GET /api/admin/sales
Get sales report
```
Query: ?startDate=2025-01-01&endDate=2025-12-31

Response:
{
  "success": true,
  "data": {
    "chartData": [{ "date": "2025-01-01", "revenue": 500, "orders": 10 }],
    "summary": {
      "totalOrders": 300,
      "totalRevenue": 15000,
      "averageOrderValue": 50
    }
  }
}
```

---

## 🔒 Security Implementation

### 1. Password Security
- **Hashing**: bcryptjs with salt rounds (10)
- **Storage**: Never store plain text passwords
- **Validation**: Minimum 8 characters required

### 2. JWT Authentication
- **Storage**: localStorage (frontend), HTTP-only cookies (production)
- **Expiration**: 7 days
- **Verification**: Middleware checks token on protected routes

### 3. Authorization
- **Role-based**: `isAdmin` flag in User model
- **Admin middleware**: Verifies admin role for sensitive operations
- **Ownership checks**: Users can only modify their own data

### 4. Input Validation
- **Backend**: Validate all inputs before processing
- **Frontend**: Client-side validation for UX
- **SQL Injection**: Protected by Prisma ORM

### 5. File Upload Security
- **Type validation**: Only allow image files
- **Size limits**: 5MB maximum
- **Filename sanitization**: Unique names to prevent overwrites

---

## 🧪 Testing Guide

### Test Accounts

**Regular User**:
- Email: `test@yorku.ca`
- Password: `testuser123`

**Admin User**:
- Email: `admin@yorku.ca`
- Password: `admin123`
- (Create via SQL or toggle in database)

### Test Credit Cards (Luhn valid)
- **Visa**: 4532015112830366
- **Mastercard**: 5425233430109903
- **Amex**: 374245455400126
- **Discover**: 6011000991300009

### Manual Testing Checklist

**Authentication**:
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Auto-login on page refresh
- [ ] Logout functionality

**Products**:
- [ ] Browse all products
- [ ] Search products
- [ ] Filter by category
- [ ] Sort by price/date
- [ ] View product details

**Cart**:
- [ ] Add product to cart (requires login)
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persists after logout/login

**Checkout**:
- [ ] View cart total
- [ ] Enter payment information
- [ ] Validate card with Luhn algorithm
- [ ] Complete purchase
- [ ] View order confirmation

**Admin Dashboard** (admin only):
- [ ] View platform statistics
- [ ] Generate sales report
- [ ] View sales chart
- [ ] Update inventory
- [ ] Manage users
- [ ] Toggle admin status

---

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 18+ installed
- Git installed
- Database (SQLite for development, PostgreSQL for production)

### Local Development

1. **Clone Repository**:
```bash
git clone <repository-url>
cd campusswap
```

2. **Backend Setup**:
```bash
cd campusswap-backend
npm install
```

3. **Configure Environment**:
Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

4. **Initialize Database**:
```bash
npx prisma migrate dev
npx prisma db seed  # Optional: seed test data
```

5. **Start Backend**:
```bash
npm run dev
```

6. **Frontend Setup**:
```bash
cd ../campusswap
npm install
npm run dev
```

7. **Access Application**:
- Frontend: http://localhost:5500
- Backend: http://localhost:3001

### Production Deployment (Vercel + Railway)

#### Backend on Railway

1. **Create Railway Account**: https://railway.app

2. **New Project**:
   - Connect GitHub repository
   - Select `campusswap-backend` folder

3. **Configure Environment Variables**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=production-secret-key
NODE_ENV=production
```

4. **Add Build Command**:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy",
    "start": "node server.js"
  }
}
```

5. **Deploy**: Railway auto-deploys on push

#### Frontend on Vercel

1. **Create Vercel Account**: https://vercel.com

2. **Import Project**:
   - Connect GitHub repository
   - Select `campusswap` folder

3. **Configure Build Settings**:
   - Framework: Other
   - Build Command: (leave empty)
   - Output Directory: `.`

4. **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

5. **Deploy**: Vercel auto-deploys on push

---

## 📚 EECS 4413 Requirements Compliance

### Architecture Patterns ✅
- [x] **MVC Pattern**: Controllers, Models (DAOs), Views (JSON/Components)
- [x] **DAO Pattern**: ProductDAO, UserDAO for data access
- [x] **Separation of Concerns**: Services, Controllers, Components separate
- [x] **Modular Design**: Each file < 600 lines, single responsibility

### Core Features ✅
- [x] **User Authentication**: JWT-based with password hashing
- [x] **Product Management**: CRUD operations
- [x] **Shopping Cart**: Persistent, database-backed
- [x] **Checkout Process**: Payment validation with Luhn algorithm
- [x] **Order Management**: Order creation and history
- [x] **Admin Dashboard**: Sales reports, inventory, user management
- [x] **Search & Filter**: Multiple criteria supported
- [x] **File Upload**: Images with Multer

### Technical Requirements ✅
- [x] **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)
- [x] **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- [x] **Security**: JWT authentication, password hashing, input validation
- [x] **Documentation**: Comprehensive code comments and docs
- [x] **Code Organization**: Modular, scalable structure
- [x] **Error Handling**: Try/catch, user-friendly messages

### Advanced Features ✅
- [x] **Data Visualization**: Chart.js for sales analytics
- [x] **Payment Processing**: Luhn algorithm validation
- [x] **Image Upload**: Multer with validation
- [x] **Real-time Updates**: Cart badge, inventory status
- [x] **Responsive Design**: Mobile-friendly CSS
- [x] **Professional UI**: Modern styling with animations

---

## 👥 Team & Contributions

**Developer**: EECS 4413 Student
**Course**: Web Service Architecture
**Institution**: York University
**Semester**: Fall 2025

---

## 📞 Support & Contact

For issues or questions:
- Check documentation first
- Review code comments
- Test with provided test accounts
- Verify API endpoints with Postman

---

**Last Updated**: November 28, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
