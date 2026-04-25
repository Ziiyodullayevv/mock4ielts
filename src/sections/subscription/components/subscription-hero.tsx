'use client';

import { BadgePlus, Crown } from 'lucide-react';

import { TokenIcon } from '@/src/components/icons/token-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { cn } from '@/src/lib/utils';
import {
  subscriptionCardClassName,
  subscriptionMutedTextClassName,
} from '@/src/sections/subscription/constants/subscription';

type SubscriptionHeroProps = {
  avatar?: string | null;
  currentPlanLabel: string;
  email?: string;
  fullName?: string | null;
  initials: string;
  plansLabel: string;
  tokenBalance: number;
};

export function SubscriptionHero({
  avatar,
  currentPlanLabel,
  email,
  fullName,
  initials,
  plansLabel,
  tokenBalance,
}: SubscriptionHeroProps) {
  return (
    <section
      className={cn(
        subscriptionCardClassName,
        'overflow-hidden rounded-[30px] shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none'
      )}
    >
      <div className="px-6 pb-4 pt-6 sm:px-7 sm:pb-5">
          <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  subscriptionCardClassName,
                  'grid size-[64px] shrink-0 place-items-center rounded-full p-px shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none'
                )}
              >
                <Avatar className="size-full bg-transparent">
                  <AvatarImage src={avatar ?? undefined} alt={fullName || email || 'Profile'} />
                  <AvatarFallback className="bg-transparent text-lg font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[22px] font-semibold tracking-[-0.04em] text-stone-950 dark:text-white sm:text-[26px]">
                  {fullName || 'My Subscription'}
                </h1>
                {email ? (
                  <p className={cn('mt-0.5 truncate text-[14px]', subscriptionMutedTextClassName)}>{email}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div
                className={cn(
                  subscriptionCardClassName,
                  'inline-flex items-center gap-3 rounded-full px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none'
                )}
              >
                <TokenIcon className="size-5 text-[#ffb347] dark:text-[#ffb347]" />
                <span className="text-[16px] font-semibold tracking-[-0.03em] text-[#ffb347] dark:text-[#ffb347]">
                  {tokenBalance}
                </span>
              </div>
            </div>
          </div>

          <div className={cn(subscriptionCardClassName, 'rounded-[22px] px-6 py-7 sm:px-7')}>
            <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
              <div className="min-w-0">
                <div className="flex items-center gap-3 text-stone-950 dark:text-white">
                  <Crown className="size-5 text-[#ffb32b]" />
                  <h2 className="text-[19px] font-semibold tracking-[-0.035em] sm:text-[20px]">
                    Current Subscription
                  </h2>
                </div>
                <p className="mt-6 text-[15px] font-semibold leading-none text-stone-950 dark:text-white">
                  {currentPlanLabel}
                </p>
              </div>

              <div className="hidden h-[88px] self-center bg-stone-200/80 md:block dark:bg-white/8" />

              <div className="min-w-0">
                <div className="flex items-center gap-3 text-stone-950 dark:text-white">
                  <BadgePlus className="size-5 text-[#1cc8ff]" />
                  <h2 className="text-[19px] font-semibold tracking-[-0.035em] sm:text-[20px]">
                    Subscription Plans
                  </h2>
                </div>
                <p className="mt-6 text-[15px] font-semibold leading-none text-stone-950 dark:text-white">
                  {plansLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
