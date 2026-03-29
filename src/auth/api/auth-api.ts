import type {
  AuthResult,
  AuthProvider,
  VerifyOtpInput,
  ProviderAuthInput,
  RefreshTokenInput,
  RequestEmailOtpInput,
} from './types';

import { endpoints, axiosInstance, setAuthTokens, clearAuthTokens } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null ? (value as ApiRecord) : null;

const pickString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.length > 0);

const normalizeAuthResult = (payload: unknown): AuthResult => {
  const root = asRecord(payload);
  const data = asRecord(root?.data);

  return {
    accessToken: pickString(data?.access_token, root?.access_token),
    message: pickString(root?.message, data?.message, root?.error, data?.error),
    raw: payload,
    redirectUrl: pickString(data?.redirect_url, data?.url, root?.redirect_url, root?.url),
    refreshToken: pickString(data?.refresh_token, root?.refresh_token),
  };
};

const persistTokens = (result: AuthResult) => {
  if (!result.accessToken) return result;

  setAuthTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return result;
};

const withInvitationCode = (invitationCode?: string) =>
  invitationCode ? { invitation_code: invitationCode } : {};

const requestProviderLogin = async (
  provider: AuthProvider,
  { invitationCode }: ProviderAuthInput
) => {
  const response = await axiosInstance.post(endpoints.auth[provider], {
    ...withInvitationCode(invitationCode),
  });

  return persistTokens(normalizeAuthResult(response.data));
};

export const loginWithGoogle = (input: ProviderAuthInput) =>
  requestProviderLogin('google', input);

export const loginWithApple = (input: ProviderAuthInput) =>
  requestProviderLogin('apple', input);

export const requestEmailOtp = async ({
  email,
  invitationCode,
}: RequestEmailOtpInput) => {
  const response = await axiosInstance.post(endpoints.auth.email, {
    email,
    ...withInvitationCode(invitationCode),
  });

  return normalizeAuthResult(response.data);
};

export const verifyOtp = async ({ email, invitationCode, otp }: VerifyOtpInput) => {
  const response = await axiosInstance.post(endpoints.auth.verifyOtp, {
    email,
    otp,
    ...withInvitationCode(invitationCode),
  });

  return persistTokens(normalizeAuthResult(response.data));
};

export const refreshTokens = async ({ refreshToken }: RefreshTokenInput) => {
  const response = await axiosInstance.post(endpoints.auth.refresh, {
    refresh_token: refreshToken,
  });

  return persistTokens(normalizeAuthResult(response.data));
};

export const logout = async () => {
  try {
    await axiosInstance.post(endpoints.auth.logout);
  } finally {
    clearAuthTokens();
  }
};
