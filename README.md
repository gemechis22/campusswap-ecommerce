# CampusSwap - Student Marketplace

> A modern e-commerce platform for university students to buy and sell academic essentials within their campus community.

## 🎓 Project Overview

**Course**: EECS 4413 - Building E-Commerce Systems  
**Institution**: York University  
**Timeline**: 30 days (Nov 8 - Dec 3, 2025)  
**Team Size**: 2 members  

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript → React → Next.js 14
- **Backend**: Next.js API Routes (MVC Architecture)
- **Database**: PostgreSQL with Prisma ORM (DAO Pattern)
- **Authentication**: Custom auth with @yorku.ca email restriction
- **Storage**: Supabase for file uploads
- **Deployment**: Vercel + Supabase

## 🚀 Features

### For Students (Customers)
- [x] Browse marketplace listings
- [ ] Search and filter by category, price, condition
- [ ] Create and manage listings
- [ ] Shopping cart functionality
- [ ] User profiles and transaction history
- [ ] Direct messaging with sellers

### For Admins
- [ ] Listing moderation
- [ ] User management
- [ ] Sales analytics
- [ ] Inventory oversight

## 📁 Project Structure

```
campusswap/
├── index.html              # Main homepage
├── src/                    # Source files
│   ├── styles/            # CSS stylesheets
│   │   └── main.css       # Main stylesheet
│   └── js/                # JavaScript files
├── public/                # Static assets (images, icons)
├── docs/                  # Documentation
└── tests/                 # Testing files
```

## 🔄 Development Progress & Roadmap

### ✅ Completed
- **Day 1-2 (Foundation)**
  - Responsive static homepage (HTML/CSS)
  - Grid/Flexbox layout system
  - Design system (CSS custom properties)
  - York University branding applied
- **Day 15-16 (Backend Architecture)**
  - Separate backend (`backend` branch) with Next.js + TypeScript
  - Prisma schema (Users, Products, Categories, Orders, OrderItems, CartItems, Reviews, Messages)
  - MVC + DAO patterns implemented (ProductController, ProductDAO, UserDAO)
  - Products API: list, create (filters: category, condition, search)
  - Database migration & seed script executed successfully

### 🟡 In Progress / Upcoming (High Priority)
1. User Authentication (register/login/logout + profile retrieval)
2. Product detail endpoint (`/api/products/[id]`) & dynamic frontend rendering
3. Product sorting (price asc/desc, name A–Z/Z–A)
4. Shopping cart API (add/update/remove; real-time totals)
5. Checkout + dummy payment logic (order creation + inventory decrement)
6. Inventory validation (reject over-quantity operations)

### 🔴 Required Features Still Missing (Spec Alignment)
- Admin endpoints: sales history, inventory adjustments, user management
- Purchase history (customer + admin views)
- Profile update (billing/shipping info)
- Inventory quantity field (to be added to Product model)

### 🔵 Optional / Bonus (After Core Completion)
- Reviews & ratings API
- Email confirmations post-checkout
- Featured / low-inventory product flags
- Additional patterns (Factory / Singleton / Observer)
- Analytics dashboard (charts for sales)
- Docker / Cloud deployment (Vercel + managed DB)

### 📅 Suggested Timeline (Remaining ~11 Days)
| Days | Focus |
|------|-------|
| 17-19 | Auth + Product detail + Sorting |
| 20-22 | Cart + Checkout + Inventory logic |
| 23-25 | Admin endpoints + Purchase history |
| 26-27 | Deployment (Docker/Cloud) + Report + Testing |

### 🧪 Testing Plan (To Add)
- Unit-level: DAO methods (Prisma queries)
- Integration: API routes via `curl`/Postman
- Frontend: Fetch + render products, cart state updates

### 📘 Design Report Checklist (Draft Soon)
- Architecture diagrams (MVC, data model ERD)
- Technology rationale (Next.js + Prisma + TypeScript)
- Pattern usage (DAO, MVC, future patterns)
- Database schema evolution (migrations)
- Feature matrix vs spec (compliance tracking)
- Team member contributions
- Deployment strategy & challenges

---

## 📚 Learning Objectives

This project teaches:
- **Frontend**: Modern HTML5 semantics, CSS Grid/Flexbox, ES6+ JavaScript, React hooks
- **Backend**: RESTful API design, MVC architecture, DAO pattern
- **Database**: Schema design, ORM usage, data relationships
- **DevOps**: Git workflow, testing, deployment

---

**Current Phase**: Transition from backend architecture to feature integration  
**Immediate Next Step**: Implement user auth endpoints & product detail route

---

### ⚙️ Environment Branches
- `main`: Frontend (static + upcoming integration)
- `backend`: Server/API implementation (to be merged after core features)

### 🌐 API Base (Local Dev)
`http://localhost:3000/api/products`

Planned additions:
`/api/auth/register` • `/api/auth/login` • `/api/auth/logout`  
`/api/products/[id]` • `/api/cart` • `/api/orders` • `/api/admin/*`

---

Built with ❤️ for learning and portfolio development.