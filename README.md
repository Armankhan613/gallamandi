# 🌾 GallaMandi

A full-stack agricultural marketplace that connects farmers and customers through an e-commerce-style platform.

GallaMandi allows users to browse agricultural products, search the catalog, manage a shopping cart, place orders, and track their orders. Administrators can manage products, upload product images, manage inventory, and update order statuses through a dedicated admin dashboard.

🔗 **Live Website:** https://gallamandi.vercel.app

---

## ✨ Features

### 👤 Customer Features

- User registration and login
- JWT-based authentication
- Browse agricultural products
- Product search
- Product details page
- Add products to cart
- Increase/decrease cart quantities
- Remove items from cart
- Checkout with shipping information
- Place orders
- View order history
- Track order status
- Responsive design for desktop, tablet, and mobile devices

### 🛠️ Admin Features

- Dedicated admin dashboard
- Role-based admin authorization
- Dashboard statistics
- Product management
- Add new products
- Edit existing products
- Deactivate products
- Restore deactivated products
- Inventory/stock management
- Product image upload
- Image preview before upload
- Flexible product attributes using PostgreSQL JSONB
- View registered users
- View all orders
- Update order status
- Revenue overview

---

## 🏗️ Architecture

GallaMandi uses a layered full-stack architecture with separate frontend, backend, database, and object-storage responsibilities.

```text
                    ┌──────────────────────┐
                    │   GallaMandi UI      │
                    │    HTML/CSS/JS       │
                    │       Vercel         │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │        Render        │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌──────────────────┐       ┌──────────────────┐
        │   PostgreSQL     │       │ Supabase Storage │
        │     Supabase     │       │                  │
        │                  │       │ Product Images   │
        │ Users            │       └──────────────────┘
        │ Products         │
        │ Cart             │
        │ Orders           │
        │ Order Items      │
        └──────────────────┘
```

---

## 🧩 Persistence Strategy

GallaMandi uses a practical form of **polyglot persistence**, selecting storage based on the nature of the data.

### PostgreSQL

PostgreSQL is used for structured transactional application data:

- Users
- Products
- Cart
- Orders
- Order items

PostgreSQL provides:

- Relational data modeling
- Foreign keys
- Constraints
- Transactions
- Consistent inventory and order processing
- Structured querying

### PostgreSQL JSONB

Product-specific attributes are stored in a PostgreSQL `JSONB` column.

This allows agricultural products to have different attributes without continuously changing the relational schema.

For example, a wheat product can have:

```json
{
  "variety": "Sharbati",
  "grade": "A",
  "origin": "Madhya Pradesh",
  "moisture_percent": 11
}
```

while a rice product can have:

```json
{
  "variety": "Basmati",
  "grain_length": "Long",
  "aroma": "High",
  "origin": "Haryana"
}
```

This provides schema flexibility while keeping the core product record relational.

### Supabase Storage

Supabase Storage is used for product images.

The actual image file is stored in the `product-images` bucket, while PostgreSQL stores the image URL/reference in the product record.

```text
Product Image
      ↓
Supabase Storage
      ↓
Public Image URL
      ↓
products.image_url
```

This keeps binary media separate from transactional database data.

---

## 🔐 Authentication & Authorization

GallaMandi uses **JWT-based authentication**.

### Authentication Flow

```text
User
  ↓
Login
  ↓
Express API
  ↓
Verify password
  ↓
Generate JWT
  ↓
Store token in browser
```

### Admin Authorization

Admin APIs are protected by backend middleware.

```text
Request
  ↓
JWT Authentication
  ↓
Admin Role Check
  ↓
Admin API
```

The frontend uses the user's role to control navigation and display the Admin Dashboard link, but **actual admin authorization is enforced by the backend**.

---

## 🛒 Cart & Order Processing

Users can add products to a cart, change quantities, remove items, and proceed to checkout.

Checkout uses a PostgreSQL transaction to maintain consistency between orders, order items, cart contents, and inventory.

```text
BEGIN
  ↓
Validate cart
  ↓
Check product availability
  ↓
Create order
  ↓
Create order items
  ↓
Update product stock
  ↓
Clear cart
  ↓
COMMIT
```

If an operation fails:

```text
ROLLBACK
```

This prevents partially completed orders.

---

## 📦 Product Management

Products contain both standard relational fields and flexible attributes.

### Standard Fields

- Name
- Category
- Price
- Stock
- Description
- Image URL
- Active/inactive status
- Created timestamp
- Updated timestamp

### Flexible Attributes

Stored using PostgreSQL JSONB:

```text
attributes
```

This allows product categories to define their own additional properties without requiring frequent schema changes.

---

## 🖼️ Product Image Management

Administrators can upload product images directly from the Admin Dashboard.

```text
Admin
  ↓
Select Image
  ↓
Frontend
  ↓
Express Backend
  ↓
Supabase Storage
  ↓
Image URL
  ↓
PostgreSQL
```

The admin interface supports image preview and validates uploaded images before sending them to the backend.

---

## ♻️ Product Deactivation

Products use a soft-delete approach.

Instead of permanently deleting a product record:

```text
is_active = false
```

is used.

This allows products to disappear from the public catalog while keeping historical order references intact.

