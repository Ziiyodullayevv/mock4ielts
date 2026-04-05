'use client';

import { LoaderCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { verifyOtpSchema, type VerifyOtpSchema } from '../schemas/auth-schema';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 50;

type AuthVerificationFormProps = {
  errorMessage?: string | null;
  infoMessage?: string | null;
  isResending?: boolean;
  isSubmitting?: boolean;
  onResend: () => Promise<void>;
  onSubmit: (values: { otp: string }) => Promise<void> | void;
};

export function AuthVerificationForm({
  errorMessage,
  infoMessage,
  isResending = false,
  isSubmitting = false,
  onResend,
  onSubmit,
}: AuthVerificationFormProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastSubmittedCodeRef = useRef<string | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<VerifyOtpSchema>({
    defaultValues: {
      otp: Array(CODE_LENGTH).fill(''),
    },
    resolver: zodResolver(verifyOtpSchema),
  });
  const code = useWatch({
    control,
    name: 'otp',
  });
  const otpCode = code.join('');

  const submitVerification = handleSubmit((values) => onSubmit({ otp: values.otp.join('') }));

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

  useEffect(() => {
    if (otpCode.length !== CODE_LENGTH || isSubmitting) {
      return;
    }

    if (lastSubmittedCodeRef.current === otpCode) {
      return;
    }

    lastSubmittedCodeRef.current = otpCode;
    void submitVerification();
  }, [isSubmitting, otpCode, submitVerification]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    lastSubmittedCodeRef.current = null;

    setValue(`otp.${index}`, nextValue, {
      shouldDirty: true,
      shouldValidate: true,
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

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);

    if (!digits) return;

    event.preventDefault();
    lastSubmittedCodeRef.current = null;

    digits.split('').forEach((digit, index) => {
      setValue(`otp.${index}`, digit, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    const focusIndex = Math.min(digits.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;

    await onResend();
    lastSubmittedCodeRef.current = null;

    reset({
      otp: Array(CODE_LENGTH).fill(''),
    });
    setSecondsLeft(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  };

  return (
    <form
      className="flex w-full flex-col items-center gap-8 pt-10 max-lg:pt-6 max-sm:gap-6"
      onSubmit={submitVerification}
    >
      <div
        className="grid w-full grid-cols-6 gap-3 max-md:gap-2"
        onPaste={handlePaste}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isSubmitting}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className="aspect-square min-w-0 rounded-lg border border-white/15 bg-white/[0.04] text-center text-2xl font-semibold text-white outline-none transition focus:border-white/35 max-sm:text-xl"
          />
        ))}
      </div>

      {errors.otp?.message ? (
        <p className="w-full text-left text-sm text-red-300">{errors.otp.message}</p>
      ) : null}

      {errorMessage ? (
        <p className="w-full text-left text-sm text-red-300">{errorMessage}</p>
      ) : null}

      {infoMessage ? (
        <p className="w-full text-left text-sm text-white/64">{infoMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-80 max-sm:min-h-12 max-sm:whitespace-normal max-sm:py-3 max-sm:text-sm max-sm:leading-5"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verification starts automatically after 6 digits'
        )}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={secondsLeft > 0 || isResending || isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-80 max-sm:min-h-12 max-sm:whitespace-normal max-sm:py-3 max-sm:text-sm max-sm:leading-5"
      >
        {isResending ? 'Resending...' : `Resend Code ${secondsLeft > 0 ? `(${secondsLeft}s)` : ''}`}
      </button>

      <p className="text-base leading-6 text-white/[0.64] max-lg:text-sm">
        Haven&apos;t received a verification code?
      </p>
    </form>
  );
}
