#!/bin/sh

# Ensure the database connects and run migrations
echo "Running migrations..."
php artisan migrate --force

# Then start Apache
echo "Starting Apache..."
exec apache2-foreground
