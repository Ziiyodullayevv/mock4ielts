'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { getAccessToken, AUTH_STATE_CHANGE_EVENT } from '@/src/lib/axios';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useAuthSession() {
  const [session, setSession] = useState<{
    accessToken: string | null;
    isHydrated: boolean;
  }>({
    accessToken: null,
    isHydrated: false,
  });

  useIsomorphicLayoutEffect(() => {
    const syncAuthSession = () => {
      setSession({
        accessToken: getAccessToken(),
        isHydrated: true,
      });
    };

    syncAuthSession();

    window.addEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthSession);
    window.addEventListener('storage', syncAuthSession);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthSession);
      window.removeEventListener('storage', syncAuthSession);
    };
  }, []);

  return {
    accessToken: session.accessToken,
    isHydrated: session.isHydrated,
    isAuthenticated: Boolean(session.accessToken),
  };
}
