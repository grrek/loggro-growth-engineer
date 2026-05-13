import { useEffect, useRef, useState } from 'react';
import { Headphones, X } from 'lucide-react';

// Claude FM live stream: música ambient de Anthropic para builders
// https://www.youtube.com/live/YmQ7jRgf4f0
const STREAM_VIDEO_ID = 'YmQ7jRgf4f0';

export default function ClaudeFM() {
  const [expanded, setExpanded] = useState(false);
  const [activated, setActivated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Persistir estado entre páginas
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('claude-fm-active');
      if (saved === 'true') {
        setExpanded(true);
        setActivated(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const open = () => {
    setExpanded(true);
    setActivated(true);
    try {
      sessionStorage.setItem('claude-fm-active', 'true');
    } catch {
      /* noop */
    }
  };

  const close = () => {
    setExpanded(false);
    setActivated(false);
    try {
      sessionStorage.setItem('claude-fm-active', 'false');
    } catch {
      /* noop */
    }
  };

  // Listener global para activar desde Command Palette
  useEffect(() => {
    const onActivate = () => open();
    window.addEventListener('claudefm:open', onActivate);
    return () => window.removeEventListener('claudefm:open', onActivate);
  }, []);

  return (
    <>
      {/* Botón flotante esquina inferior izquierda */}
      {!expanded && (
        <button
          onClick={open}
          aria-label="Activar Claude FM, música ambient de Anthropic para concentrarse"
          className="fixed bottom-4 left-4 z-40 w-11 h-11 grid place-items-center rounded-full bg-fg text-surface border-2 border-brand-primary hover:bg-brand-primary hover:text-black active:scale-95 transition-all shadow-lg"
          title="Claude FM: música ambient de Anthropic"
        >
          <Headphones size={18} />
        </button>
      )}

      {/* Mini-player expandido */}
      {expanded && (
        <div
          role="region"
          aria-label="Claude FM mini player"
          className="fixed bottom-4 left-4 z-40 w-[300px] rounded-lg border border-line bg-surface shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-line bg-surface-alt">
            <div className="flex items-center gap-2 min-w-0">
              <Headphones size={14} className="text-brand-primary-text shrink-0" />
              <p className="text-xs font-pixel uppercase tracking-widest text-fg truncate">
                Claude FM
              </p>
              <span className="text-[10px] text-fg-subtle font-mono">· by Anthropic</span>
            </div>
            <button
              onClick={close}
              aria-label="Cerrar Claude FM"
              className="p-1 rounded hover:bg-line transition-colors shrink-0"
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
              title="Claude FM, música ambient de Anthropic para builders"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              allowFullScreen
              className="block"
            />
          )}

          <p className="px-3 py-2 text-[10px] text-fg-subtle font-mono leading-tight">
            música para concentrarte. embed del stream público de anthropic.
          </p>
        </div>
      )}
    </>
  );
}
