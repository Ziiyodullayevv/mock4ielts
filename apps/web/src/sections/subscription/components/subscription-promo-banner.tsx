'use client';

import type { SubscriptionPeriod } from '@/src/sections/subscription/types/subscription';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Sparkles, ArrowRight, BadgePercent } from 'lucide-react';
import { subscriptionMutedTextClassName } from '@/src/sections/subscription/constants/subscription';

type SubscriptionPromoBannerProps = {
  period: SubscriptionPeriod;
  onSwitchToYearly: () => void;
};

export function SubscriptionPromoBanner({
  onSwitchToYearly,
  period,
}: SubscriptionPromoBannerProps) {
  const alreadyYearly = period === 'subscription_yearly';

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 rounded-[24px] border border-[#ffd27a] bg-[linear-gradient(135deg,rgba(255,200,90,0.16)_0%,rgba(255,159,47,0.10)_44%,rgba(255,120,75,0.08)_100%)] px-5 py-5 shadow-[0_14px_32px_rgba(255,159,47,0.12)] dark:border-[#ffb347]/30 dark:shadow-none sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white">
            <BadgePercent className="size-4 text-[#ff9f2f]" />
            Annual billing unlocks lower effective pricing
          </div>
          <p className={cn('mt-2 max-w-3xl text-sm leading-7', subscriptionMutedTextClassName)}>
            Pick yearly billing to stretch your budget while keeping monthly token refreshes for
            IELTS practice, scoring, and revision support.
          </p>
        </div>

        <Button
          type="button"
          variant="orange"
          className="h-11 rounded-full px-5"
          disabled={alreadyYearly}
          onClick={onSwitchToYearly}
        >
          <Sparkles className="size-4" />
          {alreadyYearly ? 'Yearly billing selected' : 'Switch to yearly'}
          {!alreadyYearly ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
    </section>
  );
}
