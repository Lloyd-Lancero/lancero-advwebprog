# What was corrected

## Models (`lancero-server/models/`)
| File | Change | Why |
|---|---|---|
| product, category, supplier | Removed `schema.index({ name: 1 })` | `unique: true` already creates that index – it was declared twice |
| productModel | Removed unused `title` index; added `price` index; `content` must be non-empty; `timestamps` | Index only what is queried; empty arrays slipped past `required`; consistency |
| cartModel | `user` now `required` + `unique` | A cart without an owner is meaningless; one cart per user |
| orderModel | `user` required; `items` must be non-empty; `total` auto-computed in a `pre('validate')` hook; index `{user, createdAt}` | Referential integrity; total can no longer disagree with items |
| reviewModel | `user` required; rating must be a whole number; indexes `{product, createdAt}` and unique `{product, user}` | Integrity; no duplicate reviews |
| userModel | Email format validation (`match`) | `"hello"` was accepted as an email |

## Controllers / routes
- `cartController`: `getCartById` now checks ownership (owner or admin); `createCart` forces `user` to the logged-in user; `getMyCart` wrapped in try/catch.
- `orderController`: `getOrderById` no longer crashes when `order.user` is missing; only name/email of the user are returned.
- `reviewController`: duplicate review returns a friendly message instead of a raw `E11000` error.
- `productController` / `productV1Controller`: search text is regex-escaped.
- `productV1Routes`: POST/PUT/DELETE now require login + admin (they were open to everyone).

## Project housekeeping
- `package.json`: `main` fixed to `server.js`; added `start` and `dev` scripts.
- `.env` files removed from the package; `.env.example` added for server and client; client `.gitignore` now ignores `.env`.
- `README.md` rewritten to describe this project accurately; client package name fixed.

## If you already have data in MongoDB
The new unique indexes can fail to build if old data breaks the rules:
- carts with no `user`, or two carts for one user -> delete/merge them
- two reviews by the same user on the same product -> delete one
Easiest in a dev database: delete the `carts`, `orders` and `reviews` collections and let Mongoose recreate them.

---

# Activity 3 corrections (second round)

- **Secrets removed:** `.env` files are no longer in the package (use `.env.example`). Change your MongoDB Atlas password, because the old one was shared.
- **Full CRUD:** `/api/product` now has DELETE; `/api/category` and `/api/supplier` now have PUT and DELETE (admin only). A category/supplier that still has products cannot be deleted (409). Added `CONFLICT: 409` to `HttpStatus`.
- **One controller for both product routes:** `/api/product` and `/api/v1/products` now share `productV1Controller.js` (the old `productController.js` was removed), so both give the same standard response: `{ success, message, count, data }` plus `total`, `page`, `limit`, `totalPages` for lists.
- **Standard errors:** new `utils/apiResponse.js` (`sendSuccess`, `sendError`, `handleError`). Invalid ids now return 400 (was 500), duplicates return 409, validation errors 400. The authentication/authorization middleware errors also use the standard structure.
- **Limits:** `limit` is capped at 100; `sort` only accepts name, title, price, stock, createdAt (use `-price` for descending).
- **Frontend:** `src/api/products.js` and `AdminDashboardPage.jsx` read `response.data.data` instead of `response.data.products`.
- **Added `TESTING.md`:** the Postman request checklist for Part 5.


---

# Long Exam 1 corrections (third round)

