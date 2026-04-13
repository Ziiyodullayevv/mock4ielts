'use client';

import NProgress from 'nprogress';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({
      minimum: 0.12,
      showSpinner: false,
      trickleSpeed: 140,
    });
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

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

      NProgress.start();
    };

    const handleHistoryNavigation = () => {
      NProgress.start();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handleHistoryNavigation);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handleHistoryNavigation);
    };
  }, []);

  return null;
}
