'use client';

import { useMutation } from '@tanstack/react-query';

import {
  logout,
  verifyOtp,
  refreshTokens,
  loginWithApple,
  loginWithGoogle,
  requestEmailOtp,
} from '../api/auth-api';

export function useAuthMutations() {
  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
  });

  const appleMutation = useMutation({
    mutationFn: loginWithApple,
  });

  const emailOtpMutation = useMutation({
    mutationFn: requestEmailOtp,
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
  });

  const refreshMutation = useMutation({
    mutationFn: refreshTokens,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
  });

  return {
    appleMutation,
    emailOtpMutation,
    googleMutation,
    logoutMutation,
    refreshMutation,
    verifyOtpMutation,
  };
}
