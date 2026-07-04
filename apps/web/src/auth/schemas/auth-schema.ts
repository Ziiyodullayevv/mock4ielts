import { z } from 'zod';

export const emailOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export type EmailOtpSchema = z.infer<typeof emailOtpSchema>;

export const verifyOtpSchema = z
  .object({
    otp: z.array(z.string().regex(/^\d?$/, 'Only digits are allowed')).length(6),
  })
  .refine((values) => values.otp.every((digit) => digit.length === 1), {
    message: 'Enter the 6-digit verification code',
    path: ['otp'],
  });

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
