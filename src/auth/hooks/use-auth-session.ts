'use client';

import { useEffect, useState } from 'react';
import { getAccessToken, AUTH_STATE_CHANGE_EVENT } from '@/src/lib/axios';

export function useAuthSession() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const syncAuthSession = () => {
      setAccessToken(getAccessToken());
      setIsHydrated(true);
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
    accessToken,
    isHydrated,
    isAuthenticated: Boolean(accessToken),
  };
}
