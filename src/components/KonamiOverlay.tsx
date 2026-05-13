import { useEffect, useState } from 'react';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const ASCII_ART = `
   __                                  _
  / /  ___   __ _   __ _ _ __ ___    | |
 / /  / _ \\ / _\` | / _\` | '__/ _ \\   | |
/ /__| (_) | (_| || (_| | | | (_) |  |_|
\\____/\\___/ \\__, | \\__, |_|  \\___/   (_)
            |___/  |___/
`;

export default function KonamiOverlay() {
  const [open, setOpen] = useState(false);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      setBuffer((b) => {
        const next = [...b, key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          setOpen(true);
          return [];
        }
        // Show progress hint at >=4 arrows correct
        const arrowsCorrect = next.slice(0, 4).every((k, i) => k === KONAMI[i]);
        if (arrowsCorrect && next.length >= 4 && next.length < 10) {
          setShowHint(true);
          setTimeout(() => setShowHint(false), 1500);
        }
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Subtle progress hint */}
      {showHint && !open && (
        <div
          aria-hidden="true"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95] font-mono text-xs text-brand-primary animate-fade-in pointer-events-none"
          style={{ textShadow: '0 0 12px rgba(231, 94, 30, 0.6)' }}
        >
          {'> '}vas bien<span className="animate-blink">_</span>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mensaje secreto"
          className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/90 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div
            className="crt-scanlines max-w-2xl w-full bg-black text-green-400 rounded-xl border-2 border-brand-primary p-8 md:p-10 shadow-2xl animate-fade-in font-mono relative overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(231, 94, 30, 0.4), 0 0 120px rgba(231, 94, 30, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <pre className="text-brand-primary text-[10px] md:text-xs leading-tight mb-6 whitespace-pre overflow-x-auto select-none relative z-10">
              {ASCII_ART}
            </pre>

            <p className="text-xs uppercase tracking-widest mb-3 text-brand-primary font-pixel relative z-10">
              {'> '}ACHIEVEMENT UNLOCKED
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white relative z-10">Bien jugado.</h2>
            <p className="text-green-300/80 mb-4 leading-relaxed relative z-10">
              Si llegaste hasta este punto, pones atención a los detalles. Bienvenido al club de los curiosos.
            </p>
            <p className="text-green-300/80 mb-6 leading-relaxed relative z-10">
              Si quieres, menciona este easter egg en tu entrevista. Así sabemos que llegaste hasta acá sin que nadie te lo soplara, y nos da gusto saberlo.
            </p>
            <p className="text-xs text-green-300/50 mb-6 relative z-10">
              {'> '}no hay premio material. solo el guiño.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="w-full px-5 py-3 bg-brand-primary text-white rounded-md font-semibold hover:opacity-90 transition-opacity glow-primary relative z-10"
            >
              Seguir con el reto
            </button>
          </div>
        </div>
      )}
    </>
  );
}
