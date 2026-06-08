import { useEffect, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';

// data-anim index -> whether it also slides up (text/content) or just fades (images)
const SLIDE_UP = new Set([0, 1, 2, 3, 6, 9, 12, 15]);
const COUNT = 18;

export function useFeaturesAnimations(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      for (let i = 0; i < COUNT; i++) {
        const el = root.querySelector(`[data-anim="${i}"]`);
        if (!el) continue; // element not rendered (e.g. removed/commented out) — skip cleanly
        gsap.from(el, {
          opacity: 0,
          ...(SLIDE_UP.has(i) ? { y: 20 } : {}),
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [rootRef]);
}
