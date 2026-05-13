import { useEffect } from 'react';
import { track, readCodeFromUrl, getCode } from '../lib/track';
import candidatos from '../data/candidatos.json';

interface Candidato {
  code: string;
  firstName: string;
}

const findCandidato = (code: string | null): Candidato | null => {
  if (!code) return null;
  return (candidatos as Candidato[]).find((x) => x.code.toLowerCase() === code.toLowerCase()) || null;
};

// Listener global que captura:
// - Clicks en elementos con [data-track="<event_name>"]
// - Play de cualquier <video> en la página (1 vez por sesión por video)
// - Scroll milestones 25/50/75/100% (1 vez por milestone)
//
// Y además personaliza elementos del DOM marcados con:
// - [data-personalize="mailto"]   → reescribe el mailto subject+body con nombre
// - [data-personalize="self"]     → reemplaza "Tú" o "{name}" en el texto
// - [data-personalize="greet"]    → prefija saludo "{name}," cuando hay match
// - [data-personalize="farewell"] → reemplaza placeholder con cierre + nombre

export default function TrackingListener() {
  useEffect(() => {
    // 1. Personalización del DOM si hay code matched
    const code = readCodeFromUrl() || getCode();
    const candidato = findCandidato(code);

    if (candidato) {
      personalizeDOM(candidato);
    }

    // 2. Tracking listeners (siempre activos)
    const playedVideos = new Set<string>();
    const firedMilestones = new Set<number>();

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trackable = target.closest('[data-track]') as HTMLElement | null;
      if (!trackable) return;
      const event = trackable.dataset.track;
      if (!event) return;
      track({
        event,
        extra: {
          label: trackable.dataset.trackLabel || trackable.textContent?.trim().slice(0, 40) || '',
        },
      });
    };

    const onPlay = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      const id = v.currentSrc || v.src || 'video';
      if (playedVideos.has(id)) return;
      playedVideos.add(id);
      track({
        event: 'video_play',
        extra: { src: id.split('/').pop() || 'video' },
      });
    };

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.round((window.scrollY / h) * 100);
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !firedMilestones.has(m)) {
          firedMilestones.add(m);
          track({ event: 'scroll', extra: { depth: m } });
        }
      }
    };

    document.addEventListener('click', onClick, { capture: true });
    document.addEventListener('play', onPlay, { capture: true });
    let scrollTimer: number | undefined;
    const throttledScroll = () => {
      if (scrollTimer) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = undefined;
        onScroll();
      }, 200);
    };
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      document.removeEventListener('play', onPlay, { capture: true });
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  return null;
}

function personalizeDOM(c: Candidato): void {
  const name = c.firstName;

  // 1. Mailto subject + body
  document.querySelectorAll<HTMLAnchorElement>('a[data-personalize="mailto"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('mailto:')) return;
    const [base, qs] = href.split('?');
    const params = new URLSearchParams(qs || '');
    const subject = `VE-1770: ${name} acepta el reto`;
    const body = `Hola, equipo Loggro:\n\nSoy ${name}. Confirmo que recibí las instrucciones del reto VE-1770. El reloj ya está corriendo.\n\nTrack que elijo:\n\nLink a mi repo:\n\nGracias,\n${name}`;
    params.set('subject', subject);
    params.set('body', body);
    a.setAttribute('href', `${base}?${params.toString()}`);
  });

  // 2. "Tú, si llegas al rol" → "{name}, si llegas al rol"
  document.querySelectorAll<HTMLElement>('[data-personalize="self"]').forEach((el) => {
    const tpl = el.dataset.personalizeTemplate || `${name}, si llegas al rol`;
    el.textContent = tpl.replace(/\{name\}/g, name);
  });

  // 3. Greet: prefija saludo en una sección
  document.querySelectorAll<HTMLElement>('[data-personalize="greet"]').forEach((el) => {
    const tpl = el.dataset.personalizeTemplate || `${name}, esto va para vos.`;
    el.textContent = tpl.replace(/\{name\}/g, name);
    el.style.opacity = '1';
  });

  // 4. Farewell: reemplaza placeholder con cierre
  document.querySelectorAll<HTMLElement>('[data-personalize="farewell"]').forEach((el) => {
    const tpl = el.dataset.personalizeTemplate || `Si llegaste hasta acá, ${name}, ya nos gustas un poco.`;
    el.textContent = tpl.replace(/\{name\}/g, name);
    el.style.opacity = '1';
  });
}
