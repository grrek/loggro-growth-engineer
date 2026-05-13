#!/usr/bin/env bash
# Deploy del microsite a labs.loggro.com/growth-engineer
# Pre-requisitos: ssh access a loggro-labs (host configurado en ~/.ssh/config)

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( dirname "$SCRIPT_DIR" )"

REMOTE="${LOGGRO_LABS_HOST:-loggro-labs}"
REMOTE_USER="${LOGGRO_LABS_USER:-garistizabal}"
SUBPATH="${MICROSITE_SUBPATH:-growth-engineer}"
REMOTE_BASE="/home/${REMOTE_USER}/apps/caddy/site/${SUBPATH}"

cd "$ROOT"

echo "==> Build static (skipping astro check)"
npx astro build

if [ ! -d "dist" ]; then
  echo "ERROR: dist/ not found after build"
  exit 1
fi

echo "==> Sync dist/ to ${REMOTE}:${REMOTE_BASE}"
ssh "${REMOTE}" "mkdir -p ${REMOTE_BASE}"
rsync -avz --delete --exclude='.DS_Store' dist/ "${REMOTE}:${REMOTE_BASE}/"

echo "==> Reload Caddy on ${REMOTE}"
ssh "${REMOTE}" 'sudo -n docker exec caddy caddy reload --config /etc/caddy/Caddyfile' || \
  echo "    (reload no necesario si solo cambiaron assets; rsync ya alcanza)"

echo "==> Verify Caddy is serving"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://labs.loggro.com/${SUBPATH}" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "==> OK: https://labs.loggro.com/${SUBPATH} responding 200"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "==> WARNING: 404 received. Verificar que el bloque handle_path /${SUBPATH}* exista en ~/apps/caddy/Caddyfile en loggro-labs."
else
  echo "==> WARNING: HTTP ${HTTP_CODE}. Investigate."
fi

echo "==> Done"
