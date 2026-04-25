'use client';

import { Check, Sparkles } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { subscriptionCardClassName } from '@/src/sections/subscription/constants/subscription';
import type {
  SubscriptionPeriod,
  SubscriptionPlan,
} from '@/src/sections/subscription/types/subscription';

type SubscriptionPlanCardProps = {
  period: SubscriptionPeriod;
  plan: SubscriptionPlan;
};

export function SubscriptionPlanCard({ period, plan }: SubscriptionPlanCardProps) {
  const price = plan.prices[period];

  return (
    <article
      className={cn(
        subscriptionCardClassName,
        'relative flex h-full flex-col overflow-hidden rounded-lg py-6 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors dark:shadow-none',
        plan.highlight &&
          (plan.highlightClassName ??
            'shadow-[0_0_0_1px_rgba(155,147,255,0.28),0_24px_60px_rgba(155,147,255,0.16),rgba(255,255,255,0.6)_1.2px_1.5px_0px_0px_inset,rgba(255,255,255,0.38)_0px_0px_10px_0px_inset] dark:shadow-[0_0_0_1px_rgba(155,147,255,0.35),0_0_36px_rgba(155,147,255,0.22),rgba(255,255,255,0.22)_1px_1px_0px_0px_inset]')
      )}
    >
      {plan.badge ? (
        <div
          className={cn(
            '!absolute right-4 top-4 z-20 inline-flex max-w-max items-center rounded-full px-3 py-1.5 text-xs font-semibold leading-none whitespace-nowrap text-white shadow-[0_0_20px_rgba(0,0,0,0.24)]',
            plan.id === 'ultimate'
              ? 'bg-[linear-gradient(90deg,#8F94FF_0%,#7D69FF_100%)]'
              : 'bg-[linear-gradient(90deg,#8F94FF_0%,#6976FF_100%)]'
          )}
        >
          {plan.badge}
        </div>
      ) : null}

      <div className="relative z-10 flex h-full flex-col">
        <header className="mx-4 mb-2 border-b border-stone-200/90 pb-4 dark:border-white/8">
          <div className="flex flex-col items-start gap-2">
            <div className={cn('text-2xl font-semibold', plan.accentTextClassName)}>{plan.name}</div>
            <p className="text-sm leading-6 text-stone-700 dark:text-white/72">{plan.description}</p>
          </div>
        </header>

        <div className="mb-2 px-6 py-2 text-sm">
          <div className="flex items-baseline gap-1 leading-[1.2]">
            <span className="text-xl font-bold text-stone-500 dark:text-white/60">$</span>
            <span className="text-[40px] font-semibold tracking-[-0.06em]">{price.amount}</span>
            <span className="text-stone-400 dark:text-white/40">/</span>
            <span className="text-stone-500 dark:text-white/62">month</span>
          </div>
          <div className="mt-2 min-h-5 text-sm text-stone-600 dark:text-white/62">{price.billingNote}</div>
          {price.caption ? (
            <div className="mt-1 text-xs font-medium text-[#ff9f2f] dark:text-[#ffb347]">
              {price.caption}
            </div>
          ) : null}
        </div>

        <div className="mb-6 px-6">
          <Button type="button" className={cn('h-12 w-full rounded-xl border-none text-sm font-medium', plan.buttonClassName)}>
            {plan.buttonLabel ?? 'Subscribe Now'}
          </Button>
          <p className="mt-2 text-center text-xs text-stone-600 dark:text-white/54">
            {plan.buttonNote ?? 'Billing integration coming soon'}
          </p>
        </div>

        <div className={cn('relative mx-6 mb-6 overflow-hidden rounded-lg p-4', plan.accentPanelClassName)}>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="text-sm text-stone-950 dark:text-white">
              <span className={cn('mx-1 font-semibold', plan.accentTextClassName)}>
                {plan.monthlyCredits}
              </span>
              tokens monthly
            </div>
            <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-white/60">
              <Sparkles className="mt-[1px] size-3.5 shrink-0 text-[#ff9f2f]" />
              <span>{plan.monthlyVideosEquivalent}</span>
            </div>
          </div>
        </div>

        <div className="mb-3 space-y-3 px-5 pl-6 text-left text-sm">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <Check className="mt-[2px] size-4 shrink-0 text-[#ff9f2f] dark:text-[#9283FF]" />
              <span className="leading-6 text-stone-900 dark:text-white/88">{feature}</span>
            </div>
          ))}

          {plan.notes?.map((note) => (
            <div key={note} className="flex items-start gap-2 pl-6 text-xs text-stone-600 dark:text-white/52">
              <Sparkles className="mt-[1px] size-3.5 shrink-0 text-stone-400 dark:text-white/35" />
              <span className="leading-5">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
