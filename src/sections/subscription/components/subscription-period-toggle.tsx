'use client';

import { cn } from '@/src/lib/utils';
import {
  SUBSCRIPTION_PERIOD_OPTIONS,
  subscriptionSurfaceClassName,
} from '@/src/sections/subscription/constants/subscription';
import type { SubscriptionPeriod } from '@/src/sections/subscription/types/subscription';

type SubscriptionPeriodToggleProps = {
  period: SubscriptionPeriod;
  onChange: (period: SubscriptionPeriod) => void;
};

export function SubscriptionPeriodToggle({
  onChange,
  period,
}: SubscriptionPeriodToggleProps) {
  const activeIndex = SUBSCRIPTION_PERIOD_OPTIONS.findIndex((option) => option.id === period);

  return (
    <section className="mt-5 flex justify-center">
      <div className={cn(subscriptionSurfaceClassName, 'relative isolate w-full max-w-[320px] rounded-[16px] p-1')}>
        <div className="relative grid grid-cols-2 gap-2">
          <div
            aria-hidden="true"
            className={cn(
              'subscription-period-toggle-pill pointer-events-none absolute inset-y-0 left-0 z-0 w-[calc(50%_-_0.25rem)] rounded-[12px]',
              activeIndex === 1 ? 'translate-x-[calc(100%_+_0.5rem)]' : 'translate-x-0'
            )}
          />

          {SUBSCRIPTION_PERIOD_OPTIONS.map((option) => {
            const isActive = option.id === period;

            return (
              <button
                key={option.id}
                type="button"
                className={cn(
                  'relative z-10 flex min-h-[40px] items-center justify-between rounded-[12px] border border-transparent bg-transparent px-2.5 py-1.5 text-left transition-[color,transform] duration-300 sm:min-h-[38px] sm:px-2.5 sm:py-1.5',
                  isActive
                    ? 'text-white'
                    : 'text-stone-950/88 hover:text-stone-950 dark:text-white/74 dark:hover:text-white'
                )}
                onClick={() => onChange(option.id)}
              >
                <span className="text-[10px] font-semibold tracking-[-0.02em] sm:text-[10px]">
                  {option.label}
                </span>
                {option.badge ? (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-[9px] px-1.5 py-0.5 text-[9px] font-semibold tracking-[-0.01em] transition-[color,background-color,box-shadow] duration-300 sm:px-1.5 sm:py-0.5 sm:text-[9px]',
                      isActive
                        ? 'bg-white/16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm'
                        : 'bg-transparent text-[#6870ff] ring-1 ring-[#8F94FF]/28 dark:text-[#b6b9ff] dark:ring-white/12'
                    )}
                  >
                    {option.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
