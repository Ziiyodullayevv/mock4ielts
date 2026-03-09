'use client';

import { useRef, useState, useEffect } from 'react';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 50;

export function AuthVerificationForm() {
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (secondsLeft > 0) {
      timeoutId = window.setTimeout(() => {
        setSecondsLeft((current) => current - 1);
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [secondsLeft]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);

    setCode((current) => {
      const nextCode = [...current];
      nextCode[index] = nextValue;
      return nextCode;
    });

    if (nextValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;

    setCode(Array(CODE_LENGTH).fill(''));
    setSecondsLeft(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-10 max-lg:pt-6">
      <div className="grid w-full grid-cols-6 gap-3 max-md:gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className="aspect-square min-w-0 rounded-lg border border-white/15 bg-white/[0.04] text-center text-2xl font-semibold text-white outline-none transition focus:border-white/35 max-md:text-xl"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={secondsLeft > 0}
        className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-80"
      >
        Resend Code {secondsLeft > 0 ? `(${secondsLeft}s)` : ''}
      </button>

      <p className="text-base leading-6 text-white/[0.64] max-lg:text-sm">
        Haven&apos;t received a verification code?
      </p>
    </div>
  );
}
