import { useEffect, useState } from 'react';
import { Sun, Moon, Headphones, HeadphoneOff, Search, Keyboard } from 'lucide-react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [audioOn, setAudioOn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
    try {
      setAudioOn(sessionStorage.getItem('claude-fm-active') === 'true');
    } catch {
      /* noop */
    }
  }, []);

  // Sincronizar audioOn cuando ClaudeFM cambia su estado
  useEffect(() => {
    const onChange = () => {
      try {
        setAudioOn(sessionStorage.getItem('claude-fm-active') === 'true');
      } catch {
        /* noop */
      }
    };
    window.addEventListener('claudefm:changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('claudefm:changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleAudio = () => {
    if (audioOn) {
      window.dispatchEvent(new CustomEvent('claudefm:close'));
    } else {
      window.dispatchEvent(new CustomEvent('claudefm:open'));
    }
    // Optimistic update; ClaudeFM will fire claudefm:changed
    setAudioOn(!audioOn);
  };

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('palette:open'));
  };

  const openShortcuts = () => {
    window.dispatchEvent(new CustomEvent('shortcuts:open'));
  };

  if (!mounted) {
    return (
      <header className="fixed top-3 right-3 md:top-4 md:right-4 z-50 flex gap-2" aria-hidden="true">
        <div className="w-11 h-11" />
        <div className="w-11 h-11" />
        <div className="w-11 h-11" />
        <div className="w-11 h-11" />
      </header>
    );
  }

  const baseBtn =
    'w-11 h-11 grid place-items-center border-2 border-fg bg-surface text-fg hover:bg-brand-primary hover:text-black shadow-pixel-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-pixel transition-all';

  return (
    <header
      className="fixed top-3 right-3 md:top-4 md:right-4 z-50 flex gap-2"
      aria-label="Barra de herramientas"
    >
      <button
        onClick={openShortcuts}
        aria-label="Ver atajos de teclado (?)"
        title="Atajos (?)"
        className={baseBtn}
      >
        <Keyboard size={20} strokeWidth={2.5} />
      </button>
      <button
        onClick={openPalette}
        aria-label="Abrir command palette (/)"
        title="Command palette (/)"
        className={baseBtn}
      >
        <Search size={20} strokeWidth={2.5} />
      </button>
      <button
        onClick={toggleAudio}
        aria-label={audioOn ? 'Apagar Claude FM' : 'Encender Claude FM'}
        title={audioOn ? 'Claude FM activo' : 'Claude FM (música ambient de Anthropic)'}
        className={`${baseBtn} ${audioOn ? 'bg-brand-primary text-black' : ''}`}
      >
        {audioOn ? <Headphones size={20} strokeWidth={2.5} /> : <HeadphoneOff size={20} strokeWidth={2.5} />}
      </button>
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
        className={baseBtn}
      >
        {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
      </button>
    </header>
  );
}