```text
Active Product
      ↓
Deactivate
      ↓
is_active = false
      ↓
Hidden from storefront
      ↓
Historical orders preserved
```

Administrators can restore a deactivated product later.

---

## 📊 Admin Dashboard

The admin dashboard provides:

```text
Dashboard
├── Active Products
├── Orders
├── Users
└── Revenue

Products
├── Add Product
├── Edit Product
├── Deactivate Product
└── Restore Product

Orders
└── Update Order Status

Users
└── View Users
```

### Supported Order Statuses

```text
placed
confirmed
processing
shipped
delivered
cancelled
```

---

## 📁 Project Structure

```text
gallamandi/
│
├── GallaMandi_frontend/
│   │
│   ├── admin/
│   │   ├── index.html
│   │   ├── admin.css
│   │   └── admin.js
│   │
│   ├── css/
│   │
│   ├── js/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── register.js
│   │   ├── main.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── orders.js
│   │
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── product.html
│   ├── cart.html
│   └── orders.html
│
├── GallaMandi_backend/
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── storage.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   ├── scripts/
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Web Design
- Fetch API
- Local Storage

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcrypt
- PostgreSQL driver (`pg`)
- Multer

### Database & Storage

- PostgreSQL
- Supabase
- Supabase Storage
- PostgreSQL JSONB

### Deployment

- Vercel — Frontend
- Render — Backend
- Supabase — PostgreSQL Database & Storage

---

## 🚀 Running Locally

### Prerequisites

Make sure you have:

- Node.js 22.x
- npm
- A Supabase project
- A Supabase Storage bucket named `product-images`

### 1. Clone the Repository

```bash
git clone https://github.com/Armankhan613/gallamandi.git
cd gallamandi
```

### 2. Setup the Backend

```bash
cd GallaMandi_backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_supabase_postgresql_connection_string

JWT_SECRET=your_jwt_secret

NODE_ENV=development

PORT=5000

SUPABASE_URL=https://your-project-ref.supabase.co

SUPABASE_SECRET_KEY=your_supabase_server_secret_key

SUPABASE_STORAGE_BUCKET=product-images
```

> Never commit `.env` to GitHub.

### 3. Setup the Database

Open your Supabase project and run:

```text
GallaMandi_backend/database/schema.sql
```

Then populate the initial product data using:

```text
GallaMandi_backend/database/seed.sql
```

### 4. Start the Backend

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

### 5. Run the Frontend

Open:

```text
GallaMandi_frontend
```

using VS Code Live Server or another static web server.

The frontend automatically uses the local backend during local development.

---

## 🔐 Creating an Admin

Register a normal account first.

Then update its role in the Supabase SQL Editor:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Log out and log in again so that a new JWT containing the admin role is generated.

Administrators are automatically redirected to the Admin Dashboard after login.

---

## 🔌 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Products

```text
GET    /api/products
GET    /api/products/:id
GET    /api/products/search?q=...
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Cart

```text
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:id
DELETE /api/cart/:id
```

### Orders

```text
POST /api/orders/checkout
GET  /api/orders
```

### Admin

```text
GET   /api/admin/stats
GET   /api/admin/products
PATCH /api/admin/products/:id/restore
GET   /api/admin/orders
PATCH /api/admin/orders/:id/status
GET   /api/admin/users
```

Admin endpoints are protected by JWT authentication and role-based authorization middleware.

---

## 📱 Responsive Design

The frontend is designed for:

- Desktop
- Laptop
- Tablet
- Mobile
- Small-screen mobile devices

Responsive behavior covers:

- Navigation
- Search
- Product grid
- Product details
- Shopping cart
- Checkout modal
- Order cards
- Login/Register forms
- Admin dashboard
- Admin product forms
- Admin tables

---

## 🔒 Security

GallaMandi follows several basic security practices:

- Passwords are hashed using bcrypt
- Authentication uses JWT
- Admin operations are protected server-side
- Database credentials are stored in environment variables
- Supabase secret keys remain on the backend
- `.env` files are excluded from Git
- Input data is validated server-side
- Checkout uses PostgreSQL transactions
- Inventory updates are checked against available stock
- Product deletion uses soft-delete behavior

Never expose the following values in frontend code:

```text
DATABASE_URL
JWT_SECRET
SUPABASE_SECRET_KEY
```

---

## 🌱 Future Improvements

Potential future enhancements include:

- Farmer/vendor-specific accounts
- Multiple product images
- Product reviews and ratings
- Wishlist
- Online payment integration
- Delivery tracking
- Advanced product filtering
- Category pages
- Pagination
- Full-text product search
- Notifications
- Analytics dashboard
- Image optimization
- Automated tests
- CI/CD pipeline

---

## 🎯 Learning Outcomes

This project provided practical experience with:

- Full-stack web development
- REST API development
- Authentication and authorization
- PostgreSQL
- Relational database design
- Database transactions
- PostgreSQL JSONB
- Cloud object storage
- File uploads
- Admin dashboards
- Responsive web design
- Deployment
- Environment variable management
- Git and GitHub

---

## 👨‍💻 Author

**Arman Khan**

B.Tech Computer Science & Engineering

### GitHub

https://github.com/Armankhan613

### LinkedIn

https://www.linkedin.com/in/armankhan1908/

---

## 📄 License

This project is primarily intended as a learning and portfolio project.
