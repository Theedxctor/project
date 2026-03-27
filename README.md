# StrathFood 🍽️

StrathFood is a complete full-stack web application designed for Strathmore University to help students skip cafeteria queues by pre-ordering their meals from multiple on-campus restaurants.

It uses a **Next.js** frontend for a fast, modern User Interface and a robust **Laravel 11** backend handling business logic and automated M-Pesa STK push payments.

---

## 🚀 Features
- **Multi-Restaurant Support:** Browse menus from multiple real campus eateries.
- **Cart & Checkout:** Add items to cart and manipulate quantities seamlessly.
- **M-Pesa STK Integration:** Automatically pushes payment prompts directly to your phone via Safaricom Daraja.
- **Role-based Dashboards:** Dedicated panels for Students, Vendors (to manage food/orders), and Admins.
- **Dark Mode Design:** A sleek, fully-custom "matte black" UI tailored for modern aesthetics.

---

## 🛠 Prerequisites
Before running this project, ensure you have the following installed on your machine:
- **Node.js** (v18+) and `npm`
- **PHP** (v8.3+)
- **Composer**
- **PostgreSQL** (Make sure the database service is running locally)
- **Git**

---

## 💻 Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Theedxctor/project.git strathfood
cd strathfood
```

### 2. Backend Setup (Laravel)
The backend powers the API, database connectivity, and Safaricom payments.
```bash
cd backend

# 1. Install PHP dependencies
composer install

# 2. Setup environment variables
cp .env.example .env

# 3. Generate Laravel App Key
php artisan key:generate
```

**Configure the Database:**
Open `backend/.env` and update your PostgreSQL credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=strathfood
DB_USERNAME=postgres
DB_PASSWORD=your_password
```
*(Note: Ensure you have manually created an empty database named `strathfood` in pgAdmin/psql before proceeding).*

**Run Migrations & Seed the Data:**
This will build the tables and populate the menu dynamically using `data.json`.
```bash
php artisan migrate:fresh --seed
```
*Demo Accounts Created:*
- **Admin:** `admin@strathmore.edu` (pw: `password`)
- **Vendor:** `vendor@strathmore.edu` (pw: `password`)
- **Student:** `student@strathmore.edu` (pw: `password`)

**Start the Backend Server:**
```bash
php artisan serve
# Typically runs on http://127.0.0.1:8000
```

---

### 3. Frontend Setup (Next.js)
Open a new terminal tab and navigate back to the root of the project.
```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Run the development server
npm run dev
# Expected to run on http://localhost:3000
```

---

## 📱 Testing M-Pesa Payments Locally
Because Safaricom Daraja requires a publicly accessible URL to send payment confirmation callbacks, M-Pesa testing on `localhost` requires [Ngrok](https://ngrok.com/).

1. Run ngrok pointing to your Laravel backend port:
   ```bash
   ngrok http 8000
   ```
2. Copy the `https://xxxx.ngrok-free.app` URL it gives you.
3. Open `backend/.env` and update your callback URL:
   ```env
   MPESA_CALLBACK_URL=https://your-ngrok-link.ngrok-free.app/api/v1/mpesa/callback
   ```
4. Restart your Laravel server (`php artisan serve`) and any M-Pesa queries simulated in the browser will now correctly reach your local backend!

---

## 🐳 Deployment (Render & Vercel)
This repository is pre-configured for instant cloud deployment! 
- The **backend** contains a `Dockerfile` and `docker-entrypoint.sh` for instantly spinning up a Web Service with Apache entirely free on **Render**.
- The **frontend** works out-of-the-box perfectly on **Vercel** pointing to the Render API url inside the Vercel Dashboard via the `NEXT_PUBLIC_API_URL` environment variable.
