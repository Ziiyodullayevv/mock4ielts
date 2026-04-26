'use client';

import NProgress from 'nprogress';
import { useRef, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fallbackTimerRef = useRef<number | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current === null) {
      return;
    }

    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = null;
  }, []);

  const finishProgress = useCallback(() => {
    clearFallbackTimer();
    NProgress.done();
  }, [clearFallbackTimer]);

  const startProgress = useCallback((fallbackMs = 8000) => {
    clearFallbackTimer();
    NProgress.start();

    fallbackTimerRef.current = window.setTimeout(() => {
      NProgress.done(true);
      fallbackTimerRef.current = null;
    }, fallbackMs);
  }, [clearFallbackTimer]);

  useEffect(() => {
    NProgress.configure({
      minimum: 0.12,
      showSpinner: false,
      trickleSpeed: 140,
    });

    lastUrlRef.current = window.location.href;

    return () => {
      clearFallbackTimer();
      NProgress.done(true);
    };
  }, [clearFallbackTimer]);

  useEffect(() => {
    lastUrlRef.current = window.location.href;
    finishProgress();
  }, [finishProgress, pathname, searchParams]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a');

      if (!anchor) {
        return;
      }

      const rawHref = anchor.getAttribute('href');

      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (
        nextUrl.origin !== currentUrl.origin ||
        (nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash)
      ) {
        return;
      }

      startProgress();
    };

    const handleHistoryNavigation = () => {
      const previousUrl = lastUrlRef.current;
      const nextUrl = window.location.href;

      startProgress();

      if (previousUrl === nextUrl) {
        window.setTimeout(finishProgress, 180);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handleHistoryNavigation);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handleHistoryNavigation);
    };
  }, [finishProgress, startProgress]);

  return null;
}
