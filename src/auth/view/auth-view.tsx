'use client';

import { Suspense , useEffect } from 'react';
import { Logo } from '@/src/components/logo';
import { useRouter, useSearchParams } from '@/src/routes/hooks';

import { sanitizeReturnTo } from '../utils/return-to';
import { useAuthSession } from '../hooks/use-auth-session';
import { AuthCard, AuthCaptchaOverlay } from '../components';

export function AuthView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthSession();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      return;
    }

    router.replace(sanitizeReturnTo(searchParams.get('returnTo')) ?? '/');
  }, [isAuthenticated, isHydrated, router, searchParams]);

  if (!isHydrated || isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-end px-17.5 py-12 max-lg:px-12 max-sm:min-h-[100svh] max-sm:items-start max-sm:justify-center max-sm:px-4 max-sm:pb-8 max-sm:pt-24">
        <header className="absolute left-0 top-10 px-17 max-sm:left-4 max-sm:top-6 max-sm:px-0">
          <Logo />
        </header>
        <Suspense fallback={null}>
          <AuthCard />
        </Suspense>
      </div>

      <AuthCaptchaOverlay />
    </>
  );
}
