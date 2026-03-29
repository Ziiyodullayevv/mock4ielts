export type AuthProvider = 'apple' | 'google';

export type ProviderAuthInput = {
  invitationCode?: string;
};

export type RequestEmailOtpInput = {
  email: string;
  invitationCode?: string;
};

export type VerifyOtpInput = {
  email: string;
  invitationCode?: string;
  otp: string;
};

export type RefreshTokenInput = {
  refreshToken: string;
};

export type AuthResult = {
  accessToken?: string;
  message?: string;
  raw?: unknown;
  redirectUrl?: string;
  refreshToken?: string;
};
