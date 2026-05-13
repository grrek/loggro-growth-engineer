import { useEffect } from 'react';
import { track } from '../lib/track';

// Listener global que captura:
// - Clicks en elementos con [data-track="<event_name>"]
// - Play de cualquier <video> en la página (1 vez por sesión por video)
// - Scroll milestones 25/50/75/100% (1 vez por milestone)

export default function TrackingListener() {
  useEffect(() => {
    const playedVideos = new Set<string>();
    const firedMilestones = new Set<number>();

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trackable = target.closest('[data-track]') as HTMLElement | null;
      if (!trackable) return;
      const event = trackable.dataset.track;
      if (!event) return;
      track({
        event,
        extra: {
          label: trackable.dataset.trackLabel || trackable.textContent?.trim().slice(0, 40) || '',
        },
      });
    };

    const onPlay = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      const id = v.currentSrc || v.src || 'video';
      if (playedVideos.has(id)) return;
      playedVideos.add(id);
      track({
        event: 'video_play',
        extra: { src: id.split('/').pop() || 'video' },
      });
    };

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.round((window.scrollY / h) * 100);
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !firedMilestones.has(m)) {
          firedMilestones.add(m);
          track({ event: 'scroll', extra: { depth: m } });
        }
      }
    };

    document.addEventListener('click', onClick, { capture: true });
    document.addEventListener('play', onPlay, { capture: true });
    let scrollTimer: number | undefined;
    const throttledScroll = () => {
      if (scrollTimer) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = undefined;
        onScroll();
      }, 200);
    };
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      document.removeEventListener('play', onPlay, { capture: true });
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  return null;
}
