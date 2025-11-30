# 🧪 CampusSwap - Complete Testing Guide

## 📋 Pre-Testing Setup

### 1. Start Both Servers

**Backend Server:**
```powershell
cd "c:\Users\Owner\OneDrive - York University\My_CS\Fall2025\EECS4413\Project\campusswap-backend"
npm run dev
```
✅ Should see: `Server running on port 3001`

**Frontend Server:**
```powershell
cd "c:\Users\Owner\OneDrive - York University\My_CS\Fall2025\EECS4413\Project\campusswap"
npm run dev
```
✅ Should open: `http://localhost:5500`

### 2. Create Admin User in Database

**Option A: Using Prisma Studio (Recommended)**
```powershell
cd campusswap-backend
npx prisma studio
```
Then:
1. Click on "User" table
2. Click "Add record"
3. Fill in:
   - `email`: admin@yorku.ca
   - `password`: (copy hash below)
   - `firstName`: Admin
   - `lastName`: User
   - `isAdmin`: ✅ true
4. Click "Save 1 change"

**Password Hash for "admin123":**
```
$2a$10$YourBcryptHashHere
```

**Option B: Using SQL Command**
```powershell
cd campusswap-backend
npx prisma db execute --stdin
```
Then paste:
```sql
INSERT INTO User (id, email, password, firstName, lastName, isAdmin, createdAt, updatedAt)
VALUES (
  'admin-001',
  'admin@yorku.ca',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzKKPGDRFxHZvPEMLm0JW6HjZwKCm',
  'Admin',
  'User',
  1,
  datetime('now'),
  datetime('now')
);
```

### 3. Test Accounts

**Admin Account:**
- Email: `admin@yorku.ca`
- Password: `admin123`

**Regular User (Create during testing):**
- Email: `student@yorku.ca`
- Password: `student123`

### 4. Test Credit Cards (Luhn Algorithm Valid)

| Card Type | Number | CVV | Expiration |
|-----------|--------|-----|------------|
| Visa | 4532015112830366 | 123 | 12/26 |
| Mastercard | 5425233430109903 | 456 | 01/27 |
| Amex | 374245455400126 | 7890 | 06/28 |
| Discover | 6011000991300009 | 789 | 09/26 |

---

## 🧪 Testing Procedure (Follow This Order)

## PHASE 1: Authentication & User Management

### Test 1: User Registration ✅
**Steps:**
1. Open `http://localhost:5500`
2. Click "Login/Register" button (top right)
3. Click "Register" tab
4. Fill form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `student@yorku.ca`
   - Password: `student123`
5. Click "Register"

**Expected Results:**
- ✅ Success notification appears
- ✅ Modal closes automatically
- ✅ Redirected to homepage as logged-in user
- ✅ Top right shows "Hi, John" (not Login/Register)
- ✅ Cart icon appears with (0) badge

**What to Check:**
- Form validation (empty fields show errors)
- Email format validation
- Password minimum length (8 characters)
- No duplicate email registration

---

### Test 2: User Login ✅
**Steps:**
1. If logged in, click "Logout" first
2. Click "Login/Register" button
3. Enter credentials:
   - Email: `student@yorku.ca`
   - Password: `student123`
4. Click "Login"

**Expected Results:**
- ✅ Success notification: "Login successful!"
- ✅ Modal closes
- ✅ Top right shows "Hi, John"
- ✅ Cart loads previous items (if any)

**What to Check:**
- Invalid email shows error
- Wrong password shows error
- Remember previous cart items

---

### Test 3: Auto-Login on Refresh ✅
**Steps:**
1. While logged in, press `F5` (refresh page)
2. Wait for page to reload

**Expected Results:**
- ✅ Still logged in (no redirect to login)
- ✅ User name still shows top right
- ✅ Cart items preserved

**What to Check:**
- JWT token persists in localStorage
- User state restored from token

---

### Test 4: Logout ✅
**Steps:**
1. Click username dropdown (top right)
2. Click "Logout"

**Expected Results:**
- ✅ Notification: "Logged out successfully"
- ✅ Redirected to homepage
- ✅ Top right shows "Login/Register" again
- ✅ Cart icon disappears
- ✅ Admin Dashboard link removed (if was admin)

---

## PHASE 2: Product Browsing & Search

### Test 5: View All Products ✅
**Steps:**
1. Open homepage `http://localhost:5500`
2. Scroll through product grid

