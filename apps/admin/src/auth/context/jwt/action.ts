'use client';

import rawAxios from 'axios';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_REFRESH_KEY, JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const accessToken = res.data?.data?.access_token;
    const refreshToken = res.data?.data?.refresh_token;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    if (refreshToken) {
      sessionStorage.setItem(JWT_REFRESH_KEY, refreshToken);
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    const refreshToken = sessionStorage.getItem(JWT_REFRESH_KEY);

    if (refreshToken) {
      await axios.post(endpoints.auth.logout, { refresh_token: refreshToken }).catch(() => {});
    }

    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    await setSession(null);
  }
};

/** **************************************
 * Refresh token
 *************************************** */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = sessionStorage.getItem(JWT_REFRESH_KEY);
    if (!refreshToken) return null;

    // Use rawAxios to avoid axiosInstance attaching expired access token
    const res = await rawAxios.post(`${CONFIG.serverUrl}${endpoints.auth.refresh}`, {
      refresh_token: refreshToken,
    });

    const accessToken: string = res.data?.data?.access_token;
    const newRefreshToken: string = res.data?.data?.refresh_token;

    if (!accessToken) return null;

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
    if (newRefreshToken) sessionStorage.setItem(JWT_REFRESH_KEY, newRefreshToken);

    await setSession(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
