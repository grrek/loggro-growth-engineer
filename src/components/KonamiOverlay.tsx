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

export default function KonamiOverlay() {
  const [open, setOpen] = useState(false);
  const [buffer, setBuffer] = useState<string[]>([]);

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
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mensaje secreto"
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/85 backdrop-blur"
      onClick={() => setOpen(false)}
    >
      <div
        className="max-w-xl w-full bg-surface text-fg rounded-xl border-2 border-brand-primary p-8 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <pre className="text-brand-primary text-xs leading-tight mb-6 font-mono whitespace-pre overflow-x-auto">{`
   __  ___                    __                  __
  /  |/  /__ ___  ___ ___  __ _\\ \\ ____  __ __ ___\\ \\
 / /|_/ / -_) _ \\(_-</ _ \\/  \` |\\__ \\ _ \\/  ' \\__/ _ \\
/_/  /_/\\__/_//_/___/\\___/\\__,_|___/.__/_/_/_/___/\\___/

`}</pre>

        <h2 className="text-2xl font-bold mb-3">Bien jugado.</h2>
        <p className="text-fg-muted mb-4 leading-relaxed">
          Si llegaste a este punto, vos pones atencion a los detalles. Bienvenido al club.
        </p>
        <p className="text-fg-muted mb-6 leading-relaxed">
          Como reconocimiento: si terminas el reto y pasas el threshold, te invitamos a una llamada con Edison Castro y Grego del 30 min sin agenda formal. Hablamos de lo que vos quieras: como pensamos la arquitectura de Loggro, como vemos el futuro de la IA en B2B colombiano, o por que el contador es el cliente mas interesante del mundo.
        </p>
        <p className="text-xs text-fg-subtle font-mono mb-6">
          Para reclamarlo, mencionar este Easter egg en tu Loom de Apendice. Asi sabemos que llegaste sin spoiler.
        </p>
        <button
          onClick={() => setOpen(false)}
          className="w-full px-5 py-3 bg-brand-primary text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
        >
          Seguir con el reto
        </button>
      </div>
    </div>
  );
}