**Expected Results:**
- ✅ Products displayed in grid (3 columns on desktop)
- ✅ Each card shows:
  - Product image (or placeholder)
  - Title
  - Price (formatted as $XX.XX)
  - Category badge with emoji
  - Seller name
  - "Add to Cart" button
- ✅ Responsive: 1 column on mobile, 2 on tablet

**What to Check:**
- Images load correctly
- Prices formatted properly
- Categories display with correct emojis

---

### Test 6: Search Products ✅
**Steps:**
1. In search bar (top center), type "calculus"
2. Wait for results to update

**Expected Results:**
- ✅ Only products with "calculus" in title/description show
- ✅ Search is case-insensitive
- ✅ Results update in real-time
- ✅ Shows "No products found" if no matches

**Test Variations:**
- Search: "laptop" (should find electronics)
- Search: "book" (should find textbooks)
- Search: "xyz123" (should show no results)

---

### Test 7: Filter by Category ✅
**Steps:**
1. Click "Category" dropdown
2. Select "Textbooks"

**Expected Results:**
- ✅ Only textbook products displayed
- ✅ Category dropdown shows "Textbooks"
- ✅ Can combine with search

**Test All Categories:**
- All Categories (shows everything)
- Textbooks 📚
- Electronics 💻
- Lab Equipment 🔬
- Stationery ✏️

---

### Test 8: Sort Products ✅
**Steps:**
1. Click "Sort By" dropdown
2. Select "Price: Low to High"

**Expected Results:**
- ✅ Products reorder by price ascending
- ✅ Cheapest items appear first

**Test All Options:**
- Price: Low to High
- Price: High to Low
- Newest First
- Oldest First

---

### Test 9: Combined Filters ✅
**Steps:**
1. Select Category: "Electronics"
2. Enter Search: "laptop"
3. Sort By: "Price: Low to High"

**Expected Results:**
- ✅ Shows only laptops (electronics category)
- ✅ Sorted by price ascending
- ✅ All filters work together

---

## PHASE 3: Shopping Cart Operations

### Test 10: Add to Cart (Not Logged In) ✅
**Steps:**
1. Ensure logged out
2. Click "Add to Cart" on any product

**Expected Results:**
- ✅ Notification: "Please login to add items to cart"
- ✅ Login modal opens automatically

---

### Test 11: Add to Cart (Logged In) ✅
**Steps:**
1. Login as `student@yorku.ca`
2. Find a product (e.g., "Introduction to Algorithms")
3. Click "Add to Cart"

**Expected Results:**
- ✅ Success notification: "Added to cart!"
- ✅ Cart badge updates: 🛒 (1)
- ✅ Button changes to "Added ✓" temporarily (2 seconds)
- ✅ Button returns to "Add to Cart"

---

### Test 12: View Cart ✅
**Steps:**
1. Click cart icon 🛒 (top right)
2. Cart modal opens

**Expected Results:**
- ✅ Modal shows "Shopping Cart" title
- ✅ Lists all cart items with:
  - Product image
  - Title
  - Price per unit
  - Quantity controls (- / + buttons)
  - Subtotal (price × quantity)
  - Remove button (🗑️)
- ✅ Shows cart total at bottom
- ✅ "Proceed to Checkout" button visible

---

### Test 13: Update Cart Quantity ✅
**Steps:**
1. Open cart modal
2. Click + button to increase quantity
3. Click - button to decrease quantity

**Expected Results:**
- ✅ Quantity updates immediately
- ✅ Subtotal recalculates
- ✅ Total updates
- ✅ Cart badge updates: 🛒 (new count)
- ✅ Cannot decrease below 1
- ✅ Cannot exceed available stock

---

### Test 14: Remove from Cart ✅
**Steps:**
1. Open cart modal
2. Click 🗑️ (trash icon) on an item
3. Confirm if prompted

**Expected Results:**
- ✅ Item disappears from cart
- ✅ Total recalculates
- ✅ Cart badge updates
- ✅ If cart empty: "Your cart is empty" message

---

### Test 15: Cart Persistence ✅
**Steps:**
1. Add 2-3 items to cart
2. Close browser completely
3. Reopen `http://localhost:5500`
4. Login with same account
5. Check cart

**Expected Results:**
- ✅ All cart items preserved
- ✅ Quantities correct
- ✅ Cart badge shows correct count

---

## PHASE 4: Checkout & Payment

### Test 16: Checkout Process ✅
**Steps:**
1. Add items to cart (total > $0)
2. Open cart modal
3. Click "Proceed to Checkout"

**Expected Results:**
- ✅ Payment modal opens
- ✅ Shows order summary:
  - List of items
  - Individual prices
  - Total amount
