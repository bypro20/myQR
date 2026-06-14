#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Turso token (aynı hesap — gu-live-chat ile paylaşılmaz DB)
if [ -f /home/bypro20/gu-live-chat/.env ]; then
  export TURSO_ACCESS_TOKEN=$(grep '^TURSO_AUTH_TOKEN=' /home/bypro20/gu-live-chat/.env | cut -d'"' -f2)
fi

DB_NAME="myqr-bypro20"
TURSO="$HOME/.turso/turso"

if [ -n "${TURSO_ACCESS_TOKEN:-}" ] && [ -x "$TURSO" ]; then
  $TURSO db create "$DB_NAME" --location aws-eu-west-1 2>/dev/null || true
  DB_URL=$($TURSO db show "$DB_NAME" --url 2>/dev/null || echo "")
  DB_TOKEN=$($TURSO db tokens create "$DB_NAME" 2>/dev/null | tail -1 || echo "")
  if [ -n "$DB_URL" ]; then
    export DATABASE_URL="$DB_URL"
    export TURSO_AUTH_TOKEN="${DB_TOKEN:-$TURSO_ACCESS_TOKEN}"
    npx prisma db push 2>/dev/null || true
    npx tsx prisma/seed.ts 2>/dev/null || true
  fi
fi

AUTH_SECRET=$(openssl rand -hex 32)

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production --force 2>/dev/null || \
  printf '%s' "$2" | npx vercel env add "$1" production 2>/dev/null || true
}

add_env AUTH_SECRET "$AUTH_SECRET"
add_env ADMIN_EMAIL "admin@myqr.com"
add_env ADMIN_PASSWORD "MyQR2026!Secure"
add_env ADMIN_NAME "myQR Admin"

if [ -n "${DATABASE_URL:-}" ]; then
  add_env DATABASE_URL "$DATABASE_URL"
  add_env TURSO_AUTH_TOKEN "${TURSO_AUTH_TOKEN:-}"
fi

# Deploy URL will be set after first deploy
add_env NEXT_PUBLIC_APP_URL "https://myqr.vercel.app"

npx vercel deploy --prod --yes

echo ""
echo "Deploy tamamlandı. URL için: npx vercel ls"
