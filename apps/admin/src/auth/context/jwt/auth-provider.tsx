'use client';

import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { refreshAccessToken } from './action';
import { jwtDecode, setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scheduleTokenRefresh = useCallback(
    (accessToken: string) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      const decoded = jwtDecode(accessToken);
      if (!decoded?.exp) return;

      // Refresh 60 seconds before expiry (minimum 10 seconds from now)
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshIn = Math.max(expiresIn - 60_000, 10_000);

      refreshTimerRef.current = setTimeout(async () => {
        const newToken = await refreshAccessToken();
        if (newToken) {
          scheduleTokenRefresh(newToken);
        } else {
          setState({ user: null, loading: false });
        }
      }, refreshIn);
    },
    [setState]
  );

  const checkUserSession = useCallback(async () => {
    try {
      let accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      // If token is expired, try refreshing before giving up
      if (accessToken && !isValidToken(accessToken)) {
        const newToken = await refreshAccessToken();
        accessToken = newToken;
      }

      if (accessToken && isValidToken(accessToken)) {
        await setSession(accessToken);

        const decoded = jwtDecode(accessToken);

        if (!decoded?.sub) {
          setState({ user: null, loading: false });
          return;
        }

        const res = await axios.get(endpoints.users.details(decoded.sub));
        const user = res.data?.data;

        setState({ user: { ...user, accessToken }, loading: false });
        scheduleTokenRefresh(accessToken);
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState, scheduleTokenRefresh]);

  useEffect(() => {
    checkUserSession();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
