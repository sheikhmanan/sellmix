# SellMix — Chichawatni's Finest 🛵

A full-stack grocery & food delivery app for Chichawatni, Pakistan.

## Project Structure

```
SellMix/
├── backend/          Node.js + Express + MongoDB
├── mobile-app/       React Native (Expo)
└── web-frontend/     React Admin Panel (Vite)
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env       # Edit MONGO_URI and JWT_SECRET
npm install
npm run seed               # Seeds admin user + sample products
npm run dev                # Starts on http://localhost:5000
```
Admin login: **mobile: 03001234567 / password: admin123**

### 2. Admin Web Panel
```bash
cd web-frontend
npm install
npm run dev                # Opens on http://localhost:3000
```

### 3. Mobile App
```bash
cd mobile-app
npm install
npx expo start             # Scan QR with Expo Go app
```
> For Android emulator: API URL is set to `10.0.2.2:5000`
> For real device: change `BASE_URL` in `src/services/api.js` to your PC's local IP

## Features

### Customer App (React Native)
- Splash → Onboarding (3 slides) → Login/Register
- Home with banner, categories, daily deals
- Category browsing with weight variants (1KG/5KG/10KG)
- Product detail with image, description, add to basket
- Search with category filters
- Cart with promo codes (SELLMIX20, FIRST10)
- Checkout: COD / JazzCash / EasyPaisa
- Order tracking by Order ID
- Order history + Profile

### Admin Panel (React Web)
- Dashboard: today's orders, total sales, pending deliveries, low stock alerts
- Products: full CRUD with image upload
- Orders: filter by status, one-click status updates
- Inventory: stock levels, restock functionality

### Backend API
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/categories
POST   /api/categories         (admin)

GET    /api/products
GET    /api/products/:id
POST   /api/products           (admin)
PUT    /api/products/:id       (admin)
PATCH  /api/products/:id/stock (admin)
DELETE /api/products/:id       (admin)

POST   /api/orders
GET    /api/orders/track/:orderId
GET    /api/orders/my          (logged in)
GET    /api/orders             (admin)
PATCH  /api/orders/:id/status  (admin)
GET    /api/orders/stats/dashboard (admin)

POST   /api/upload             (admin, single image)
POST   /api/upload/multiple    (admin, up to 5 images)
```

## Payment Methods
- **COD** — Cash on Delivery
- **JazzCash** — Mobile wallet
- **EasyPaisa** — Mobile wallet

## Brand
- Primary: `#3498db`
- Secondary: `#f5f6f3`
- City: Chichawatni, Punjab, Pakistan
