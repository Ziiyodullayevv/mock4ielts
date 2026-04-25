import type { SubscriptionPeriod } from '@/src/sections/subscription/types/subscription';
import { PRACTICE_MENU_PANEL_RING_CLASS } from '@/src/layouts/practice-surface-theme';

export const DEFAULT_SUBSCRIPTION_PERIOD: SubscriptionPeriod = 'subscription_yearly';

export const SUBSCRIPTION_PERIOD_OPTIONS: Array<{
  badge?: string;
  id: SubscriptionPeriod;
  label: string;
}> = [
  {
    badge: '20% Off',
    id: 'subscription_yearly',
    label: 'Yearly Billing',
  },
  {
    badge: '15% Off',
    id: 'subscription_monthly',
    label: 'Monthly Billing',
  },
];

export const subscriptionPageBackgroundClassName =
  'min-h-screen bg-[#f4f6f9] px-4 text-stone-950 sm:px-6 dark:bg-[linear-gradient(180deg,#090909_0%,#050505_100%)] dark:text-white';

export const subscriptionCardClassName = `${PRACTICE_MENU_PANEL_RING_CLASS} text-stone-950 dark:text-white`;

export const subscriptionSurfaceClassName =
  `${subscriptionCardClassName} rounded-[28px] shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none`;

export const subscriptionMutedTextClassName = 'text-stone-600 dark:text-white/64';
