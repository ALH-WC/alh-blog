'use client';

import { useEffect } from 'react';

// Background-tab attention: while the tab is hidden the title crawls like a
// ticker and the favicon cycles through brand colors; the moment the tab is
// focused again both snap back to the page's own title and the gold roundel.
// Browsers throttle hidden-tab timers to roughly one tick per second, which
// sets the crawl's pace; Safari ignores dynamic favicons (crawl still works).
const CRAWL = 'Amsterdam Life Homes · expat housing in Amsterdam · ';
const FRAMES = ['/fav/f0.png', '/fav/f1.png', '/fav/f2.png', '/fav/f3.png'];

export function TabAttention() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let step = 0;
    let savedTitle = document.title;

    const icon = (): HTMLLinkElement => {
      let l = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!l) {
        l = document.createElement('link');
        l.rel = 'icon';
        document.head.appendChild(l);
      }
      return l;
    };
    const savedIcon = icon().href;

    const start = () => {
      if (timer) return;
      savedTitle = document.title;
      step = 0;
      timer = setInterval(() => {
        step += 1;
        const i = step % CRAWL.length;
        document.title = CRAWL.slice(i) + CRAWL.slice(0, i);
        icon().href = FRAMES[step % FRAMES.length];
      }, 700);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
      document.title = savedTitle;
      icon().href = savedIcon;
    };
    const onVis = () => (document.hidden ? start() : stop());

    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__tabAttention = true;
    }
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stop();
    };
  }, []);

  return null;
}
