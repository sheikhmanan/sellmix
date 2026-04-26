#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SellMix — Deploy script (GitHub-based)
# Run this ON THE SERVER after setup.sh
# Usage: bash /root/sellmix/deploy/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

GITHUB_REPO="https://github.com/YOUR_USERNAME/sellmix.git"   # ← change this
APP_DIR="/var/www/sellmix"
REPO_DIR="/root/sellmix"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SellMix — Deploying from GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── 1. Pull latest code from GitHub ──────────────────────────────────────────
echo "[1/6] Pulling latest code..."
if [ -d "$REPO_DIR/.git" ]; then
  cd "$REPO_DIR" && git pull origin main
else
  git clone "$GITHUB_REPO" "$REPO_DIR"
fi

# ─── 2. Install backend dependencies ──────────────────────────────────────────
echo "[2/6] Installing backend dependencies..."
cd "$REPO_DIR/backend"
npm install --omit=dev

# ─── 3. Set up backend .env (first time only) ─────────────────────────────────
echo "[3/6] Checking .env..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
  echo "  Creating .env from template..."
  cp "$REPO_DIR/deploy/env.production.template" "$APP_DIR/backend/.env"
  echo "  ⚠️  Edit $APP_DIR/backend/.env with your real values then re-run."
  exit 1
fi

# ─── 4. Copy backend to /var/www ──────────────────────────────────────────────
echo "[4/6] Copying backend..."
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$REPO_DIR/backend/" "$APP_DIR/backend/"

# Reinstall in destination
cd "$APP_DIR/backend" && npm install --omit=dev

# Copy PM2 ecosystem config
cp "$REPO_DIR/ecosystem.config.js" "$APP_DIR/"

# ─── 5. Build and copy frontend apps ──────────────────────────────────────────
echo "[5/6] Building frontend apps..."

cd "$REPO_DIR/customer-web"
npm install
npm run build
rsync -a --delete dist/ "$APP_DIR/customer-web/"

cd "$REPO_DIR/web-frontend"
npm install
npm run build
rsync -a --delete dist/ "$APP_DIR/web-frontend/"

# ─── 6. Restart backend with PM2 ──────────────────────────────────────────────
echo "[6/6] Restarting backend..."
if pm2 list | grep -q "sellmix-api"; then
  pm2 restart sellmix-api
else
  pm2 start "$APP_DIR/ecosystem.config.js" --env production
  pm2 save
fi

# Reload Nginx
nginx -t && systemctl reload nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deployment complete!"
echo ""
echo "  🌐 Customer site:  https://sellmix.pk"
echo "  🔧 Admin panel:    https://admin.sellmix.pk"
echo "  📡 API:            https://api.sellmix.pk"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
