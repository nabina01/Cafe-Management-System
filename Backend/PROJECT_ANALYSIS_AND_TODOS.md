# Cafe Management System - Backend Analysis & TODO List

---

## 🚀 Required Features & APIs to Implement

### **1. Payment Management** 
**Model exists but no implementation**

#### API Endpoints:

**`POST /api/payments`** - Create Payment
```
Description: Process payment for order or reservation
Body: {
  amount: Float,
  method: "CASH" | "ESEWA" | "KHALTI",
  type: "RESERVATION" | "INDIVIDUAL",
  reservationId?: Int,
  transactionId?: String
}
Response: Created payment details
```

**`GET /api/payments`** - Get All Payments
```
Description: Get all payments with optional filters (status, method, type)
Query Params: ?status=COMPLETED&method=ESEWA
Response: Array of payments
```

**`GET /api/payments/:id`** - Get Payment by ID
```
Description: Get specific payment details
Response: Payment object
```

**`PUT /api/payments/:id`** - Update Payment Status
```
Description: Update payment status (complete, fail, refund)
Body: { status: "COMPLETED" | "FAILED" | "REFUNDED" }
Response: Updated payment
```

**`GET /api/payments/reservation/:reservationId`** - Get Payment by Reservation
```
Description: Get payment associated with a reservation
Response: Payment object or null
```

---

### **2. Authentication & Authorization Improvements**

#### API Endpoints:

**`GET /api/users/me`** - Get Current User Profile
```
Description: Get logged-in user's profile using JWT token
Headers: Authorization: Bearer <token>
Response: User profile (without password)
```

**`PUT /api/users/me`** - Update Current User Profile
```
Description: Allow user to update their own profile
Headers: Authorization: Bearer <token>
Body: { name?, email?, password? }
Response: Updated user profile
```

**`POST /api/users/change-password`** - Change Password
```
Description: Allow user to change password with old password verification
Headers: Authorization: Bearer <token>
Body: { oldPassword: String, newPassword: String }
Response: Success message
```

**`POST /api/users/forgot-password`** - Forgot Password (Optional)
```
Description: Initiate password reset (can be simple token-based)
Body: { email: String }
Response: Success message
```

---

### **3. Dashboard & Analytics (Optional,)** 
**For admin to view business insights**
_Implement these apis only if you plan to have dashboards in frontend_

#### API Endpoints:

**`GET /api/dashboard/stats`** - Dashboard Statistics
```
Description: Get overall statistics for admin dashboard
Headers: Authorization: Bearer <token> (Admin only)
Response: {
  totalOrders: Int,
  todayOrders: Int,
  totalRevenue: Float,
  todayRevenue: Float,
  pendingOrders: Int,
  totalReservations: Int,
  todayReservations: Int,
  lowStockItems: Int,
  totalMenuItems: Int,
  activeMenuItems: Int
}
```

**`GET /api/dashboard/revenue`** - Revenue Report
```
Description: Get revenue data for charts (daily/weekly/monthly)
Query Params: ?period=daily&startDate=2025-01-01&endDate=2025-01-31
Headers: Authorization: Bearer <token> (Admin only)
Response: Array of revenue data grouped by date
```

**`GET /api/dashboard/popular-items`** - Popular Menu Items
```
Description: Get most ordered menu items
Query Params: ?limit=10
Headers: Authorization: Bearer <token> (Admin only)
Response: Array of menu items with order counts
```

**`GET /api/dashboard/order-trends`** - Order Trends
```
Description: Get order status distribution
Headers: Authorization: Bearer <token> (Admin only)
Response: { pending: Int, inProgress: Int, completed: Int, cancelled: Int }
```

---

### **4. Category Management**
**For better organization of menu and inventory**

#### API Endpoints:

**`GET /api/menu/categories`** - Get All Menu Categories
```
Description: Get unique categories from menu items
Response: Array of category strings
```

**`GET /api/inventory/categories`** - Get All Inventory Categories
```
Description: Get unique categories from inventory
Response: Array of category strings
```

---

### **5. Table Management** 
**For managing cafe tables and reservations**