- ✅ Payment form displayed with fields:
  - Card Number
  - Cardholder Name
  - Expiration Date (MM/YY)
  - CVV
- ✅ Test cards info box visible

---

### Test 17: Card Type Detection ✅
**Steps:**
1. In payment modal, start typing card number:
   - Type: `4532` (Visa)
   - Clear and type: `5425` (Mastercard)
   - Clear and type: `3742` (Amex)

**Expected Results:**
- ✅ Card type indicator appears near card number
- ✅ Shows "Visa" for 4xxx numbers
- ✅ Shows "Mastercard" for 5xxx numbers
- ✅ Shows "Amex" for 34xx/37xx numbers
- ✅ Shows "Discover" for 6011 numbers

---

### Test 18: Luhn Algorithm Validation ✅
**Steps:**
1. Enter VALID card: `4532015112830366`
2. Fill other fields:
   - Name: `John Doe`
   - Expiration: `12/26`
   - CVV: `123`
3. Click "Complete Purchase"

**Expected Results:**
- ✅ Payment processes successfully
- ✅ Success notification: "Order placed successfully!"
- ✅ Cart clears completely
- ✅ Cart badge shows (0)
- ✅ Modals close

**Now Test INVALID Card:**
4. Open checkout again
5. Enter: `4532015112830367` (wrong checksum)
6. Click "Complete Purchase"

**Expected Results:**
- ✅ Error: "Invalid card number"
- ✅ Payment does NOT process
- ✅ Cart remains unchanged

---

### Test 19: Payment Field Validation ✅
**Test Each Field:**

**Empty Fields:**
- Leave card number empty → "Please enter card number"
- Leave name empty → "Please enter cardholder name"
- Leave CVV empty → "Please enter CVV"
- Leave expiration empty → "Please enter expiration date"

**Invalid Card Number:**
- Enter: `1234567890123456` → "Invalid card number"

**Invalid CVV:**
- Enter 2 digits: `12` → "CVV must be 3-4 digits"
- Enter letters: `abc` → "CVV must be numbers only"

**Invalid Expiration:**
- Enter past date: `01/20` → "Card has expired"
- Enter invalid month: `13/26` → "Invalid expiration date"

---

### Test 20: Complete Order Flow ✅
**Full End-to-End Test:**
1. Login as `student@yorku.ca`
2. Browse products
3. Add 3 different items to cart
4. Update quantities (increase/decrease)
5. Remove 1 item
6. Proceed to checkout
7. Enter test card: `4532015112830366`
8. Complete purchase

**Expected Results:**
- ✅ Each step works smoothly
- ✅ No errors in browser console
- ✅ Order created in database
- ✅ Cart empties after purchase
- ✅ Can start new order immediately

---

## PHASE 5: Admin Dashboard

### Test 21: Admin Access Control ✅
**Steps:**
1. Login as regular user `student@yorku.ca`
2. Try to access admin dashboard (if link visible)

**Expected Results:**
- ✅ Regular users CANNOT see "Admin Dashboard" link
- ✅ If URL accessed directly: Error or redirect

**Now Test Admin:**
3. Logout
4. Login as `admin@yorku.ca` / `admin123`

**Expected Results:**
- ✅ "Admin Dashboard" link appears in navigation
- ✅ Can click and access dashboard

---

### Test 22: Admin Dashboard - Overview Tab ✅
**Steps:**
1. Login as admin
2. Click "Admin Dashboard"
3. Overview tab opens by default

**Expected Results:**
- ✅ Dashboard modal opens fullscreen
- ✅ Shows 4 stat cards:
  - 👥 Total Users (count)
  - 📦 Total Products (count)
  - 🛍️ Total Orders (count)
  - 💰 Total Revenue ($X,XXX.XX)
- ✅ Bar chart displays below stats:
  - X-axis: Users, Products, Orders
  - Y-axis: Count
  - Colored bars with animations
- ✅ Chart is responsive

---

### Test 23: Admin Dashboard - Sales Reports ✅
**Steps:**
1. In admin dashboard, click "Sales Reports" tab
2. View default date range (last 30 days)
3. Change date range:
   - Start Date: 2 weeks ago
   - End Date: Today
4. Click "Generate Report"

**Expected Results:**
- ✅ Dual-axis line chart displays:
  - Blue line: Revenue ($) - Left Y-axis
  - Green line: Order Count - Right Y-axis
  - X-axis: Dates
- ✅ Chart updates when date range changes
- ✅ Summary stats show:
  - Total Orders
  - Total Revenue
  - Average Order Value
