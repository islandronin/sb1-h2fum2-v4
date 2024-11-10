#!/bin/bash

# Exit on error
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Create application directory
mkdir -p /var/www/networkingcrm
chown -R $USER:$USER /var/www/networkingcrm

# Install PM2 globally
npm install -g pm2

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "Droplet setup completed! Next steps:"
echo "1. Clone your repository"
echo "2. Set up environment variables"
echo "3. Run the deployment script"