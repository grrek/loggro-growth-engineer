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

  // Reserva un alto para no causar layout shift entre estados.
  if (!mounted || !greeting) {
    return <div aria-hidden="true" className="mb-6 h-5 md:h-6 opacity-0" />;
  }

  if (greeting.matched) {
    return (
      <p className="mb-6 animate-fade-in font-pixel text-base md:text-2xl lg:text-3xl uppercase tracking-widest text-brand-primary-text text-glow-primary leading-relaxed">
        <span aria-hidden="true">{'> '}</span>
        {greeting.text.toUpperCase()}.
        <span className="animate-blink ml-1">█</span>
      </p>
    );
  }

  return (
    <p className="mb-6 animate-fade-in font-pixel text-sm md:text-base uppercase tracking-widest text-brand-primary-text leading-relaxed">
      <span aria-hidden="true">{'> '}</span>
      {greeting.text}
      <span className="animate-blink ml-1">█</span>
    </p>
  );
}
