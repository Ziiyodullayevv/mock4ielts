'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { ChevronLeft } from 'lucide-react';

import { AuthEmailForm } from './auth-email-form';
import { AuthBrandBadge } from './auth-brand-badge';
import { AuthLegalNotice } from './auth-legal-notice';
import { AuthProviderGroup } from './auth-provider-group';
import { AuthVerificationForm } from './auth-verification-form';

export function AuthCard() {
  const [email, setEmail] = useState('');
  const [view, setView] = useState<'email' | 'providers' | 'verification'>('providers');

  const handleBack = () => {
    if (view === 'verification') {
      setView('email');
      return;
    }

    setView('providers');
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
                  What you imagine is what Vidu
                </div>
              </>
            )}
          </h3>

          {view === 'providers' ? (
            <AuthProviderGroup onEmailClick={() => setView('email')} />
          ) : null}

          {view === 'email' ? (
            <AuthEmailForm
              email={email}
              onEmailChange={setEmail}
              onNext={() => setView('verification')}
            />
          ) : null}

          {view === 'verification' ? <AuthVerificationForm /> : null}
        </div>

        <AuthLegalNotice />
      </div>
    </div>
  );
}
