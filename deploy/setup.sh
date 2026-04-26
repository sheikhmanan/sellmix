#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SellMix — One-time server setup script
# Run this ONCE on a fresh Ubuntu 22.04 DigitalOcean droplet as root
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SellMix — Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── 1. Update system ─────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── 2. Install Node.js 20 LTS ───────────────────────────────────────────────
echo "[2/8] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ─── 3. Install Nginx ─────────────────────────────────────────────────────────
echo "[3/8] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ─── 4. Install Certbot (SSL) ─────────────────────────────────────────────────
echo "[4/8] Installing Certbot for SSL..."
apt-get install -y certbot python3-certbot-nginx

# ─── 5. Install PM2 ───────────────────────────────────────────────────────────
echo "[5/8] Installing PM2..."
npm install -g pm2

# ─── 6. Create directory structure ───────────────────────────────────────────
echo "[6/8] Creating directory structure..."
mkdir -p /var/www/sellmix/backend
mkdir -p /var/www/sellmix/customer-web
mkdir -p /var/www/sellmix/web-frontend
mkdir -p /var/log/sellmix

# ─── 7. Configure Nginx ───────────────────────────────────────────────────────
echo "[7/8] Configuring Nginx..."
cp /root/sellmix/deploy/nginx.conf /etc/nginx/sites-available/sellmix

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Enable sellmix site
ln -sf /etc/nginx/sites-available/sellmix /etc/nginx/sites-enabled/sellmix

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# ─── 8. Set up firewall ───────────────────────────────────────────────────────
echo "[8/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Server setup complete!"
echo ""
echo "  NEXT STEPS:"
echo "  1. Upload your code:  run deploy.sh from your local machine"
echo "  2. Get SSL certs:     certbot --nginx -d sellmix.pk -d www.sellmix.pk -d admin.sellmix.pk -d api.sellmix.pk"
echo "  3. Start backend:     pm2 start /var/www/sellmix/ecosystem.config.js --env production"
echo "  4. Save PM2 startup:  pm2 startup && pm2 save"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
