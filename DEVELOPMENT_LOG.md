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


Continue CampusSwap project from Day 3: JavaScript phase with full-stack integration.

**Current Status:**
- ✅ Express.js backend (port 3001) with Prisma ORM + SQLite
- ✅ Frontend-backend integration complete
- ✅ Authentication system working (Register/Login/Logout with JWT)
- ✅ Product browsing with search & category filters
- ✅ Shopping cart functionality
- ✅ Authenticated product posting (Sell Item)
- ✅ Fixed JWT token storage bug (data.data.token path)

**Project Structure:**
- Frontend: `campusswap/` (HTML/CSS/Vanilla JS, Live Server on port 5500)
- Backend: `campusswap-backend/` (Express + TypeScript + Prisma)
- Database: SQLite with seeded products and categories
- Auth: JWT stored in localStorage under 'campusswap_token'

**What Works:**
- Users can register/login with @yorku.ca emails
- Token automatically added to API requests via apiFetch() helper
- Category filtering loads from /api/products and maps slug→ID
- Sell Item modal posts to /api/products with proper authentication
- Cart stored in localStorage

**Teaching Style:**
Please continue with teaching comments explaining what/where/why for learning purposes. We'll remove TEACHING comments before final GitHub push.

**GitHub Repo:** https://github.com/gemechis22/campusswap-ecommerce

**Next Steps to Consider:**
- Display user name in navbar after login
- "My Listings" page for user's posted products
- Edit/delete own products
- Or: Clean up TEACHING comments for production

Ready to continue!

---

## 📅 November 27, 2025 - Day 20: User Profile & Product Management Features

### 🎯 What We Built
- **User Name Display in Navbar** - Personalized welcome message after login
- **My Listings Page** - Users can view all their posted products
- **Edit Product Feature** - Update product details (title, price, description, etc.)
- **Delete Product Feature** - Remove products with confirmation dialog
- **Backend Endpoints** - New `/api/products/my-listings` endpoint

### 🛠️ Technologies Used
- **Frontend**: Vanilla JavaScript with async/await for API calls
- **Backend**: Express.js controllers and routes
- **Database**: Prisma ORM with new DAO methods
- **Authentication**: JWT token verification for protected routes

### 🏗️ Architecture Enhancements

#### 1. **User Profile Integration**
   - Frontend now calls `/api/auth/me` on page load to fetch user data
   - Stores user info in `CampusSwap.state.user` for UI personalization
   - Navbar dynamically updates to show:
     - `Welcome, [First Name]!` message
     - "My Listings" button
     - "Sell Item" button
     - "Logout" button

#### 2. **My Listings Feature**
   - **Backend**: Added `ProductDAO.findBySellerId()` method
     - Fetches all products for a specific user (all statuses)
     - Ordered by creation date (newest first)
   - **Backend**: Added `ProductController.getMyListings()` controller method
     - Requires JWT authentication
     - Returns only current user's products
   - **Backend**: Added `/api/products/my-listings` route
     - Placed BEFORE `/:id` route to avoid routing conflicts
   - **Frontend**: `CampusSwap.showMyListings()` function
     - Displays modal with user's products
     - Shows product cards with Edit/Delete buttons
     - Empty state for users with no listings

#### 3. **Edit Product Feature**
   - **Frontend**: `CampusSwap.editProduct(productId)` function
     - Fetches product details from `/api/products/:id`
     - Pre-fills form with existing data
     - Sends PUT request to `/api/products/:id` with updates
   - **Backend**: Uses existing `ProductController.updateProduct()` method
     - Verifies user owns the product before allowing edits
     - Validates price and required fields
     - Returns 403 if user tries to edit someone else's product

