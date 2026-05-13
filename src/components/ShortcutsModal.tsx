import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['/', 'Cmd', 'K'], desc: 'Abrir Command Palette' },
  { keys: ['T'], desc: 'Cambiar tema claro / oscuro (desde palette)' },
  { keys: ['?'], desc: 'Abrir esta lista de shortcuts' },
  { keys: ['Esc'], desc: 'Cerrar modales abiertos' },
];

const SECRETS = [
  { name: 'Konami code', keys: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'], desc: 'Achievement unlocked' },
  { name: 'View source', keys: ['Cmd', 'U'], desc: 'Hay un comment escondido al final del body' },
  { name: 'Ruta secreta', keys: ['/honesty'], desc: 'Página con ejemplos buenos y malos de AI Audit Log' },
  { name: 'Ruta secreta', keys: ['/team'], desc: 'Conoce al equipo de Marketing y Growth' },
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
            {'> '} TECLADO
          </p>
          <ul className="space-y-3 mb-8">
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

          <p className="font-pixel text-[10px] uppercase tracking-widest text-brand-primary-text mb-4">
            {'> '} SECRETOS
          </p>
          <ul className="space-y-3">
            {SECRETS.map((s, idx) => (
              <li key={idx} className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold font-sans">{s.name}</p>
                  <p className="text-xs text-fg-muted font-sans mt-0.5">{s.desc}</p>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap justify-end max-w-[180px]">
                  {s.keys.map((k, i) => (
                    <kbd key={i} className="px-1.5 py-0.5 border-2 border-fg bg-surface-alt font-pixel text-[9px] uppercase">
                      {k}
                    </kbd>
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
