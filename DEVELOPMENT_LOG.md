# CampusSwap Development Log

## 📅 November 8, 2025 - Day 1-2: Foundation Complete

### 🎯 What We Built
- **Static CampusSwap homepage** with modern design
- **Responsive layout** that works on mobile, tablet, desktop
- **Professional styling** with York University branding
- **Standard project structure** ready for scaling

### 🛠️ Technologies Used
- **HTML5**: Semantic structure with proper accessibility
- **CSS3**: Grid, Flexbox, custom properties, responsive design
- **Git**: Version control with professional commit messages

### 🏗️ Architecture Decisions
1. **Folder Structure**: Standard web development organization
   - `index.html` in root
   - Styles in `src/styles/`
   - Ready for JavaScript in `src/js/`
   - Assets will go in `public/`

2. **CSS Organization**: Using CSS custom properties for theming
   - Color system based on York University brand
   - Consistent spacing and typography scale
   - Reusable component classes

3. **Responsive Design**: Mobile-first approach
   - CSS Grid for product/category layouts
   - Flexible navigation that adapts to screen size
   - Scalable typography and spacing

### 📚 Key Learning Outcomes
- **Semantic HTML5** for accessibility and SEO
- **Modern CSS** with Grid/Flexbox layouts
- **Design Systems** using CSS custom properties
- **Git workflow** with meaningful commits
- **Professional project structure**

### 🔗 GitHub Repository
- **URL**: https://github.com/gemechis22/campusswap-ecommerce
- **Status**: Day 1-2 foundation complete and pushed

---

## 📅 November 22, 2025 - Day 15-16: Backend Architecture Complete

### 🎯 What We Built
- **Full Backend API** with Next.js and TypeScript
- **Database Schema** with Prisma ORM (8 models)
- **MVC Architecture** following EECS 4413 requirements
- **DAO Pattern** for data access layer
- **RESTful API** with products endpoint
- **Authentication middleware** ready for JWT

### 🛠️ Technologies Used
- **Next.js 14**: API routes and serverless functions
- **TypeScript**: Type-safe backend development
- **Prisma ORM**: Database modeling and migrations
- **SQLite**: Development database (production-ready for PostgreSQL)
- **Node.js**: Runtime environment

### 🏗️ Architecture Implementation

#### 1. **Database Models** (Prisma Schema)
   - User: Authentication and profiles
   - Product: Marketplace items with academic fields
   - Category: Product organization
   - Order & OrderItem: Transaction management
   - CartItem: Shopping cart persistence
   - Review: Product ratings and feedback
   - Message: User communication

#### 2. **MVC Pattern**
   - **Controllers**: `ProductController.ts` - Business logic
   - **Models**: Prisma schema definitions
   - **Views**: API JSON responses
   - **Routes**: Next.js API routes (`/api/products`)

#### 3. **DAO Pattern**
   - `ProductDAO.ts`: Product data access with CRUD operations
   - `UserDAO.ts`: User data management
   - Abstraction layer between controllers and database
   - Reusable query methods with filtering and pagination

#### 4. **API Endpoints Implemented**
   ```
   GET    /api/products        - List products (with filters)
   POST   /api/products        - Create product
   GET    /api/products/[id]   - Get single product
   PUT    /api/products/[id]   - Update product
   DELETE /api/products/[id]   - Delete product
   ```

### 🧪 Testing Results
- ✅ Database migration successful (8 tables created)
- ✅ Sample data seeded (4 products, 2 users, 3 categories)
- ✅ Next.js dev server running on port 3000
- ✅ GET /api/products endpoint working
- ✅ Returns proper JSON with pagination
- ✅ Includes seller info and category relations

### 📚 Key Learning Outcomes
- **MVC Architecture**: Separation of concerns in full-stack apps
- **DAO Pattern**: Database abstraction and reusability
- **Prisma ORM**: Modern type-safe database access
- **API Design**: RESTful endpoints with proper HTTP methods
- **TypeScript**: Strong typing for backend development
- **Database Relations**: Foreign keys and JOIN operations

### 🔗 GitHub Repository
- **Branch**: `backend`
- **Status**: Backend complete and pushed
- **URL**: https://github.com/gemechis22/campusswap-ecommerce/tree/backend
- **Commit**: "feat: Add backend with MVC architecture and DAO pattern"

