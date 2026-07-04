'use client';

import Script from 'next/script';
import { cn } from '@/src/lib/utils';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const callbackRef = useRef(onCredential);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);
  const isUnavailable = !clientId || disabled || loading;
  // overlay = Google iframe behind the custom button; active only when script ready and not busy
  const isOverlayActive = scriptLoaded && !isUnavailable;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  // If the script was already loaded by a previous render, mark it immediately
  useEffect(() => {
    if (window.google?.accounts?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!clientId || !scriptLoaded) return undefined;

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
        // Explicitly disable FedCM — Chrome 108+ defaults to FedCM which
        // silently fails when DevTools is closed on accounts not signed into Chrome
        use_fedcm_for_button: false,
        ux_mode: 'popup',
      });
      isInitializedRef.current = true;
    }

    const renderButton = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      // getBoundingClientRect is accurate even before offsetWidth settles
      const width =
        containerRef.current.getBoundingClientRect().width ||
        containerRef.current.offsetWidth ||
        400;
      googleIdentity.renderButton(containerRef.current, {
        locale: 'en',
        logo_alignment: 'left',
        shape: 'rectangular',
        size: 'large',
        text: 'continue_with',
        theme: 'outline',
        width: Math.max(width, 280),
      });
    };

    renderButton();

    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(renderButton);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [clientId, onError, scriptLoaded]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onReady={() => setScriptLoaded(true)}
      />

      {/*
        Layer stack (front → back):
          [z-20] Custom button  — visual appearance, pointer-events:none when Google active
          [z-10] White shield   — opaque bg-white, pointer-events:none; hides Google iframe
                                  so hover/press transparency on custom button never leaks through
          [z-0 ] Google iframe  — natural opacity (no clickjacking risk), receives all clicks
                                  when layers above have pointer-events:none
      */}
      <div
        className={cn('relative h-12 w-full', isUnavailable ? 'cursor-not-allowed' : 'cursor-pointer')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
      >
        {/* Google iframe at base z-index — visible opacity, no clickjacking protection triggered */}
        <div
          ref={containerRef}
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-lg"
        />

        {/* Opaque white shield — hides the Google iframe visually without blocking clicks */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-white" />

        {/* Custom button — sits on top of the shield for visual states */}
        <button
          type="button"
          disabled={isUnavailable}
          className={cn(
            'absolute inset-0 z-20 inline-flex h-full w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-[transform,background-color,box-shadow,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
            isOverlayActive ? 'pointer-events-none' : 'cursor-pointer',
            isPressed
              ? 'translate-y-px bg-white/88 shadow-[0_5px_12px_rgba(0,0,0,0.14)]'
              : isHovered
                ? 'bg-white/94'
                : ''
          )}
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
      </div>
    </>
  );
}
