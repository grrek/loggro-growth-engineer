import { useEffect, useRef, useState } from 'react';
import { Headphones, X } from 'lucide-react';

// Claude FM live stream: musica ambient de Anthropic para builders
// https://www.youtube.com/live/YmQ7jRgf4f0
// Control: desde el Header (boton headphones) o tecla M
const STREAM_VIDEO_ID = 'YmQ7jRgf4f0';

export default function ClaudeFM() {
  const [expanded, setExpanded] = useState(false);
  const [activated, setActivated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Restaurar estado al montar (entre paginas)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('claude-fm-active');
      if (saved === 'true') {
        setExpanded(true);
        setActivated(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const open = () => {
    setExpanded(true);
    setActivated(true);
    try {
      sessionStorage.setItem('claude-fm-active', 'true');
      window.dispatchEvent(new CustomEvent('claudefm:changed'));
    } catch {
      /* noop */
    }
  };

  const close = () => {
    setExpanded(false);
    setActivated(false);
    try {
      sessionStorage.setItem('claude-fm-active', 'false');
      window.dispatchEvent(new CustomEvent('claudefm:changed'));
    } catch {
      /* noop */
    }
  };

  // Listeners para abrir/cerrar desde Header, Command Palette o tecla M
  useEffect(() => {
    const onActivate = () => open();
    const onClose = () => close();
    window.addEventListener('claudefm:open', onActivate);
    window.addEventListener('claudefm:close', onClose);
    return () => {
      window.removeEventListener('claudefm:open', onActivate);
      window.removeEventListener('claudefm:close', onClose);
    };
  }, []);

  // No render si no esta expandido (el control vive en el Header)
  if (!expanded) return null;

  return (
    <div
      role="region"
      aria-label="Claude FM mini player"
      className="fixed bottom-4 right-4 z-40 w-[300px] bg-surface border-2 border-fg shadow-pixel-md overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-fg bg-surface-alt">
        <div className="flex items-center gap-2 min-w-0">
          <Headphones size={14} className="text-brand-primary-text shrink-0" />
          <p className="text-xs font-pixel uppercase tracking-widest text-fg truncate">
            Claude FM
          </p>
          <span className="text-[9px] text-fg-subtle font-mono">· Anthropic</span>
        </div>
        <button
          onClick={close}
          aria-label="Cerrar Claude FM"
          className="p-1 hover:bg-fg hover:text-surface transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {activated && (
        <iframe
          ref={iframeRef}
          width="300"
          height="100"
          src={`https://www.youtube.com/embed/${STREAM_VIDEO_ID}?autoplay=1&mute=0`}
          title="Claude FM, musica ambient de Anthropic para builders"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowFullScreen
          className="block"
        />
      )}

      <p className="px-3 py-2 text-[10px] text-fg-subtle font-mono leading-tight">
        musica para concentrarte. embed del stream publico de anthropic.
      </p>
    </div>
  );
}
