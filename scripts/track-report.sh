#!/usr/bin/env bash
# Reporte de tracking del microsite — lee Caddy logs en loggro-labs
# y muestra resumen por código de candidato.
#
# Uso:
#   ./scripts/track-report.sh                 # último día
#   ./scripts/track-report.sh --since 7d      # últimos 7 días
#   ./scripts/track-report.sh --code cs7      # solo un código
#   ./scripts/track-report.sh --raw           # JSON crudo, sin formatear
#
# Requiere: ssh access a loggro-labs + jq local

set -euo pipefail

REMOTE="${LOGGRO_LABS_HOST:-loggro-labs}"
SINCE="1d"
CODE_FILTER=""
RAW=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --since) SINCE="$2"; shift 2 ;;
    --code) CODE_FILTER="$2"; shift 2 ;;
    --raw) RAW=1; shift ;;
    *) echo "Opción desconocida: $1"; exit 1 ;;
  esac
done

echo "==> Leyendo logs de caddy en ${REMOTE} (últimos ${SINCE})..."

# Filtramos hits a /growth-engineer/_t* y a las páginas html
RAW_LOGS=$(ssh "${REMOTE}" "sudo -n docker logs --since ${SINCE} caddy 2>&1" 2>/dev/null | \
  grep -E '"uri":"/growth-engineer' || echo "")

if [ -z "$RAW_LOGS" ]; then
  echo "Sin actividad en el rango."
  exit 0
fi

if [ "$RAW" = "1" ]; then
  echo "$RAW_LOGS"
  exit 0
fi

# Parsear con jq: extraer ts, uri, client_ip
PARSED=$(echo "$RAW_LOGS" | jq -c '
  {
    ts: (.ts | strftime("%Y-%m-%d %H:%M:%S")),
    uri: .request.uri,
    ip: (.request.headers."X-Real-Ip"[0] // .request.remote_ip),
    ua: (.request.headers."User-Agent"[0] // "")
  } |
  .code = (.uri | capture("[?&]n=(?<v>[^&]+)").v // "none") |
  .event = (.uri | capture("[?&]e=(?<v>[^&]+)").v // "page") |
  .path = (.uri | split("?")[0])
')

if [ -n "$CODE_FILTER" ]; then
  PARSED=$(echo "$PARSED" | jq -c "select(.code == \"${CODE_FILTER}\")")
fi

if [ -z "$PARSED" ]; then
  echo "Sin actividad para el filtro."
  exit 0
fi

echo ""
echo "==> Hits por código:"
echo "$PARSED" | jq -r '.code' | sort | uniq -c | sort -rn

echo ""
echo "==> Eventos por tipo:"
echo "$PARSED" | jq -r '.event' | sort | uniq -c | sort -rn

echo ""
echo "==> Últimos 20 eventos (cronológico):"
echo "$PARSED" | jq -sr 'sort_by(.ts) | .[-20:] | .[] |
  "\(.ts) | \(.code | .[0:8] | ascii_downcase) | \(.event | .[0:12]) | \(.path)"
' | column -t -s '|'

echo ""
echo "==> Para JSON crudo: $0 --raw"
echo "==> Para un código:  $0 --code <code>"
