'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { emailOtpSchema, type EmailOtpSchema } from '../schemas/auth-schema';

type AuthEmailFormProps = {
  defaultEmail: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: EmailOtpSchema) => Promise<void> | void;
};

export function AuthEmailForm({
  defaultEmail,
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: AuthEmailFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<EmailOtpSchema>({
    defaultValues: {
      email: defaultEmail,
    },
    resolver: zodResolver(emailOtpSchema),
  });

  useEffect(() => {
    reset({ email: defaultEmail });
  }, [defaultEmail, reset]);

  return (
    <form
      className="flex w-full flex-col items-center gap-8 pt-10 max-lg:pt-6 max-sm:gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="w-full">
        <input
          type="email"
          className="flex h-12 w-full rounded-lg border border-white/12 bg-white/[0.08] px-6 py-2.5 text-sm text-white placeholder:text-white/[0.64] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 max-sm:px-4"
          placeholder="Email address"
          disabled={isSubmitting}
          {...register('email')}
        />

        {errors.email?.message ? (
          <p className="mt-3 text-left text-sm text-red-300">{errors.email.message}</p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-left text-sm text-red-300">{errorMessage}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );
}