- ✅ "Export Report" button visible
- ✅ Clicking export downloads CSV file

---

### Test 24: Admin Dashboard - Inventory Management ✅
**Steps:**
1. Click "Inventory" tab
2. View product list table

**Expected Results:**
- ✅ Table shows all products:
  - Image thumbnail
  - Title
  - Category
  - Price
  - Stock quantity
  - Status (Available/Out of Stock)
  - Update button
- ✅ Can click "Update Stock" button
- ✅ Input field appears to change quantity
- ✅ Enter new quantity and save
- ✅ Table updates immediately
- ✅ Success notification appears

**Test Stock Levels:**
- Set quantity to 0 → Status becomes "Out of Stock"
- Set quantity > 0 → Status becomes "Available"

---

### Test 25: Admin Dashboard - User Management ✅
**Steps:**
1. Click "Users" tab
2. View user list table

**Expected Results:**
- ✅ Table shows all users:
  - Name (First + Last)
  - Email
  - Role (Admin/User)
  - Registration Date
  - Action buttons
- ✅ Can toggle admin status:
  - Click "Make Admin" → User becomes admin
  - Click "Remove Admin" → User becomes regular user
- ✅ Cannot remove own admin status
- ✅ Success notification on change
- ✅ Table updates immediately

---

### Test 26: Chart.js Visualizations ✅
**Steps:**
1. Open admin dashboard (Overview tab)
2. Resize browser window
3. Switch between tabs
4. Close and reopen dashboard

**Expected Results:**
- ✅ Bar chart renders correctly
- ✅ Chart is responsive (resizes with window)
- ✅ No duplicate charts on tab switching
- ✅ Charts destroyed properly on modal close
- ✅ Tooltips appear on hover
- ✅ Legend shows correctly
- ✅ Animations play smoothly

**Sales Chart Specific:**
- ✅ Dual Y-axes visible ($ on left, count on right)
- ✅ Different colors for each line
- ✅ Data points visible
- ✅ Grid lines present

---

## PHASE 6: Image Upload (If Add Product Feature Exists)

### Test 27: Product Image Upload ✅
**Steps:**
1. As admin, navigate to "Add Product" form
2. Click image upload area or drag image

**Expected Results:**
- ✅ File selector opens
- ✅ Can select image file
- ✅ Image preview appears
- ✅ Shows file name and size
- ✅ Can clear/remove image
- ✅ Can select different image

**Test Validation:**
- Upload 10MB file → Error: "File too large (max 5MB)"
- Upload .pdf file → Error: "Only images allowed"
- Upload .jpg file → ✅ Success

---

## PHASE 7: Responsive Design & UI

### Test 28: Mobile Responsiveness ✅
**Steps:**
1. Press `F12` to open DevTools
2. Click device toolbar (phone icon)
3. Select "iPhone 12 Pro" (390px)
4. Test all pages

**Expected Results:**
- ✅ Product grid: 1 column on mobile
- ✅ Navigation collapses to hamburger menu
- ✅ Cart modal fits screen
- ✅ Forms are scrollable
- ✅ Buttons are touch-friendly (min 44px)
- ✅ Text is readable (min 16px)
- ✅ No horizontal scrolling

**Test on Different Sizes:**
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (iPad Pro)
- 1920px (Desktop)

---

### Test 29: Browser Compatibility ✅
**Test on Multiple Browsers:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (if Mac available)

**Check:**
- ES6 modules work
- Fetch API works
- CSS grid/flexbox renders
- Animations play
- Charts display

---

## PHASE 8: Error Handling & Edge Cases

### Test 30: Network Errors ✅
**Steps:**
1. Open DevTools → Network tab
2. Select "Offline" mode
3. Try to load products

**Expected Results:**
- ✅ Error notification: "Failed to load products"
- ✅ Graceful error message (not blank page)
- ✅ Can retry when online

---

### Test 31: Backend Down ✅
**Steps:**
1. Stop backend server (Ctrl+C in terminal)
2. Try to login

**Expected Results:**
- ✅ Error: "Unable to connect to server"
- ✅ Frontend doesn't crash
- ✅ Can retry after server restarts

---

### Test 32: Invalid Token ✅
**Steps:**
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Modify `campusswap_token` value to garbage
4. Refresh page

**Expected Results:**
- ✅ Automatically logged out
- ✅ Redirected to homepage
- ✅ No errors in console

---

### Test 33: SQL Injection Prevention ✅
**Steps:**
1. In search bar, enter: `'; DROP TABLE Product; --`
2. In login email, enter: `admin@yorku.ca' OR '1'='1`

