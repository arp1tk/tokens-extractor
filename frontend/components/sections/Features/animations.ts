import { useEffect, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';

export function useFeaturesAnimations(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="0"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="0"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="1"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="1"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="2"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="2"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="3"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="3"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="4"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="4"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="5"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="5"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="6"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="6"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="7"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="7"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="8"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="8"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="9"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="9"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="10"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="10"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="11"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="11"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="12"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="12"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="13"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="13"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="14"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="14"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="15"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="15"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="16"]', {
        ...{ opacity: 0 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="16"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="17"]', {
        ...{ opacity: 0, y: 20 },
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-anim="17"]', start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, [rootRef]);
}
