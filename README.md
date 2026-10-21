# Bulldogs Exchange (BulldogEx Shop)

A MERN e-commerce app for campus products.

- `lancero-client/` – React 19 + Vite + React Router + Tailwind CSS 4
- `lancero-server/` – Node.js + Express 5 + MongoDB (Mongoose 9), MVC structure

## Setup

### 1. Backend
```bash
cd lancero-server
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed:products     # optional: loads categories, suppliers and products
npm run dev               # or: npm start   (runs on http://localhost:5000)
```
Check it works: open `http://localhost:5000/` – you should see `Bulldogs Exchange API is running`, and the terminal should print `Connected to MongoDB`.

### 2. Frontend
```bash
cd lancero-client
npm install
cp .env.example .env
npm run dev
```

> `.env` files hold secrets and are git-ignored. Never commit or share them.

## Backend structure (MVC)
```text
lancero-server/
├── server.js
├── config/        constants.js
├── models/        productModel, categoryModel, supplierModel, cartModel,
│                  orderModel, reviewModel, userModel
├── controllers/   one controller per model (+ auth); products use productV1Controller
├── routes/        one router per model (+ auth)
├── middleware/    authentication.js (JWT), authorization.js (roles)
└── utils/         generateToken.js
```

## Database design

| Collection | Key fields | Relationships |
|---|---|---|
| Category | name (unique), description | – |
| Supplier | name (unique), description | – |
| Product | name (unique slug), title, price, stock, availability, image, content[] | **references** Category, Supplier |
| User | name, email (unique), password (hashed, hidden), role, isActive | – |
| Cart | items[{ product, quantity }] | **references** User (one cart per user); items are **embedded**, each **references** Product |
| Order | items[{ product, quantity, price }], total, status | **references** User; items are **embedded** (price snapshot), each **references** Product |
| Review | rating (1–5, whole number), comment | **references** Product, User (one review per user per product) |

**Embedded vs referenced:** cart items and order items are embedded because they have no meaning outside their parent and are always read with it. Everything that is shared or has its own lifecycle (category, supplier, product, user) is referenced.

### Indexes and why
| Index | Used by |
|---|---|
| `Product.name` (unique) | `/products/:name` lookup |
| `Product.category`, `Product.supplier` | filtering products |
| `Product.price` | sorting by price |
| `Category.name`, `Supplier.name`, `User.email` (unique) | lookups and duplicate prevention |
| `Cart.user` (unique) | find a user's cart; one cart per user |
| `Order.user + createdAt` | a user's orders, newest first |
| `Review.product + createdAt` | a product's reviews, newest first |
| `Review.product + user` (unique) | one review per user per product |

## API overview
| Base path | Notes |
|---|---|
| `/api/auth` | register, login, me |
| `/api/user` | profile/password (own), user management (admin) |
| `/api/product`, `/api/v1/products` | read: public; create/update/delete: admin |
| `/api/category`, `/api/supplier` | read: public; create: admin |
| `/api/cart` | logged-in users (own cart) |
| `/api/order` | logged-in users (own orders); status update: admin |
| `/api/review` | read: public; create: logged-in; update: admin |
