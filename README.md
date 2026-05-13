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
