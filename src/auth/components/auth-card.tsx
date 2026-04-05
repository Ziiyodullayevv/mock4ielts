'use client';

import type { EmailOtpSchema } from '../schemas/auth-schema';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { CONFIG } from '@/src/global-config';
import { useRouter, useSearchParams } from '@/src/routes/hooks';

import { AuthEmailForm } from './auth-email-form';
import { AuthBrandBadge } from './auth-brand-badge';
import { AuthLegalNotice } from './auth-legal-notice';
import { sanitizeReturnTo } from '../utils/return-to';
import { AuthProviderGroup } from './auth-provider-group';
import { useAuthMutations } from '../hooks/use-auth-mutations';
import { AuthVerificationForm } from './auth-verification-form';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export function AuthCard() {
  const [email, setEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<string | null>(null);
  const [view, setView] = useState<'email' | 'providers' | 'verification'>('providers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { appleMutation, emailOtpMutation, googleMutation, verifyOtpMutation } =
    useAuthMutations();

  const resetMessages = () => {
    setProviderError(null);
    setProviderInfo(null);
    setEmailError(null);
    setVerificationError(null);
    setVerificationInfo(null);
  };

  const completeAuthFlow = (redirectUrl?: string) => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }

    router.replace(sanitizeReturnTo(searchParams.get('returnTo')) ?? '/');
  };

  const handleBack = () => {
    resetMessages();

    if (view === 'verification') {
      setView('email');
      return;
    }

    setView('providers');
  };

  const handleGoogleLogin = async (idToken: string) => {
    resetMessages();

    try {
      const result = await googleMutation.mutateAsync({
        idToken,
        invitationCode,
      });

      if (result.accessToken || result.redirectUrl) {
        completeAuthFlow(result.redirectUrl);
        return;
      }

      setProviderInfo(result.message ?? 'Google sign-in request sent.');
    } catch (error) {
      setProviderError(getErrorMessage(error));
    }
  };

  const handleAppleLogin = async () => {
    resetMessages();

    try {
      const result = await appleMutation.mutateAsync({ invitationCode });

      if (result.accessToken || result.redirectUrl) {
        completeAuthFlow(result.redirectUrl);
        return;
      }

      setProviderInfo(result.message ?? 'Apple sign-in request sent.');
    } catch (error) {
      setProviderError(getErrorMessage(error));
    }
  };

  const handleRequestEmailOtp = async ({ email: nextEmail }: EmailOtpSchema) => {
    resetMessages();

    try {
      const result = await emailOtpMutation.mutateAsync({
        email: nextEmail,
        invitationCode,
      });

      setEmail(nextEmail);
      setVerificationInfo(result.message ?? `We sent a verification code to ${nextEmail}.`);
      setView('verification');
    } catch (error) {
      setEmailError(getErrorMessage(error));
    }
  };

  const handleVerifyOtp = async ({ otp }: { otp: string }) => {
    resetMessages();

    try {
      const result = await verifyOtpMutation.mutateAsync({
        email,
        invitationCode,
        otp,
      });

      setVerificationInfo(result.message ?? 'You have successfully signed in.');
      completeAuthFlow(result.redirectUrl);
    } catch (error) {
      setVerificationError(getErrorMessage(error));
    }
  };

  const handleResendOtp = async () => {
    resetMessages();

    try {
      const result = await emailOtpMutation.mutateAsync({
        email,
        invitationCode,
      });

      setVerificationInfo(result.message ?? `A new verification code was sent to ${email}.`);
    } catch (error) {
      const message = getErrorMessage(error);
      setVerificationError(message);
      throw error;
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-168 max-w-125 shrink-0 flex-col rounded-xl bg-black/40 px-6 text-center shadow-sm backdrop-blur-[50px] max-lg:w-100 max-md:w-full max-md:max-w-125',
        view === 'providers' ? 'px-18' : 'px-6'
      )}
    >
      <div className="flex flex-1 flex-col py-6 max-lg:py-5">
        <div className="flex w-full items-center">
          {view !== 'providers' ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className=" text-white -ml-2.5 transition-opacity hover:opacity-80"
            >
              <ChevronLeft className="size-8" strokeWidth={2.5} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center p-0 pt-8 pb-4 max-lg:pt-4">
          <AuthBrandBadge />

          <h3 className="text-center text-2xl font-semibold leading-none tracking-tight">
            {view === 'verification' ? (
              <>
                <div className="text-[28px] leading-10 font-medium text-white max-lg:text-2xl">
                  Verification Code
                </div>
                <div className="mt-2 text-base leading-6 font-normal text-white/[0.64] max-lg:text-sm">
                  We sent a verification code to {email}. Please enter the code below.
                </div>
              </>
            ) : (
              <>
                <div className="text-[28px] leading-10 font-medium text-white max-lg:text-2xl">
                  Log in or sign up for free!
                </div>
                <div className="mt-2 text-base leading-6 font-normal text-white/[0.64] max-lg:text-sm">
                  Continue your IELTS prep with Google, Apple, or Email OTP.
                </div>
              </>
            )}
          </h3>

          {view === 'providers' ? (
            <AuthProviderGroup
              errorMessage={providerError}
              googleClientId={CONFIG.googleClientId}
              infoMessage={providerInfo}
              invitationCode={invitationCode}
              isApplePending={appleMutation.isPending}
              isGooglePending={googleMutation.isPending}
              onAppleClick={handleAppleLogin}
              onEmailClick={() => {
                resetMessages();
                setView('email');
              }}
              onGoogleCredential={handleGoogleLogin}
              onGoogleError={(message) => {
                setProviderError(message);
              }}
              onInvitationCodeChange={setInvitationCode}
            />
          ) : null}

          {view === 'email' ? (
            <AuthEmailForm
              defaultEmail={email}
              errorMessage={emailError}
              isSubmitting={emailOtpMutation.isPending}
              onSubmit={handleRequestEmailOtp}
            />
          ) : null}

          {view === 'verification' ? (
            <AuthVerificationForm
              errorMessage={verificationError}
              infoMessage={verificationInfo}
              isResending={emailOtpMutation.isPending}
              isSubmitting={verifyOtpMutation.isPending}
              onResend={handleResendOtp}
              onSubmit={handleVerifyOtp}
            />
          ) : null}
        </div>

        <AuthLegalNotice />
      </div>
    </div>
  );
}