#### New Schema Addition Needed:
```prisma
model Table {
  id          Int      @id @default(autoincrement())
  tableNumber Int      @unique
  capacity    Int
  status      TableStatus @default(AVAILABLE)
  location    String?  // e.g., "Window", "Corner", "Center"
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}
```

#### API Endpoints:

**`POST /api/tables`** - Create Table
```
Description: Add new table to the system
Body: { tableNumber: Int, capacity: Int, location?: String }
Response: Created table
```

**`GET /api/tables`** - Get All Tables
```
Description: Get all tables with optional status filter
Query Params: ?status=AVAILABLE
Response: Array of tables
```

**`GET /api/tables/:id`** - Get Table by ID
```
Description: Get specific table details
Response: Table object
```

**`PUT /api/tables/:id`** - Update Table
```
Description: Update table details or status
Body: { capacity?, status?, location? }
Response: Updated table
```

**`DELETE /api/tables/:id`** - Delete Table
```
Description: Remove table from system
Response: Success message
```

**`GET /api/tables/available`** - Get Available Tables
```
Description: Get tables that are currently available
Query Params: ?capacity=4&date=2025-01-20&time=18:00
Response: Array of available tables
```

---

### **6. Reports & Exports** 

#### API Endpoints:

**`GET /api/reports/sales`** - Sales Report
```
Description: Generate sales report for date range
Query Params: ?startDate=2025-01-01&endDate=2025-01-31
Headers: Authorization: Bearer <token> (Admin only)
Response: {
  totalSales: Float,
  totalOrders: Int,
  averageOrderValue: Float,
  paymentMethods: { cash: Int, esewa: Int, khalti: Int }
}
```

**`GET /api/reports/inventory`** - Inventory Report
```
Description: Current inventory status report
Headers: Authorization: Bearer <token> (Admin only)
Response: {
  totalItems: Int,
  lowStockItems: Array,
  expiringItems: Array,
  categoryBreakdown: Object
}
```

**`GET /api/reports/reservations`** - Reservation Report
```
Description: Reservation statistics
Query Params: ?startDate=2025-01-01&endDate=2025-01-31
Headers: Authorization: Bearer <token> (Admin only)
Response: {
  totalReservations: Int,
  confirmed: Int,
  cancelled: Int,
  completed: Int,
  averagePartySize: Float
}
```

---

### **7. Notifications/Activity Log** (Optional but useful)

#### New Schema Addition:
```prisma
model ActivityLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   // "ORDER_CREATED", "RESERVATION_CONFIRMED", etc.
  entity    String   // "Order", "Reservation", etc.
  entityId  Int?
  details   String?
  createdAt DateTime @default(now())
  
  user User? @relation(fields: [userId], references: [id])
}
```

#### API Endpoints:

**`GET /api/activity-logs`** - Get Activity Logs
```
Description: Get system activity logs
Query Params: ?limit=50&userId=1&action=ORDER_CREATED
Headers: Authorization: Bearer <token> (Admin only)
Response: Array of activity logs
```

---

### **8. Search & Filter Enhancements**

#### API Endpoints:

**`GET /api/orders/search`** - Search Orders
```
Description: Search orders by customer name, status, date range
Query Params: ?customerName=John&status=PENDING&startDate=2025-01-01
Response: Array of matching orders
```

**`GET /api/menu/search`** - Search Menu Items
```
Description: Search menu by name or description
Query Params: ?query=coffee&available=true
Response: Array of matching menu items
```

**`GET /api/reservations/search`** - Search Reservations
```
Description: Search reservations by customer name, phone, email
Query Params: ?query=john@example.com&status=CONFIRMED
Response: Array of matching reservations
```

---
## 📝 Schema Improvements Suggested

### **1. Add minStock to InventoryItem**
```prisma
model InventoryItem {
  // ... existing fields
  minStock      Int       @default(10)
  reorderLevel  Int?      // Optional: trigger reorder at this level
}
```

