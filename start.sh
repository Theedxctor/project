#!/bin/bash
# StrathFood — Start both servers
ROOT="/home/theedxctor/Desktop/Lentai/strathfood"
echo "🚀 Starting StrathFood..."

# Kill any existing instances
pkill -f "php artisan serve" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

# Start Laravel API
echo "▶  Starting Laravel API on :8000..."
cd "$ROOT/backend"
nohup php artisan serve --port=8000 > /tmp/strathfood-backend.log 2>&1 &
echo "   PID $! → log: /tmp/strathfood-backend.log"

# Start Next.js frontend
echo "▶  Starting Next.js frontend on :3000..."
cd "$ROOT/frontend"
nohup npm run dev -- --port 3000 > /tmp/strathfood-frontend.log 2>&1 &
echo "   PID $! → log: /tmp/strathfood-frontend.log"

sleep 6
echo ""
echo "✅ StrathFood running!"
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:8000"
echo ""
echo "Demo users (all password: 'password'):"
echo "   Admin:   admin@strathmore.edu"
echo "   Vendor:  vendor@strathmore.edu"
echo "   Student: student@strathmore.edu"
