#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
fi

# Create database and user if they don't exist
sudo -u postgres psql -c "CREATE DATABASE networkingcrm;" || true
sudo -u postgres psql -c "CREATE USER dbuser WITH PASSWORD 'dbpassword';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE networkingcrm TO dbuser;" || true

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Navigate to app directory
cd /var/www/networkingcrm

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Start/Restart the application with PM2
pm2 restart networkingcrm || pm2 start server/index.js --name networkingcrm

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/networkingcrm
sudo ln -sf /etc/nginx/sites-available/networkingcrm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "Deployment completed successfully!"