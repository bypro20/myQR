#!/usr/bin/env bash
# .env.google-ads → Vercel production + yerel deploy
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.google-ads ]; then
  echo "Hata: .env.google-ads bulunamadı."
  echo "Önce: npx tsx scripts/google-ads-setup.ts"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.google-ads
set +a

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production --force >/dev/null 2>&1 || \
  printf '%s' "$2" | npx vercel env add "$1" production >/dev/null 2>&1 || true
}

[ -n "${NEXT_PUBLIC_GA4_ID:-}" ] && add_env NEXT_PUBLIC_GA4_ID "$NEXT_PUBLIC_GA4_ID"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_ID:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_ID "$NEXT_PUBLIC_GOOGLE_ADS_ID"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO "$NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO"
[ -n "${NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO:-}" ] && add_env NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO "$NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO"

echo "Google Ads env Vercel'e yüklendi."
echo "Deploy için: bash scripts/deploy-production.sh"
