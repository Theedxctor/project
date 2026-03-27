# StrathFood — Full-Stack Implementation Plan

## Overview

**StrathFood** is a multi-restaurant food pre-ordering platform for Strathmore University that eliminates long cafeteria queues. Students browse time-sensitive menus from multiple on-campus restaurants, place orders, pay via M-Pesa, and receive a 6-character pickup code.

**Stack:**
- **Backend:** Laravel 11 (Headless API) + Sanctum auth
- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Database:** MySQL
- **Payments:** M-Pesa Daraja API (STK Push)

---

## User Review Required

> [!IMPORTANT]
> **M-Pesa Credentials**: You will need to provide your Safaricom Daraja API credentials:
> - `MPESA_CONSUMER_KEY`
> - `MPESA_CONSUMER_SECRET`
> - `MPESA_SHORTCODE`
> - `MPESA_PASSKEY`
> - `MPESA_CALLBACK_URL` (must be a publicly accessible URL — use ngrok or a deployed server)
>
> I'll scaffold the integration with placeholder `.env` values so everything else works independently.

> [!NOTE]
> **Project Layout**: I'll create two sub-folders in `/strathfood/`:
> - `backend/` — Laravel 11 API
> - `frontend/` — Next.js App

---

## Proposed Changes

### Phase 1 — Backend (Laravel 11)

#### [NEW] `backend/` — Laravel 11 API Project

**Scaffold via:** `composer create-project laravel/laravel backend`

##### Database Migrations & Models (Revised)

| Table | Columns |
|-------|---------|
| `restaurants` | id, **name**, **slug** (unique), **image**, **status** (`Open\|Closed`), timestamps |
| `users` | id, **name**, **email** (`@strathmore.edu`), **password**, **role** (`Admin\|Vendor_Staff\|Student`), timestamps |
| `foods` | id, **restaurant_id** (FK → restaurants), **name**, **price**, **category** (`Morning\|Evening\|All-day`), image_path, is_available, timestamps |
| `orders` | id, **user_id** (FK → users), **restaurant_id** (FK → restaurants), **total**, **pickup_code** (6-char unique), **status** (`Pending\|Paid\|Ready\|Picked Up`), timestamps |
| `order_items` | id, order_id (FK), food_id (FK), quantity, unit_price, timestamps |

**Key relationships:**
- A `Restaurant` has many `Foods` and many `Orders`
- A `User` has many `Orders`
- An `Order` belongs to a `User` and a `Restaurant`, and has many `OrderItems`
- A `Food` belongs to a `Restaurant`

##### Role Middleware
| Role | Access |
|------|--------|
| `Admin` | Full access — manage restaurants, users, all orders |
| `Vendor_Staff` | Their restaurant's orders, menu management |
| `Student` | Browse menus, place orders, view own dashboard |

##### API Routes (all under `/api/v1/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register (Strathmore email only) |
| POST | `/login` | Public | Login → returns Sanctum token |
| POST | `/logout` | Auth | Revoke token |
| GET | `/restaurants` | Public | List all restaurants with status |
| GET | `/restaurants/{slug}/menu` | Public | Time-sensitive menu for a restaurant |
| GET | `/foods` | Admin | All food items |
| POST | `/foods` | Admin/Vendor_Staff | Add food item |
| PATCH | `/foods/{id}` | Admin/Vendor_Staff | Update food item |
| DELETE | `/foods/{id}` | Admin | Delete food item |
| POST | `/orders` | Student | Create pending order + items |
| POST | `/orders/{id}/pay` | Student | Initiate M-Pesa STK Push |
| GET | `/orders/mine` | Student | Own orders |
| GET | `/orders` | Admin/Vendor_Staff | All orders for their restaurant |
| PATCH | `/orders/{id}/status` | Admin/Vendor_Staff | Update order status |
| GET | `/users` | Admin | List all users |
| DELETE | `/users/{id}` | Admin | Delete user |
| POST | `/restaurants` | Admin | Create restaurant |
| PATCH | `/restaurants/{id}` | Admin | Update restaurant (open/close) |

##### M-Pesa Integration
- `MpesaService` class using Daraja STK Push
- Callback endpoint (`/api/mpesa/callback`) — updates order to `Paid`, generates pickup_code
- Notification logic: queue job that alerts every 15 mins for 1 hour when order is `Ready`

##### Auth
- Laravel Sanctum token-based auth
- Email validation rule: must end with `@strathmore.edu`
- Role middleware: `admin`, `vendor_staff`, `student`

---

### Phase 2 — Frontend (Next.js)

#### [NEW] `frontend/` — Next.js App Router Project

**Scaffold via:** `npx create-next-app@latest frontend --typescript --tailwind --app --no-git`

##### Pages & Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page — restaurant cards with Open/Closed badges |
| `/login` | Login form |
| `/register` | Registration form |
| `/restaurants/[slug]` | Restaurant menu with Morning/Evening/All-day tabs + Cart |
| `/dashboard` | Student — active order status + pickup code |
| `/admin` | Admin panel — restaurants, users, all orders |
| `/vendor` | Vendor Staff panel — their restaurant's orders + inventory |

##### Key Components
- `Navbar` — role-aware navigation (Student / Vendor_Staff / Admin)
- `RestaurantCard` — displays restaurant with Open/Closed badge
- `MenuGrid` — food cards filtered by time category
- `CategoryTabs` — Morning / Evening / All-day tab switcher
- `Cart` — slide-in cart drawer with restaurant-scoped checkout
- `OrderStatusCard` — shows status + pickup code with live countdown
- `AdminOrdersTable` — real-time order management table
- `AdminInventory` — add/remove food items per restaurant
- `RestaurantManager` — admin CRUD for restaurants (toggle Open/Closed)

##### Auth Strategy
- Sanctum tokens stored in `httpOnly` cookies via Next.js middleware
- `AuthContext` provider for client-side role checks
- Route protection with Next.js middleware

---

## Build Order

```
1. Scaffold Laravel backend
2. Create migrations (restaurants, users, foods, orders, order_items)
3. Create Eloquent models with relationships
4. Seed: sample restaurants, food items, admin user
5. Build API controllers (Auth, Restaurant, Food, Order)
6. Add role-based middleware
7. Integrate M-Pesa service
8. Scaffold Next.js frontend
9. Build auth pages + API client (axios)
10. Build landing page (restaurant listing)
11. Build restaurant menu + cart + checkout flow
12. Build student dashboard
13. Build admin panel
14. Build vendor staff panel
15. End-to-end testing
```

---

## Open Questions

> [!IMPORTANT]
> **Do you have M-Pesa Daraja credentials?** If yes, share them (or confirm you'll add them to `.env` manually). If no, I'll scaffold with mock/sandbox payment for now.

> [!NOTE]
> **Seeding**: Should I seed the database with sample restaurants and food items for demo purposes? (Recommended: Yes)

> [!NOTE]
> **Notifications**: When an order is `Ready`, should alerts be in-app, email, or SMS?

---

## Verification Plan

### Automated
- `php artisan test` — Laravel feature tests for auth, menu, order flow
- Manual Postman/curl API testing against running server

### Manual Browser Verification
- Register with `@strathmore.edu` email → succeeds
- Register with `@gmail.com` → rejected
- Landing page lists restaurants with correct Open/Closed status
- Browse restaurant menu — correct category shown by time of day
- Add to cart, checkout, trigger STK Push
- Admin can update order status to "Ready"
- Student sees pickup code on dashboard
- Vendor Staff can only see their restaurant's orders