### 📁 Project Structure
```
campusswap-backend/
├── pages/api/          # Next.js API routes
├── src/
│   ├── controllers/    # MVC Controllers
│   ├── dao/           # DAO Pattern
│   ├── middleware/    # Auth & validation
│   └── utils/         # Database connection
├── prisma/
│   └── schema.prisma  # Database schema
└── scripts/
    └── seed.js        # Test data seeder
```

---

## 📅 November 25, 2025 - Day 17: Express.js Backend Migration

### 🎯 What We Built
- **Migrated from Next.js to Express.js** - Resolved server connectivity issues
- **Express server with MVC routing** - Traditional servlet-style architecture
- **RESTful API working on port 3001** - Fully functional backend
- **Maintained all existing architecture** - Controllers, DAOs, and Prisma intact

### 🛠️ Technologies Used
- **Express.js**: Web application framework for Node.js
- **TypeScript with ts-node**: Runtime TypeScript execution
- **CORS middleware**: Cross-origin resource sharing enabled
- **All previous tech**: Prisma, SQLite, JWT, bcryptjs

### 🏗️ Architecture Updates

#### **Why We Switched to Express:**
- Next.js had port binding issues on Windows (server said "Ready" but wouldn't accept connections)
- Express is more aligned with EECS 4413 servlet architecture
- Simpler, more reliable, and easier to understand
- Direct mapping to Java Servlets concepts

#### **New Structure:**
```
campusswap-backend/
├── server.js                # Main Express server (like web.xml)
├── src/
│   ├── routes/             # NEW: Route mappings
│   │   ├── productRoutes.js
│   │   └── authRoutes.js
│   ├── controllers/        # Updated for Express Request/Response
│   ├── dao/               # Unchanged - still using DAO pattern
│   ├── middleware/        # Updated for Express
│   └── utils/             # Unchanged
├── prisma/                # Database - unchanged
└── package.json           # Updated scripts
```

#### **Key Changes:**
1. **Route Files** - Separate route modules (like servlet mappings)
   - `productRoutes.js` maps `/api/products/*` to ProductController
   - `authRoutes.js` maps `/api/auth/*` to AuthController

2. **Controllers Updated** - Changed from Next.js types to Express types
   - `NextApiRequest` → `Request`
   - `NextApiResponse` → `Response`
   - Logic remains identical

3. **Middleware Updated** - AuthMiddleware now uses Express Request

4. **Server Configuration**
   - Express app with CORS enabled
   - JSON body parsing
   - Centralized error handling
   - Runs on port 3001

### 🧪 Testing Results
- ✅ Server starts successfully on port 3001
- ✅ Health check endpoint: `GET /api/health` works
- ✅ Products endpoint: `GET /api/products` returns JSON data
- ✅ Database queries executing correctly (4 products returned)
- ✅ Prisma ORM working with Express
- ✅ CORS configured for frontend integration

### 📚 Key Learning Outcomes
- **Express.js routing**: How routes map to controllers (servlet pattern)
- **Middleware pipeline**: Request processing flow in Express
- **TypeScript with Express**: Type-safe Express development
- **Migration strategy**: Moving from one framework to another
- **Debugging**: Identifying and resolving port binding issues

### 🔗 Status
- **Backend**: ✅ Fully working on Express
- **Database**: ✅ SQLite with 4 seeded products
- **API**: ✅ All endpoints functional
- **Next Step**: Connect frontend to backend API

---

## 🎯 Next Phase: Frontend-Backend Integration (Days 18-19)

### 📋 Planned Features
- [ ] Connect frontend to backend API (http://localhost:3001)
- [ ] Dynamic product loading from database
- [ ] Interactive search with API calls
- [ ] Category filtering with real data
- [ ] Shopping cart with backend sync
- [ ] User authentication flow

### 💡 Learning Goals
- Fetch API for HTTP requests
- State management with real data
- Error handling and loading states
- CORS in action
- JWT authentication flow
- Form validation with API

---

## 🤝 Working with AI Assistant

### ✅ What Works Well
- Step-by-step learning approach
- Explaining the "why" behind code decisions
- Professional commit messages
- Standard industry practices

### 📝 For Next Session
When returning, share this log and mention:
- "Continue CampusSwap project from Day 3: JavaScript phase"
- Current status: Foundation complete, ready for interactivity
- GitHub repo: https://github.com/gemechis22/campusswap-ecommerce

### 🎯 Project Goals Reminder
- **Course**: EECS 4413 portfolio project
- **Timeline**: 30 days (until Dec 3, 2025)
- **Focus**: Real-world project for resume/portfolio
- **Architecture**: MVC, DAO patterns for course requirements