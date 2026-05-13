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

export default function PersonalizedGreeting() {
  const [greeting, setGreeting] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    ensureSessionStart();

    const codeFromUrl = readCodeFromUrl();
    if (codeFromUrl) {
      setCode(codeFromUrl);
      const c = findCandidato(codeFromUrl);
      if (c) {
        setGreeting(`Hola, ${c.firstName}.`);
        track({ event: 'view', extra: { match: '1' } });
      } else {
        setGreeting('Hola!');
        track({ event: 'view', extra: { match: '0' } });
      }
    } else {
      setGreeting('Hola!');
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

  // No render until mounted (SSR-safe, evita flash con saludo equivocado)
  if (!mounted || !greeting) {
    return (
      <p
        aria-hidden="true"
        className="font-pixel text-[11px] uppercase tracking-widest text-brand-primary-text mb-4 opacity-0"
      >
        Hola.
      </p>
    );
  }

  return (
    <p className="font-pixel text-[11px] uppercase tracking-widest text-brand-primary-text mb-4 animate-fade-in">
      {greeting}
    </p>
  );
}
