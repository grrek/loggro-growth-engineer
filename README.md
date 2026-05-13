# Loggro Growth Engineer — Microsite del reto VE-1770

Microsite estático Astro para el reto técnico de la vacante [VE-1770: Growth Engineer — Automatización & IA](https://loggro.atlassian.net/browse/VE-1770).

**URL en producción:** https://labs.loggro.com/growth-engineer

## Stack

- **Astro 5** (output estático, `format: 'file'`, sin trailing slash)
- **Tailwind 3** + tokens custom
- **React** para islands (`client:idle` / `client:load`) en componentes interactivos: Terminal, CommandPalette, KonamiOverlay, ClaudeFM, Header, ShortcutsModal, ScrollProgress
- **lucide-react** para iconografía
- Base path: `/growth-engineer` (configurado en `astro.config.mjs`)

## Páginas

| Ruta | Archivo | Qué es |
|---|---|---|
| `/growth-engineer` | `src/pages/index.astro` | Landing principal con todas las secciones |
| `/growth-engineer/honesty` | `src/pages/honesty.astro` | Página oculta sobre uso honesto de IA |
| `/growth-engineer/team` | `src/pages/team.astro` | Foto del equipo + organigrama |

## Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:4321/growth-engineer
```

El hot reload funciona en todos los componentes Astro y React. Logs en `/tmp/astro-dev.log` si arrancaste con `nohup`.

## Build

```bash
npx astro build
# Genera dist/ con paths bajo /growth-engineer
```

Nota: `npm run build` corre `astro check` antes, y hoy tiene 6 errores de tipos de lucide-react preexistentes (`class` vs `className`) que no son bloqueantes. Por eso el script de deploy usa `npx astro build` directo.

## Deploy a producción

Un solo comando:

```bash
./scripts/deploy.sh
```

Internamente hace:
1. `npx astro build` → genera `dist/`
2. `rsync -avz --delete dist/ loggro-labs:~/apps/caddy/site/growth-engineer/`
3. `ssh loggro-labs 'docker exec caddy caddy reload --config /etc/caddy/Caddyfile'`
4. Verifica `https://labs.loggro.com/growth-engineer` con `curl`

### Configuración Caddy (una sola vez, ya hecha)

El container `caddy` en `loggro-labs` tiene este bloque en `~/apps/caddy/Caddyfile`:

```caddyfile
handle_path /growth-engineer* {
    root * /usr/share/caddy/growth-engineer
    try_files {path}.html {path} {path}/index.html /index.html
    file_server
}
```

`handle_path` strippea el prefix `/growth-engineer` de la URL y busca el archivo bajo `/usr/share/caddy/growth-engineer/`. El bind mount del host es `/home/garistizabal/apps/caddy/site/` → `/usr/share/caddy/`.

`try_files` resuelve en orden: archivo exacto → `.html` (para URLs sin extensión como `/growth-engineer/team`) → `index.html` de directorio → fallback a `/index.html`.

### Stack web de labs.loggro.com (referencia)

```
Internet → NPM (Nginx Proxy Manager en host, TLS Let's Encrypt)
         → container caddy (port 80)
            ├─ file_server desde /usr/share/caddy/
            ├─ /growth-engineer* → este sitio
            ├─ /chat/*           → LibreChat SPA
            ├─ /auth*            → Keycloak
            ├─ /talento360*      → talento360-app:3000
            ├─ /llm_broker/*     → llm-broker:3000
            └─ /restobar/*       → restobar-app:3000
```

### Rollback rápido

Si un deploy rompe algo:

```bash
ssh loggro-labs 'ls -t ~/apps/caddy/Caddyfile.bak.* | head -1'
# Usá el más reciente como referencia para revertir.
```

Los backups del Caddyfile se generan automáticamente por convención (`.bak.before-*` o `.bak.YYYYMMDD-HHMMSS`).

Para revertir solo los archivos (no la config):
```bash
ssh loggro-labs 'rm -rf ~/apps/caddy/site/growth-engineer.broken && mv ~/apps/caddy/site/growth-engineer ~/apps/caddy/site/growth-engineer.broken'
# Re-rsync una versión anterior local de dist/
```

## Variables de entorno opcionales

| Var | Para qué | Default |
|---|---|---|
| `PUBLIC_LOOM_URL` | Embed del Loom de bienvenida en RoleSection | vacío (muestra placeholder) |
| `PUBLIC_REPO_URL` | URL del repo template | `https://github.com/grrek/loggro-ai-challenge` |
| `PUBLIC_CONTACT_EMAIL` | Email del líder del rol en Footer + CTAs | `garistizabal@loggro.com` |

Copia `.env.example` a `.env` y rellena lo que aplique.

## Repos relacionados

- **Este repo:** [grrek/loggro-growth-engineer](https://github.com/grrek/loggro-growth-engineer) — código del microsite
- **Repo template del candidato:** [grrek/loggro-ai-challenge](https://github.com/grrek/loggro-ai-challenge) — lo que clona el candidato con `gh repo create --template`

## Personalización + tracking

El microsite saluda por nombre a los candidatos invitados via query param. Sin terceros, sin GA4, sin n8n: solo Caddy logs.

### Cómo invitar a alguien

1. Agregar al candidato en [src/data/candidatos.json](src/data/candidatos.json):
   ```json
   { "code": "cs7", "firstName": "Cristian" }
   ```
2. Re-deploy (`./scripts/deploy.sh`)
3. Mandarle el link: `https://labs.loggro.com/growth-engineer?n=cs7`
4. El sitio lo saluda: "Hola, Cristian." Y cada hit queda registrado con su código.

Si llega sin código o con uno inválido, ve "Hola!" genérico y el hit se registra con `code=none`.

### Qué se trackea

Eventos disparados con `navigator.sendBeacon` a `/growth-engineer/_t?n=<code>&e=<event>&...` (Caddy responde 204 y loggea el hit):

| Evento | Cuándo |
|---|---|
| `view` | Al cargar la página, con `match=1` si el código existe en JSON |
| `scroll` | Al pasar 25%, 50%, 75%, 100% de scroll |
| `hero_cta` | Click en "Empezar el reto" del Hero |
| `accept_cta` | Click en "Aceptar el reto" del Footer (el más importante: indica intención) |
| `video_play` | Cuando arranca el video de bienvenida |
| `exit` | En `pagehide`, con `duration` en segundos y `scroll` final |

### Ver el reporte

```bash
./scripts/track-report.sh                  # último día
./scripts/track-report.sh --since 7d       # 7 días
./scripts/track-report.sh --code cs7       # solo un candidato
./scripts/track-report.sh --raw            # JSON crudo
```

Output esperado:

```
==> Hits por código:
   12 cs7
    5 jh3
    2 none

==> Eventos por tipo:
    8 view
    6 scroll
    3 video_play
    2 accept_cta
```

### Cómo funciona por debajo

- Frontend: [src/lib/track.ts](src/lib/track.ts) hace `navigator.sendBeacon` (no bloquea unload)
- Caddy: bloque `handle /growth-engineer/_t* { respond 204 }` antes del `handle_path` del microsite
- Logs: Caddy loggea todo a stdout en JSON (`log { output stdout; format json }`). El script `track-report.sh` lee `docker logs caddy` con `jq` y filtra por path `/growth-engineer*`

Limitaciones honestas:
- **Docker logs tienen rotación.** Por defecto Docker mantiene 10MB. Después de eso se pierde histórico. Para retención larga, agregar un cron que persista `docker logs --since 1h > archivo` cada hora
- **No hay dashboard visual.** Solo CLI. Si querés UI, podemos plugar Plausible self-hosted después
- **Si el candidato bloquea sendBeacon (raro)**, no se trackea el `exit` pero sí los hits server-side a páginas

### Privacidad

- El JSON de candidatos solo tiene `code + firstName`. Sin email, sin teléfono, sin nada PII más allá del nombre de pila
- IP cliente queda en los logs (estándar HTTP), agregada después de 30 días en compliance con habeas data interno
- No usamos cookies. Solo sessionStorage para mantener el código durante la visita

## Easter eggs y atajos

- `/` o `⌘K` → command palette con búsqueda
- `?` → modal de atajos
- Konami code (↑↑↓↓←→←→BA) → modal sorpresa
- `T` → toggle tema
- `M` → toggle Claude FM
- Hay easter eggs adicionales en el source HTML y en una página oculta. La curiosidad suma.

## Performance

Lighthouse mobile 100/100/100/100. Desktop 99/100/100/100 (último check).

## Licencia

Privado — propiedad de Loggro S.A.S. para uso en el proceso de selección VE-1770.
