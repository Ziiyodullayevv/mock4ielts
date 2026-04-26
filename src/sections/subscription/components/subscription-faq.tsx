'use client';

import type { SubscriptionFaq as SubscriptionFaqItem } from '@/src/sections/subscription/types/subscription';

import { cn } from '@/src/lib/utils';
import { subscriptionCardClassName } from '@/src/sections/subscription/constants/subscription';

type SubscriptionFaqProps = {
  items: SubscriptionFaqItem[];
};

export function SubscriptionFaq({ items }: SubscriptionFaqProps) {
  return (
    <section className="pt-10 sm:pt-8">
      <div className="mx-auto w-full max-w-[1192px] px-1 sm:px-0">
        <h2 className="mb-8 text-center text-xl font-semibold text-stone-950 dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="mx-auto flex w-full flex-col gap-4">
          {items.map((item) => (
            <details
              key={item.question}
              className={cn(
                subscriptionCardClassName,
                'group rounded-2xl shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none'
              )}
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-base font-semibold text-stone-950 transition sm:px-4 sm:py-4 dark:text-white">
                <div className="flex items-center">{item.question}</div>
                <span className="text-lg text-stone-500 transition-transform duration-200 group-open:rotate-45 dark:text-white/52">
                  +
                </span>
              </summary>

              <div className="px-6 pb-6 pt-4 text-sm leading-7 text-stone-600 sm:px-4 dark:text-white/66">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
