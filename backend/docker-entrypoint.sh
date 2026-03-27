#!/bin/sh

# Ensure the database connects and run migrations
echo "Running migrations..."
php artisan migrate --force
php artisan db:seed --force

# Fix permissions for the log file if it was created by root during migration
chmod -R 775 /var/www/html/storage
chown -R www-data:www-data /var/www/html/storage

# Then start Apache
echo "Starting Apache..."
exec apache2-foreground