**Expected Results:**
- ✅ No SQL injection occurs
- ✅ Prisma ORM prevents attacks
- ✅ Search returns 0 results (no match)
- ✅ Login fails (invalid credentials)

---

### Test 34: XSS Prevention ✅
**Steps:**
1. Register user with name: `<script>alert('XSS')</script>`
2. Check if alert fires

**Expected Results:**
- ✅ No alert fires
- ✅ Script tags rendered as text (escaped)
- ✅ No JavaScript execution from user input

---

## PHASE 9: Performance Testing

### Test 35: Page Load Speed ✅
**Steps:**
1. Open DevTools → Network tab
2. Hard refresh (Ctrl+Shift+R)
3. Check "Load" time at bottom

**Expected Results:**
- ✅ Page loads in < 3 seconds
- ✅ Images lazy-load if possible
- ✅ No excessive API calls
- ✅ CSS/JS files cached

---

### Test 36: Cart Performance ✅
**Steps:**
1. Add 20+ items to cart
2. Open cart modal
3. Update quantities rapidly

**Expected Results:**
- ✅ No lag or freezing
- ✅ Updates happen smoothly
- ✅ Total calculates correctly
- ✅ No duplicate API calls

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot find module 'multer'"
**Fix:**
```powershell
cd campusswap-backend
npm install multer --save
npm install @types/multer --save-dev
```

### Issue 2: CORS Errors
**Check:** `campusswap-backend/server.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));
```

### Issue 3: Chart.js Not Loading
**Check:** `campusswap/index.html` has CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script>
```

### Issue 4: Images Not Uploading
**Check:**
1. `uploads/products/` folder exists
2. Server has write permissions
3. File size < 5MB
4. File is valid image type

### Issue 5: Admin Dashboard Not Showing
**Check:**
1. User has `isAdmin: true` in database
2. JWT token is valid
3. Backend endpoint `/api/admin/*` accessible

---

## ✅ Testing Completion Checklist

### Core Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Auto-login on refresh works
- [ ] Logout works
- [ ] Products display correctly
- [ ] Search works
- [ ] Category filter works
- [ ] Sort works
- [ ] Add to cart works
- [ ] Update cart quantity works
- [ ] Remove from cart works
- [ ] Cart persists after logout
- [ ] Checkout process works
- [ ] Luhn validation works
- [ ] Payment succeeds with valid card
- [ ] Payment fails with invalid card

### Admin Features
- [ ] Admin dashboard accessible (admin only)
- [ ] Overview tab shows stats
- [ ] Bar chart renders
- [ ] Sales reports tab works
- [ ] Date filtering works
- [ ] Dual-axis line chart renders
- [ ] Export report downloads CSV
- [ ] Inventory tab shows products
- [ ] Stock updates work
- [ ] Users tab shows all users
- [ ] Admin toggle works

### UI/UX
- [ ] Responsive on mobile (< 768px)
- [ ] Works on tablets (768-1024px)
- [ ] Works on desktop (> 1024px)
- [ ] All buttons clickable
- [ ] Modals open/close properly
- [ ] Animations smooth
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success notifications work

### Security
- [ ] Cannot access admin without proper role
- [ ] Cannot modify others' data
- [ ] Passwords hashed in database
- [ ] JWT tokens expire properly
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] File upload validates types
- [ ] File upload validates size

### Performance
- [ ] Page loads quickly (< 3s)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Charts render smoothly
- [ ] Cart updates quickly
- [ ] API calls efficient

---

## 📝 Test Results Template

Copy this to track your testing:

```
## Test Session: [Date]
Browser: [Chrome/Firefox/Edge/Safari]
Device: [Desktop/Mobile/Tablet]

### PASSED ✅
- Test 1: User Registration
- Test 2: User Login
- [Add passed tests here]

### FAILED ❌
- Test X: [Description]
  - Error: [What went wrong]
  - Screenshot: [Path to screenshot]
  - Fix Applied: [What you did to fix]

### NOTES
- [Any observations]
- [Performance issues]
- [Suggestions for improvement]
```

---

## 🚀 Ready for Submission

After all tests pass:
1. ✅ Take screenshots of key features
2. ✅ Record short demo video (2-3 minutes)
3. ✅ Update README.md with test results
4. ✅ Commit all changes to Git
5. ✅ Create final deployment
6. ✅ Prepare presentation slides
7. ✅ Write final documentation

---

**Good luck with testing! 🎉**
