#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${GH_TOKEN:-${GITHUB_TOKEN:-}}" ]; then
  echo "GH_TOKEN veya GITHUB_TOKEN gerekli."
  echo "GitHub → Settings → Developer settings → Personal access tokens"
  exit 1
fi

export PATH="${HOME}/.local/bin:${PATH}"
TOKEN="${GH_TOKEN:-${GITHUB_TOKEN}}"

# Repo yoksa oluştur
if ! git ls-remote "git@github.com:bypro20/myQR.git" &>/dev/null; then
  curl -fsSL -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d '{"name":"myQR","description":"QRBaskı QR kod üretim ve yönetim sistemi","private":false}' \
    >/dev/null
  echo "GitHub repo oluşturuldu: https://github.com/bypro20/myQR"
fi

git remote set-url origin git@github.com:bypro20/myQR.git
git push -u origin main
echo "Push tamamlandı."
