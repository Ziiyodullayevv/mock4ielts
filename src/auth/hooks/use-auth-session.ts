'use client';

import { useSyncExternalStore } from 'react';
import { getAccessToken, AUTH_STATE_CHANGE_EVENT } from '@/src/lib/axios';

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(AUTH_STATE_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
};

const getSnapshot = () => getAccessToken();
const getServerSnapshot = () => null;
const subscribeHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getHydrationServerSnapshot = () => false;

export function useAuthSession() {
  const accessToken = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getHydrationServerSnapshot
  );

  return {
    accessToken,
    isHydrated,
    isAuthenticated: Boolean(accessToken),
  };
}
