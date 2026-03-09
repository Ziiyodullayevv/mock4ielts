import NProgress from 'nprogress';
import { isEqualPath } from 'minimal-shared/utils';
import { useMemo, useEffect, useCallback } from 'react';
import {
  usePathname,
  useSearchParams,
  useRouter as useNextRouter,
} from 'next/navigation';

// ----------------------------------------------------------------------

/**
 * Customized useRouter hook with NProgress integration.
 */

export function useRouter() {
  const pathname = usePathname();
  const nextRouter = useNextRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  const startProgress = useCallback((href: string) => {
    if (
      typeof window !== 'undefined' &&
      !isEqualPath(href, window.location.href, { deep: false })
    ) {
      NProgress.start();
    }
  }, []);

  const push: ReturnType<typeof useNextRouter>['push'] = useCallback(
    (href, options) => {
      startProgress(String(href));
      nextRouter.push(href, options);
    },
    [nextRouter, startProgress]
  );

  const replace: ReturnType<typeof useNextRouter>['replace'] = useCallback(
    (href, options) => {
      startProgress(String(href));
      nextRouter.replace(href, options);
    },
    [nextRouter, startProgress]
  );

  const router = useMemo(
    () => ({
      ...nextRouter,
      push,
      replace,
    }),
    [nextRouter, push, replace]
  );

  return router;
}
