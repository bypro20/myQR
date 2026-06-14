#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production --force >/dev/null 2>&1 || \
  printf '%s' "$2" | npx vercel env add "$1" production >/dev/null 2>&1 || true
}

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
fi

if [ -f .env.turso ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.turso
  set +a
fi

TOKEN="$(grep '^TURSO_API_TOKEN=' .env.turso 2>/dev/null | cut -d= -f2- || true)"
if [ -n "$TOKEN" ]; then
  DB_NAME="myqr-bypro20"
  TURSO="$HOME/.turso/turso"
  curl -sS -X POST "https://api.turso.tech/v1/databases" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$DB_NAME\",\"group\":\"default\"}" >/dev/null 2>&1 || true
  DB_URL="$(curl -sS -H "Authorization: Bearer $TOKEN" "https://api.turso.tech/v1/databases" | python3 -c "import sys,json; d=json.load(sys.stdin); print(next((x['Hostname'] for x in d.get('databases',[]) if x.get('Name')=='myqr-bypro20'), ''))" 2>/dev/null)"
  if [ -n "$DB_URL" ]; then
    export DATABASE_URL="libsql://${DB_URL}"
    DB_TOKEN="$(curl -sS -X POST "https://api.turso.tech/v1/databases/myqr-bypro20/auth/tokens" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('jwt',''))" 2>/dev/null)"
    export TURSO_AUTH_TOKEN="${DB_TOKEN:-$TURSO_AUTH_TOKEN}"
    npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script 2>/dev/null | grep -v '^Loaded' > /tmp/myqr-schema.sql
    set -a; export DATABASE_URL TURSO_AUTH_TOKEN; set +a
    npx tsx scripts/apply-schema.ts /tmp/myqr-schema.sql
    npx tsx scripts/apply-schema.ts scripts/patch-platform-admin.sql
    npx tsx scripts/apply-schema.ts scripts/patch-unlimited-credits.sql
    npx tsx scripts/apply-schema.ts scripts/patch-activity-log.sql
    npx tsx scripts/apply-schema.ts scripts/patch-qr-duration.sql
    npm run db:seed
  fi
fi

[ -n "${AUTH_SECRET:-}" ] && add_env AUTH_SECRET "$AUTH_SECRET"
[ -n "${DATABASE_URL:-}" ] && add_env DATABASE_URL "$DATABASE_URL"
[ -n "${TURSO_AUTH_TOKEN:-}" ] && add_env TURSO_AUTH_TOKEN "$TURSO_AUTH_TOKEN"
add_env ADMIN_EMAIL "${ADMIN_EMAIL:-admin@myqr.com}"
add_env ADMIN_PASSWORD "${ADMIN_PASSWORD:-MyQR2026!Secure}"
add_env ADMIN_NAME "${ADMIN_NAME:-myQR Admin}"
add_env NEXT_PUBLIC_APP_URL "${NEXT_PUBLIC_APP_URL:-https://myqar.net}"
add_env PAYMENT_MODE "${PAYMENT_MODE:-live}"
add_env PAYMENT_PROVIDER "${PAYMENT_PROVIDER:-fast_transfer}"
add_env PAYMENT_IBAN "${PAYMENT_IBAN:-TR290006701000000097199493}"
add_env PAYMENT_ACCOUNT_NAME "${PAYMENT_ACCOUNT_NAME:-Uğur Öncan}"
add_env PAYMENT_BANK_NAME "${PAYMENT_BANK_NAME:-Yapı Kredi}"
add_env COMPANY_LEGAL_NAME "${COMPANY_LEGAL_NAME:-Uğur Öncan}"
add_env COMPANY_TRADE_NAME "${COMPANY_TRADE_NAME:-myQR}"
add_env COMPANY_TYPE "${COMPANY_TYPE:-sole}"
add_env COMPANY_TAX_ID "${COMPANY_TAX_ID:-6230147892}"
add_env COMPANY_ADDRESS "${COMPANY_ADDRESS:-Atatürk Mah. Ertuğrul Gazi Sok. No:12/3 Ataşehir / İstanbul}"
add_env COMPANY_CITY "${COMPANY_CITY:-İstanbul}"
add_env COMPANY_COUNTRY "${COMPANY_COUNTRY:-Türkiye}"
add_env COMPANY_EMAIL "${COMPANY_EMAIL:-destek@myqr.com}"
add_env COMPANY_PHONE "${COMPANY_PHONE:-0505 123 68 24}"
add_env COMPANY_WHATSAPP "${COMPANY_WHATSAPP:-905051236824}"
[ -n "${COMPANY_MERSIS:-}" ] && add_env COMPANY_MERSIS "$COMPANY_MERSIS"
[ -n "${COMPANY_KEP:-}" ] && add_env COMPANY_KEP "$COMPANY_KEP"
[ -n "${POSNET_MID:-}" ] && add_env POSNET_MID "$POSNET_MID"
[ -n "${POSNET_TID:-}" ] && add_env POSNET_TID "$POSNET_TID"
[ -n "${POSNET_ID:-}" ] && add_env POSNET_ID "$POSNET_ID"
[ -n "${POSNET_ENC_KEY:-}" ] && add_env POSNET_ENC_KEY "$POSNET_ENC_KEY"
[ -n "${POSNET_TEST_MODE:-}" ] && add_env POSNET_TEST_MODE "$POSNET_TEST_MODE"
[ -n "${IYZICO_API_KEY:-}" ] && add_env IYZICO_API_KEY "$IYZICO_API_KEY"
[ -n "${IYZICO_SECRET_KEY:-}" ] && add_env IYZICO_SECRET_KEY "$IYZICO_SECRET_KEY"
[ -n "${IYZICO_SANDBOX:-}" ] && add_env IYZICO_SANDBOX "$IYZICO_SANDBOX"
add_env GOOGLE_SITE_VERIFICATION "${GOOGLE_SITE_VERIFICATION:-WgO7_amXLy5Lv6DGei_x5PL3EEsAQxrXbkDeDVd3OR8}"
[ -n "${BING_SITE_VERIFICATION:-}" ] && add_env BING_SITE_VERIFICATION "$BING_SITE_VERIFICATION"
[ -n "${NEXT_PUBLIC_GA4_ID:-}" ] && add_env NEXT_PUBLIC_GA4_ID "$NEXT_PUBLIC_GA4_ID"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_ID:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_ID "$NEXT_PUBLIC_GOOGLE_ADS_ID"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO "$NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO "$NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO"

npx vercel deploy --prod --yes

echo "Deploy tamamlandı."
echo "SEO: Google/Bing sitemap gönderiliyor..."
sleep 8
npx tsx scripts/seo-submit.ts || true
