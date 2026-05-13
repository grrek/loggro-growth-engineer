#!/usr/bin/env bash
# Deploy del microsite a labs.loggro.com/reto
# Pre-requisitos: ssh access a loggro-labs (host configurado en ~/.ssh/config)

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( dirname "$SCRIPT_DIR" )"

REMOTE="${LOGGRO_LABS_HOST:-loggro-labs}"
REMOTE_USER="${LOGGRO_LABS_USER:-garistizabal}"
REMOTE_BASE="/home/${REMOTE_USER}/apps/caddy/site/reto"

cd "$ROOT"

echo "==> Build static"
npm run build

if [ ! -d "dist" ]; then
  echo "ERROR: dist/ not found after build"
  exit 1
fi

echo "==> Sync dist/ to ${REMOTE}:${REMOTE_BASE}"
ssh "${REMOTE}" "mkdir -p ${REMOTE_BASE}"
rsync -avz --delete --exclude='.DS_Store' dist/ "${REMOTE}:${REMOTE_BASE}/"

echo "==> Verify Caddy is serving"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://labs.loggro.com/reto/" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "==> OK: https://labs.loggro.com/reto/ responding 200"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "==> WARNING: 404 received. Caddy may need reload."
  echo "    Run on ${REMOTE}: 'cd ~/apps/caddy && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile'"
  echo "    Or: 'cd ~/apps/caddy && docker compose restart caddy'"
else
  echo "==> WARNING: HTTP ${HTTP_CODE}. Investigate."
fi

echo "==> Done"
