import { useEffect, useState } from 'react';
import candidatos from '../data/candidatos.json';
import { readCodeFromUrl, setCode, track, ensureSessionStart } from '../lib/track';

interface Candidato {
  code: string;
  firstName: string;
}

const findCandidato = (code: string): Candidato | null => {
  const c = (candidatos as Candidato[]).find((x) => x.code.toLowerCase() === code.toLowerCase());
  return c ?? null;
};

interface GreetingState {
  text: string;
  matched: boolean;
}

export default function PersonalizedGreeting() {
  const [greeting, setGreeting] = useState<GreetingState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    ensureSessionStart();

    const codeFromUrl = readCodeFromUrl();
    if (codeFromUrl) {
      setCode(codeFromUrl);
      const c = findCandidato(codeFromUrl);
      if (c) {
        setGreeting({ text: `Hola, ${c.firstName}`, matched: true });
        track({ event: 'view', extra: { match: '1' } });
      } else {
        setGreeting({ text: 'Hola!', matched: false });
        track({ event: 'view', extra: { match: '0' } });
      }
    } else {
      setGreeting({ text: 'Hola!', matched: false });
      track({ event: 'view' });
    }

    // Tracking de salida
    const onLeave = () => {
      const start = ensureSessionStart();
      const duration = Math.round((Date.now() - start) / 1000);
      track({
        event: 'exit',
        extra: {
          duration,
          scroll: String(Math.round(window.scrollY + window.innerHeight)),
          height: String(document.documentElement.scrollHeight),
        },
      });
    };

    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  // No render until mounted (SSR-safe, evita flash con saludo equivocado).
  // Reservamos el alto del saludo grande para evitar layout shift en match.
  if (!mounted || !greeting) {
    return <div aria-hidden="true" className="mb-4 h-7 md:h-10 opacity-0" />;
  }

  if (greeting.matched) {
    return (
      <p className="mb-4 animate-fade-in text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
        <span className="text-brand-primary-text text-glow-primary">{greeting.text}.</span>
      </p>
    );
  }

  return (
    <p className="font-pixel text-[11px] uppercase tracking-widest text-brand-primary-text mb-4 animate-fade-in">
      {greeting.text}
    </p>
  );
}