#### 4. **Delete Product Feature**
   - **Frontend**: `CampusSwap.deleteProduct(productId)` function
     - Shows confirmation dialog (prevents accidental deletions)
     - Sends DELETE request to `/api/products/:id`
     - Refreshes product list and My Listings after deletion
   - **Backend**: Uses existing `ProductController.deleteProduct()` method
     - Soft delete: marks product as 'WITHDRAWN' (doesn't remove from database)
     - Preserves data for audit trail and order history
     - Prevents deletion of products in active orders

#### 5. **DAO Pattern Enhancement**
   - Added `ProductDAO.findBySellerId()` method
   - Added `ProductDAO.delete()` method for hard deletes (not currently used)
   - Maintained separation between data access and business logic

### 🧪 Testing Results
- ✅ User name displays correctly in navbar after login
- ✅ My Listings modal loads user's products via API
- ✅ Edit modal pre-fills with product data
- ✅ Edit form updates product successfully
- ✅ Delete confirmation prevents accidental deletions
- ✅ Delete marks product as WITHDRAWN (soft delete)
- ✅ Product list and My Listings refresh after edits/deletes
- ✅ JWT authentication protects all new endpoints
- ✅ Users cannot edit/delete other users' products (403 error)

### 📚 Key Learning Outcomes
- **State Management**: Storing user data in application state
- **Protected Routes**: Implementing authentication checks on endpoints
- **CRUD Operations**: Complete Create, Read, Update, Delete cycle
- **Soft vs Hard Delete**: Why we mark records as deleted instead of removing them
- **User Experience**: Confirmation dialogs for destructive actions
- **Route Ordering**: Why `/my-listings` must come before `/:id` in Express
- **Form Pre-filling**: Fetching data and populating form fields
- **Error Handling**: Proper 401, 403, 404 responses with meaningful messages

### 🎨 UI/UX Improvements
- **Personalization**: User sees their name in navbar (feels welcoming)
- **Empty States**: Clear messaging when user has no listings yet
- **Confirmation Dialogs**: Prevents accidental product deletion
- **Loading States**: Async operations with proper error handling
- **Responsive Modals**: My Listings and Edit modals work on all screen sizes

### 🔒 Security Features
- **Authentication Required**: All product management endpoints require JWT
- **Ownership Verification**: Users can only edit/delete their own products
- **Input Validation**: Price must be > 0, required fields checked
- **Soft Delete**: Preserves data integrity and audit trail

### 📁 Files Modified

**Frontend:**
- `src/js/main.js`:
  - Updated `setupAuthUI()` to fetch and display user name
  - Added `showMyListings()` function
  - Added `generateMyListingsHTML()` function
  - Implemented `editProduct()` with pre-filled form
  - Implemented `deleteProduct()` with confirmation
- `src/styles/main.css`:
  - Added `.user-welcome` styles for navbar greeting
  - Added `.my-listings-container` styles
  - Added `.my-listing-card` styles
  - Added `.empty-state` styles
  - Added `.btn-danger` styles for delete button

**Backend:**
- `src/dao/ProductDAO.ts`:
  - Added `findBySellerId()` method
  - Added `delete()` method (hard delete for future use)
- `src/controllers/ProductController.ts`:
  - Added `getMyListings()` controller method
- `src/routes/productRoutes.js`:
  - Added `GET /api/products/my-listings` route

### 🔗 GitHub Repository
- **Status**: Day 20 features complete
- **Branch**: Will commit to `main` branch
- **Commit Message**: "feat: Add user profile display, My Listings page, and product edit/delete functionality"

---

## 🎯 Next Phase: Polish & Production Readiness (Days 21-23)

### 📋 Potential Next Features
- [ ] Remove TEACHING comments for cleaner production code
- [ ] Add product image uploads (real images, not just emojis)
- [ ] Implement product reviews and ratings
- [ ] Add messaging between buyers and sellers
- [ ] Order management system (checkout flow)
- [ ] Email notifications for new messages/orders
- [ ] Advanced search with multiple filters
- [ ] User profile page with stats and reviews
- [ ] Admin dashboard for platform management

### 💡 Learning Goals Remaining
- File uploads with multer
- Real-time features with WebSockets
- Email service integration
- Advanced Prisma queries
- Production deployment (Vercel, Railway, etc.)
- Environment variables and secrets management

---

## 🤝 Working with AI Assistant

### ✅ What Works Well
- Step-by-step feature implementation
- Teaching comments for learning
- Professional architecture patterns
- Complete CRUD cycle with security

### 📝 For Next Session
When returning, share this log and mention:
- "Continue CampusSwap project from Day 20"
- Current status: Full CRUD with user management complete
- GitHub repo: https://github.com/gemechis22/campusswap-ecommerce

### 🎯 Project Goals Reminder
- **Course**: EECS 4413 portfolio project
- **Timeline**: 30 days (until Dec 3, 2025)
- **Focus**: Real-world project for resume/portfolio
- **Architecture**: MVC, DAO patterns for course requirements