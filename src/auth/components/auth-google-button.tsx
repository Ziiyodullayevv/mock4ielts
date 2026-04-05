'use client';

import Script from 'next/script';
import { useRef, useState, useEffect } from 'react';

import { GoogleIcon } from './auth-provider-icons';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfiguration = {
  locale?: string;
  logo_alignment?: 'center' | 'left';
  shape?: 'circle' | 'pill' | 'rectangular' | 'square';
  size?: 'large' | 'medium' | 'small';
  text?: 'continue_with' | 'signin' | 'signup' | 'signin_with' | 'signup_with' | 'use';
  theme?: 'filled_black' | 'filled_blue' | 'outline';
  width?: number;
};

type GoogleIdConfiguration = {
  callback: (response: GoogleCredentialResponse) => void;
  client_id: string;
  context?: 'signin' | 'signup' | 'use';
  use_fedcm_for_button?: boolean;
  ux_mode?: 'popup' | 'redirect';
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (configuration: GoogleIdConfiguration) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfiguration
          ) => void;
        };
      };
    };
  }
}

type AuthGoogleButtonProps = {
  clientId: string;
  disabled?: boolean;
  loading?: boolean;
  onCredential: (idToken: string) => Promise<void> | void;
  onError: (message: string) => void;
};

export function AuthGoogleButton({
  clientId,
  disabled = false,
  loading = false,
  onCredential,
  onError,
}: AuthGoogleButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const callbackRef = useRef(onCredential);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);
  const isUnavailable = !clientId || disabled || loading;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !scriptLoaded) {
      return undefined;
    }

    const googleIdentity = window.google?.accounts?.id;

    if (!googleIdentity) {
      onError('Google sign-in script did not load correctly.');
      return undefined;
    }

    if (!isInitializedRef.current) {
      googleIdentity.initialize({
        callback: (response) => {
          const idToken = response.credential;

          if (!idToken) {
            onError('Google did not return an ID token.');
            return;
          }

          void callbackRef.current(idToken);
        },
        client_id: clientId,
        context: 'signin',
        use_fedcm_for_button: true,
        ux_mode: 'popup',
      });

      isInitializedRef.current = true;
    }

    const renderButton = () => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = '';

      googleIdentity.renderButton(containerRef.current, {
        locale: 'en',
        logo_alignment: 'left',
        shape: 'rectangular',
        size: 'large',
        text: 'continue_with',
        theme: 'outline',
        width: Math.max(containerRef.current.offsetWidth, 280),
      });
    };

    renderButton();

    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      renderButton();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [clientId, onError, scriptLoaded]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="relative w-full">
        <button
          type="button"
          disabled={isUnavailable}
          className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                aria-hidden="true"
              />
              Please wait...
            </span>
          ) : (
            <>
              <GoogleIcon />
              {clientId ? 'Continue with Google' : 'Google client ID required'}
            </>
          )}
        </button>

        <div
          className={
            isUnavailable
              ? 'pointer-events-none absolute inset-0 opacity-0'
              : 'absolute inset-0 opacity-0'
          }
          aria-hidden="true"
        >
          <div ref={containerRef} className="h-12 w-full overflow-hidden rounded-lg" />
        </div>
      </div>
    </>
  );
}