### **2. Add Category enums (Optional)**
```prisma
enum InventoryCategory {
  BEVERAGE
  FOOD
  UTENSILS
  CLEANING
  OTHER
}

enum MenuCategory {
  APPETIZER
  MAIN_COURSE
  DESSERT
  BEVERAGE
  SNACK
}
```

### **3. Add ActivityLog model**
```prisma
model ActivityLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String
  entity    String
  entityId  Int?
  details   String?
  createdAt DateTime @default(now())
  
  user User? @relation(fields: [userId], references: [id])
}
```

### **4. Add Table model**
```prisma
model Table {
  id          Int         @id @default(autoincrement())
  tableNumber Int         @unique
  capacity    Int
  status      TableStatus @default(AVAILABLE)
  location    String?
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}
```

---

## 🔧 Critical Fixes & Best Practices

### **1. File & Folder Naming Consistency**

**Issues:** 
- `User-controller.js` uses PascalCase (should be lowercase)
- Folders use PascalCase (`Controllers`, `Middlewares`, `Routes`, `Utils`)
- Controllers use hyphens, but dot notation is cleaner

**Recommended naming convention:**
- **Files:** `user.controller.js`, `menu.controller.js`, `auth.middleware.js`
- **Folders:** `controllers`, `middlewares`, `routes`, `utils`



**Update all imports across the project after renaming.**

**Note:** Current hyphen naming (`menu-controller.js`) is fine too. Pick one style and stay consistent.

---

### **2. Fix Prisma Client File Name**

**Issue:** File is named `prisma-schema.js` but should be `prisma-client.js`



**Update all imports:**
```javascript
// Change in all controller files
// ❌ Old
import prisma from "../Utils/prisma-schema.js"

// ✅ New
import prisma from "../utils/prisma-client.js"
```
---

### **3. Fix Admin Middleware Role Check**

**Issue:** Hardcoded string check instead of enum
```javascript
// ❌ Wrong in admin.js
if (userRole !== 'admin')

// ✅ Correct
if (userRole !== 'ADMIN')  // matches Role enum in schema
```

---

### **4. Fix Inventory Routes Conflict**

**Issue:** Two GET routes at same path `/`

**Current:**
```javascript
router.get("/", getAllInventoryItems);
router.get("/", getLowStockItems);  // ❌ conflict
```

**Fix:**
```javascript
router.get("/", getAllInventoryItems);
router.get("/low-stock", getLowStockItems);  // ✅ unique path
```

---

### **5. Add Missing DELETE Reservation**

**Add to `src/Controllers/reservation-controller.js`:**
```javascript
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reservation.delete({ where: { id: Number(id) } });
    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Add to `src/Routes/reservation.routes.js`:**
```javascript
router.delete("/:id", deleteReservation);
```

---



### **6. Apply Auth Middleware to Protected Routes**

**Which routes need protection:**
- User profile endpoints (`/users/me`, `/users/:id`)
- Admin-only endpoints (inventory, dashboard, reports)
- Creating/updating orders, reservations

**Example for user routes:**
```javascript
import { auth } from "../Middlewares/auth.js";
import { isAdmin } from "../Middlewares/admin.js";

// Public
router.post("/", createUser);       // register
router.post("/login", loginUser);   // login

// Protected (authenticated users)

router.get("/me",auth, getCurrentUser);


// Admin only
router.get("/",auth, isAdmin, getAllUsers);
router.delete("/:id",auth, isAdmin, deleteUser);
```

**Apply similar pattern to:**
- Inventory routes → Admin only
- Menu routes → Admin for create/update/delete, public for read
- Order routes → Auth for all
- Reservation routes → Auth for all
- Dashboard/Reports → Admin only

---

### **8. Consistent Error Responses**

**Create simple error format:**
```javascript
// All errors should return:
{
  "success": false,
  "message": "Error description"
}

// All success should return:
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Update all controllers to use same format to keep things consistent(_does not need to exact same, but should be consistent_).**

---

### **9. Remove Passwords from Responses**

**Add to all user-related responses:**
```javascript
// After fetching user
delete user.password;

// Or use select to exclude
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true, role: true, createdAt: true }
  // password excluded
});
```

---