- **RBAC hole fixed:** `PUT /api/user/:id` said "self-or-admin" but never checked. Any customer could edit any user, or make themselves admin. Now: customers can only edit themselves and cannot send `role`; admins cannot change their own role.
- **Admin cannot deactivate their own account** (`PATCH /api/user/:id/active`).
- **`GET /api/review` is admin-only** (it returned every reviewer's full user record publicly). Per-product reviews (`/api/review/product/:id`) stay public.
- **Server errors:** JSON 404 for unknown routes and a central error handler (bad JSON body -> 400, unexpected -> 500).
- **Session handling:** on a 401 the axios interceptor now also logs the user out of React state (`auth:unauthorized` event), not just localStorage.
- **Admin dashboard:** every action (orders, reviews, users) now has try/catch and shows server errors in red; header text is readable on the blue background.
- **Orders page:** error handling, newest first, readable text; **NavBar** has an Orders link and a readable greeting; Cart page text readable.


---

# Activity 4 corrections (Authentication and Authorization)

- **Roles are now "Customer" and "Admin"** (User model enum, default "Customer"), as the activity requires. Updated every `authorization('Admin')` route, the controllers, and the React role checks.
- **`npm run seed:admin`** creates the first Admin (registration always creates a Customer) and converts any old lowercase roles in the database.
- **`/api/v1/user`** now works as well as `/api/user` (same router).
- **An admin can no longer delete their own account.**
- `.env` files removed from the package; `.env.example` added for server and client.

## If you already have users in MongoDB
Run `npm run seed:admin` once (from `lancero-server`). It changes old `admin`/`customer` roles to `Admin`/`Customer`.


---

# Activity 5 (Custom Middleware and API Security)

New in `lancero-server/`:
- `middleware/auditLoggerMiddleware.js` + `models/logModel.js` - every request is saved to the `logs` collection (method, path, ip, user, status, duration; level info/warn/error by status code). Passwords are never stored.
- `middleware/validationMiddleware.js` - express-validator rules for users (register, login, admin create/update, profile, password, active) and, for the Part 9 enhancement, products, categories, suppliers, reviews, cart and order status. Invalid input -> 400 with `{ success, message, errors[] }`.
- `middleware/rateLimiterMiddleware.js` - `apiLimiter`, `loginLimiter`, `registerLimiter`, `passwordLimiter`, `reviewLimiter`, `orderLimiter` and `loginThrottle` (progressive lockout: 5 fails = 3 min, 8 = 5 min, 10+ = 30 min, HTTP 429 + Retry-After).
- `middleware/errorMiddleware.js` - JSON 404 and the central error handler (bad JSON, body too large, CORS, unexpected errors).
- `server.js` - Helmet, CORS (allowed origin comes from `CLIENT_URL`, default http://localhost:5173), audit logger, 10kb body limit, global limiter, central error handler.
- All route files now use the validation and limiter middleware. Authentication/RBAC order is unchanged.
- Run `npm install` (adds express-validator, helmet, express-rate-limit). Add `CLIENT_URL` to your `.env`.


---

# Activity 6 (File Management and Media Services)

**New**
- `middleware/uploadImageMiddleware.js` - Multer (memory storage), JPG/PNG/WEBP only, 5 MB, 1 file, field `image`.
- `middleware/imageValidationMiddleware.js` - reads the file's real bytes (magic numbers), so a renamed `.exe`/`.txt` cannot pass as an image.
- `config/cloudinary.js` + `utils/imageService.js` - Cloudinary setup; `uploadImageBuffer` (stream from memory) and `deleteImage`.
- `POST /api/product/:id/upload-image` and `DELETE /api/product/:id/image` (Admin only; same under `/api/v1/products`).
- Client: `components/ProductImageInput.jsx` (file picker, preview, size/type errors) and `utils/imageRules.js`.

**Changed**
- `productModel`: new `imagePublicId` (hidden from API responses).
- `productV1Controller`: create/update accept an optional image (multipart); a replaced image, a deleted product, or a failed save removes the unused Cloudinary asset.
- `productRoutes`: auth -> role -> multer -> content check -> field validation -> controller. `productV1Routes` now re-exports it (the two files were identical).
- `errorMiddleware`: Multer errors become clear JSON (413 for too large, 400 otherwise).
- `AdminDashboardPage`: image URL text box replaced by the image picker with preview; sends `FormData`; thumbnails in the product list; "Remove image".
- `.env.example`: Cloudinary variables. New dependencies: `multer`, `cloudinary`.

**Note:** the sample controller in the activity sheet uses `req.file.path`, which does not exist with `memoryStorage`
(it would crash with "Cannot read properties of undefined"). This project uploads `req.file.buffer` with `upload_stream` instead.
