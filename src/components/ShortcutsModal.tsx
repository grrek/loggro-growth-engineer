import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['/'], desc: 'Abrir command palette' },
  { keys: ['Cmd', 'K'], desc: 'Abrir command palette (alternativa)' },
  { keys: ['T'], desc: 'Cambiar tema claro / oscuro' },
  { keys: ['M'], desc: 'Encender / apagar Claude FM' },
  { keys: ['?'], desc: 'Abrir esta lista de atajos' },
  { keys: ['Esc'], desc: 'Cerrar modal abierto' },
];

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      if (e.key === '?' && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('shortcuts:open', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('shortcuts:open', onOpenEvent);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atajos de teclado"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg bg-surface border-2 border-fg shadow-pixel-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-fg bg-surface-alt">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-fg" />
            <p className="font-pixel text-[11px] uppercase tracking-widest">Atajos</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar atajos"
            className="p-1 hover:bg-fg hover:text-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <p className="font-pixel text-[10px] uppercase tracking-widest text-fg-subtle mb-4">
            {'> '} ATAJOS DE TECLADO
          </p>
          <ul className="space-y-3">
            {SHORTCUTS.map((s) => (
              <li key={s.desc} className="flex justify-between items-center gap-4">
                <span className="text-sm text-fg font-sans">{s.desc}</span>
                <div className="flex gap-1 shrink-0">
                  {s.keys.map((k, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-fg-subtle mx-1">+</span>}
                      <kbd className="px-1.5 py-0.5 border-2 border-fg bg-surface-alt font-pixel text-[10px] uppercase">
                        {k}
                      </kbd>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-3 border-t-2 border-fg bg-surface-alt text-[10px] font-mono text-fg-subtle text-center">
          esc para cerrar
        </div>
      </div>
    </div>
  );
}
