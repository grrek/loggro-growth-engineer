// Tracking minimalista: dispara un beacon a /growth-engineer/_t que Caddy loggea
// (200 OK respond 204). Cero infra nueva, cero terceros.

const TRACK_ENDPOINT = '/growth-engineer/_t';
const SESSION_KEY = 'growth-engineer:code';
const SESSION_START = 'growth-engineer:session_start';

export function getCode(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
}

export function setCode(code: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, code);
  } catch {
    /* noop */
  }
}

export function readCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('n');
}

export function ensureSessionStart(): number {
  try {
    const existing = sessionStorage.getItem(SESSION_START);
    if (existing) return parseInt(existing, 10);
    const now = Date.now();
    sessionStorage.setItem(SESSION_START, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

interface TrackParams {
  event: string;
  extra?: Record<string, string | number>;
}

export function track({ event, extra = {} }: TrackParams): void {
  if (typeof window === 'undefined') return;

  const code = getCode();
  const params = new URLSearchParams({
    e: event,
    p: window.location.pathname,
    ts: String(Date.now()),
  });
  if (code) params.set('n', code);
  for (const [k, v] of Object.entries(extra)) {
    params.set(k, String(v));
  }

  const url = `${TRACK_ENDPOINT}?${params.toString()}`;

  // sendBeacon es fire-and-forget, no bloquea ni en unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    // fallback: fetch keepalive
    fetch(url, { method: 'GET', keepalive: true, mode: 'no-cors' }).catch(() => { /* noop */ });
  }
}
