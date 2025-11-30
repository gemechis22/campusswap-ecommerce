# CampusSwap - Testing Guide

## Quick Start Testing Checklist

### Prerequisites
- Both frontend and backend servers running
- Database initialized with migrations
- At least one admin user created

---

## 🧪 Step-by-Step Testing

### 1. Create Admin User (First Time Setup)

**Option A: Database Direct Insert**
```bash
cd campusswap-backend
npx prisma studio
```
- Open Users table
- Find your user account
- Set `isAdmin` field to `true`

**Option B: SQL Command**
```bash
cd campusswap-backend
sqlite3 prisma/dev.db
```
```sql
UPDATE User SET isAdmin = 1 WHERE email = 'your-email@yorku.ca';
.quit
```

---

### 2. Authentication Tests

#### Register New User
1. Click "Login" button in header
2. Click "Don't have an account? Register"
3. Fill form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@yorku.ca`
   - Password: `password123`
4. Click "Register"
5. ✅ Should redirect to home page logged in

#### Login
1. Logout if logged in
2. Click "Login" button
3. Enter credentials:
   - Email: `testuser@yorku.ca`
   - Password: `password123`
4. Click "Login"
5. ✅ Should see welcome message with name

#### Auto-Login Test
1. Login to account
2. Refresh page (F5)
3. ✅ Should remain logged in

---

### 3. Product Browsing Tests

#### View All Products
1. Navigate to home page
2. ✅ Should see grid of products with images
3. ✅ Each product shows: title, price, category, seller

#### Search Products
1. Enter "textbook" in search bar
2. ✅ Results should filter to matching products
3. Clear search
4. ✅ All products return

#### Filter by Category
1. Click "Textbooks" button
2. ✅ Only textbook products show
3. Click "All" button
4. ✅ All products return

#### Sort Products
1. Click "Sort by" dropdown
2. Select "Price: Low to High"
3. ✅ Products should reorder by ascending price
4. Select "Price: High to Low"
5. ✅ Products should reorder by descending price

---

### 4. Shopping Cart Tests

#### Add to Cart
1. Ensure logged in (cart requires auth)
2. Click "Add to Cart" on any product
3. ✅ Cart badge should increment (1)
4. ✅ Success notification appears
5. Add another product
6. ✅ Cart badge shows (2)

#### View Cart
1. Click cart icon in header
2. ✅ Modal opens showing cart items
3. ✅ Each item shows: image, title, price, quantity

#### Update Quantity
1. Open cart modal
2. Click "+" button on item
3. ✅ Quantity increases
4. ✅ Total price updates
5. Click "-" button
6. ✅ Quantity decreases
7. ✅ Total price updates

#### Remove Item
1. Open cart modal
2. Click "Remove" button on item
3. ✅ Item disappears from cart
4. ✅ Cart badge decrements
5. ✅ Total updates

#### Cart Persistence
1. Add items to cart
2. Logout
3. Login again
4. Open cart
5. ✅ Same items still in cart

---

### 5. Checkout & Payment Tests

#### Start Checkout
1. Add items to cart (min 1 item)
2. Click "Checkout" button in cart
3. ✅ Payment modal opens
4. ✅ Total amount displayed

#### Test Card Validation (Luhn Algorithm)

**Valid Test Cards**:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4532015112830366 | 123 | 12/26 |
| Mastercard | 5425233430109903 | 456 | 06/27 |
| Amex | 374245455400126 | 7890 | 03/28 |
| Discover | 6011000991300009 | 321 | 09/25 |

**Test Valid Card**:
1. Enter card number: `4532015112830366`
2. ✅ Card type shows "Visa"
3. Enter CVV: `123`
4. Enter expiration: `12/26`
5. Enter name: `Test User`
6. Click "Complete Payment"
7. ✅ Success message appears
8. ✅ Cart clears
9. ✅ Redirects to home

**Test Invalid Card (Luhn Fails)**:
1. Enter card number: `1234567812345678`
2. Click "Complete Payment"
3. ✅ Error: "Invalid card number"
4. ✅ Payment does not process

**Test Invalid CVV**:
1. Enter valid card: `4532015112830366`
2. Enter CVV: `12` (too short)
3. Click "Complete Payment"
4. ✅ Error: "Invalid CVV"

**Test Expired Card**:
1. Enter valid card: `4532015112830366`
2. Enter expiration: `01/20` (past date)
3. Click "Complete Payment"
4. ✅ Error: "Card has expired"

---

### 6. Admin Dashboard Tests

#### Access Dashboard (Admin Only)
1. Login with admin account
2. ✅ "Admin Dashboard" button visible in header
3. Click "Admin Dashboard"
4. ✅ Dashboard modal opens with 4 tabs

#### Overview Tab
1. Navigate to "Overview" tab (default)
2. ✅ Stats cards show:
   - Total Users (number)
   - Total Products (number)
   - Total Orders (number)
   - Total Revenue ($X.XX)
3. ✅ Bar chart displays (Users, Products, Orders)
4. ✅ Chart has animations

#### Sales Report Tab
1. Click "Sales Reports" tab
2. Set date range:
   - Start: 1 month ago
   - End: Today
3. Click "Generate Report"
4. ✅ Sales table appears with orders
5. ✅ Dual-axis line chart shows:
   - Revenue line (left axis, $)
   - Order count line (right axis, #)
6. ✅ Summary stats display below chart

#### Inventory Tab
1. Click "Inventory" tab
2. ✅ Table shows all products with:
   - Title, Category, Price, Quantity, Status
3. Find product with quantity > 0
4. Change quantity value
5. Click "Update" button
6. ✅ Success notification
7. Refresh page
8. ✅ New quantity persisted

#### Users Tab
1. Click "Users" tab
2. ✅ Table shows all users with:
   - Name, Email, Orders, Revenue, Admin Status
3. Find non-admin user
4. Toggle "Admin" switch
5. ✅ Success notification
6. Refresh page
7. ✅ Admin status changed

---

### 7. Image Upload Tests

#### Upload Product Image
1. Login as admin
2. Navigate to create product form
3. Click "Choose File" or drag image
4. ✅ Image preview appears
5. ✅ File name displayed

#### Validate File Type
1. Try uploading `.txt` file
2. ✅ Error: "Only images allowed"

#### Validate File Size
1. Try uploading image > 5MB
2. ✅ Error: "File too large"

#### Clear Image
1. Upload valid image
2. Click "Remove" button
3. ✅ Preview clears
4. ✅ Returns to placeholder

---

### 8. Mobile Responsiveness Tests

#### Test on Mobile Viewport
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. ✅ Navigation collapses to hamburger menu
5. ✅ Product grid adjusts to 1-2 columns
6. ✅ Cart modal fits screen
7. ✅ Forms remain usable
8. ✅ Admin dashboard scrolls horizontally if needed

---

### 9. Error Handling Tests

#### API Error Simulation
1. Stop backend server
2. Try adding product to cart
3. ✅ Error notification: "Network error"
4. Restart backend
5. Try again
6. ✅ Works normally

#### Invalid Token
1. Login normally
2. Open DevTools → Application → Local Storage
3. Modify `token` value to invalid string
4. Refresh page
5. ✅ Auto-logout occurs
6. ✅ Redirects to home page

---

## 🐛 Common Issues & Fixes

### Issue: "Cart badge not updating"
**Fix**: Check browser console for errors. Ensure backend running on port 3001.

### Issue: "Admin dashboard not appearing"
**Fix**: Verify user has `isAdmin = true` in database.

### Issue: "Images not loading"
**Fix**: Ensure `/uploads` folder exists and backend serves static files.

### Issue: "Payment always fails"
**Fix**: Use test card numbers provided. Check Luhn algorithm implementation.

### Issue: "Chart not rendering"
**Fix**: Verify Chart.js CDN loaded in `index.html`. Check console for errors.

---

## ✅ Final Checklist

Before submitting project:

- [ ] All authentication tests pass
- [ ] Product browsing works (search, filter, sort)
- [ ] Cart operations function correctly
- [ ] Payment validation working (Luhn algorithm)
- [ ] Admin dashboard fully functional
- [ ] Charts render properly
- [ ] Image upload working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Documentation complete

---

## 📊 Test Coverage Summary

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 3 tests | ✅ |
| Product Browsing | 4 tests | ✅ |
| Shopping Cart | 5 tests | ✅ |
| Checkout & Payment | 4 tests | ✅ |
| Admin Dashboard | 4 tests | ✅ |
| Image Upload | 3 tests | ✅ |
| Responsive Design | 1 test | ✅ |
| Error Handling | 2 tests | ✅ |

**Total Tests**: 26
**Expected Pass Rate**: 100%

---

**Last Updated**: November 28, 2025
**Tested By**: Development Team
**Browser Compatibility**: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
