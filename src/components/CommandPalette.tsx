import { useEffect, useRef, useState } from 'react';

interface Command {
  label: string;
  shortcut?: string;
  action: () => void;
  group: 'nav' | 'extras' | 'secret';
}

const buildCommands = (): Command[] => [
  { label: 'Ir al Hero', group: 'nav', action: () => scrollTo('#top') },
  { label: 'Ir a El rol', group: 'nav', action: () => scrollTo('#rol') },
  { label: 'Ir a Los 4 tracks', group: 'nav', action: () => scrollTo('#reto') },
  { label: 'Ir a Qué recibes', group: 'nav', action: () => scrollTo('#lo-que-recibis') },
  { label: 'Ir a El espíritu', group: 'nav', action: () => scrollTo('#espiritu') },
  { label: 'Ir a Cómo evaluamos', group: 'nav', action: () => scrollTo('#evaluacion') },
  { label: 'Ir a FAQ', group: 'nav', action: () => scrollTo('#faq') },
  {
    label: 'Abrir repo template en GitHub',
    group: 'extras',
    action: () => window.open('https://github.com/grrek/loggro-ai-challenge', '_blank'),
  },
  {
    label: 'Escribir al líder del rol',
    group: 'extras',
    action: () => (window.location.href = 'mailto:garistizabal@loggro.com?subject=VE-1770: acepto el reto'),
  },
  {
    label: 'Toggle tema (claro/oscuro)',
    shortcut: 'T',
    group: 'extras',
    action: () => {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    },
  },
  {
    label: 'Activar Claude FM (música ambient)',
    group: 'extras',
    action: () => window.dispatchEvent(new CustomEvent('claudefm:open')),
  },
  { label: 'Página secreta: AI Audit honesty', group: 'secret', action: () => (window.location.href = '/reto/honesty') },
  { label: 'Página secreta: nuestro equipo', group: 'secret', action: () => (window.location.href = '/reto/team') },
];

const scrollTo = (sel: string) => {
  if (sel === '#top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const allCommands = buildCommands();

  const filtered = allCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

      if (!open && e.key === '/' && !inInput) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (!open && (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        return;
      }
      if (open && e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (open && e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (open && e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[activeIndex];
        if (cmd) {
          cmd.action();
          setOpen(false);
          setQuery('');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, activeIndex, filtered]);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const groups: Array<Command['group']> = ['nav', 'extras', 'secret'];
  const groupLabels: Record<Command['group'], string> = {
    nav: 'Navegación',
    extras: 'Acciones',
    secret: 'Secretos',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      <div className="w-full max-w-xl bg-surface text-fg rounded-xl border border-line shadow-2xl overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          placeholder="¿Qué quieres hacer? (escribe para filtrar)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          className="w-full px-5 py-4 text-base bg-transparent border-b border-line outline-none placeholder:text-fg-subtle"
          aria-label="Buscar comando"
        />
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-5 py-4 text-sm text-fg-muted">Sin resultados.</p>
          ) : (
            groups.map((g) => {
              const items = filtered.filter((c) => c.group === g);
              if (items.length === 0) return null;
              return (
                <div key={g} className="mb-2">
                  <p className="px-5 pt-2 pb-1 text-[10px] uppercase tracking-wider text-fg-subtle font-mono font-semibold">
                    {groupLabels[g]}
                  </p>
                  {items.map((cmd) => {
                    const globalIdx = filtered.indexOf(cmd);
                    const isActive = globalIdx === activeIndex;
                    return (
                      <button
                        key={cmd.label}
                        onClick={() => {
                          cmd.action();
                          setOpen(false);
                          setQuery('');
                        }}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-5 py-2.5 text-sm flex justify-between items-center transition-colors ${
                          isActive ? 'bg-brand-primary/10 text-brand-primary-text' : 'hover:bg-surface-alt'
                        }`}
                      >
                        <span>{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded border border-line bg-surface-alt text-xs font-mono">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="px-5 py-3 border-t border-line bg-surface-alt text-xs text-fg-subtle font-mono flex justify-between">
          <span>flechas para navegar, enter para abrir</span>
          <span>esc para cerrar</span>
        </div>
      </div>
    </div>
  );
}
