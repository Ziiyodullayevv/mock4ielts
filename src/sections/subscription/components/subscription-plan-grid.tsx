'use client';

import type {
  SubscriptionPlan,
  SubscriptionPeriod,
} from '@/src/sections/subscription/types/subscription';

import { SubscriptionPlanCard } from '@/src/sections/subscription/components/subscription-plan-card';

type SubscriptionPlanGridProps = {
  period: SubscriptionPeriod;
  plans: SubscriptionPlan[];
};

export function SubscriptionPlanGrid({ period, plans }: SubscriptionPlanGridProps) {
  return (
    <section className="mt-8">
      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <SubscriptionPlanCard key={plan.id} plan={plan} period={period} />
        ))}
      </div>
    </section>
  );
}
