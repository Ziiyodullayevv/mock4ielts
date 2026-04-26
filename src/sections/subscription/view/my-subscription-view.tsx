'use client';

import type { SubscriptionPeriod } from '@/src/sections/subscription/types/subscription';

import { useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from '@/src/routes/hooks';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { ProfileState } from '@/src/sections/profile/components/profile-state';
import { SUBSCRIPTION_FAQS } from '@/src/sections/subscription/data/subscription-faqs';
import { SUBSCRIPTION_PLANS } from '@/src/sections/subscription/data/subscription-plans';
import { SubscriptionFaq } from '@/src/sections/subscription/components/subscription-faq';
import { SubscriptionHero } from '@/src/sections/subscription/components/subscription-hero';
import { SubscriptionPlanGrid } from '@/src/sections/subscription/components/subscription-plan-grid';
import { SubscriptionPeriodToggle } from '@/src/sections/subscription/components/subscription-period-toggle';
import {
  DEFAULT_SUBSCRIPTION_PERIOD,
  subscriptionPageBackgroundClassName,
} from '@/src/sections/subscription/constants/subscription';

const getProfileInitials = (fullName?: string | null, email?: string) => {
  const source = fullName?.trim() || email?.trim() || 'A';
  const parts = source.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return 'A';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const normalizePeriod = (value?: string | null): SubscriptionPeriod =>
  value === 'subscription_monthly' || value === 'subscription_yearly'
    ? value
    : DEFAULT_SUBSCRIPTION_PERIOD;

export function MySubscriptionView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const {
    data: profile,
    error,
    isLoading,
    refetch,
  } = useMyProfileQuery(isAuthenticated);

  const period = normalizePeriod(searchParams.get('subscription-period'));

  const updatePeriod = (nextPeriod: SubscriptionPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('subscription-period', nextPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const rawPeriod = searchParams.get('subscription-period');

    if (rawPeriod === period) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('subscription-period', period);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, period, router, searchParams]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    router.replace(buildLoginHref(`${pathname}?subscription-period=${period}`));
  }, [isAuthenticated, isHydrated, pathname, period, router]);

  const currentPlanLabel = useMemo(() => {
    if (!profile) {
      return 'Free';
    }

    return 'Free';
  }, [profile]);

  if (!isHydrated) {
    return <ProfileState label="Loading your subscription..." />;
  }

  if (!isAuthenticated) {
    return <ProfileState label="Redirecting to login..." />;
  }

  if (isLoading && !profile) {
    return <ProfileState label="Loading your subscription..." />;
  }

  if (error instanceof Error && !profile) {
    return (
      <ProfileState
        actionLabel="Try again"
        description={error.message}
        label="We couldn't load your subscription."
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <main className={`${subscriptionPageBackgroundClassName} pb-14 pt-24`}>
      <div className="mx-auto w-full max-w-[1200px]">
        <SubscriptionHero
          avatar={profile?.avatar}
          currentPlanLabel={currentPlanLabel}
          email={profile?.email}
          fullName={profile?.fullName}
          initials={getProfileInitials(profile?.fullName, profile?.email)}
          plansLabel="Free"
          tokenBalance={profile?.tokenBalance ?? 0}
        />

        <SubscriptionPeriodToggle period={period} onChange={updatePeriod} />

        <SubscriptionPlanGrid period={period} plans={SUBSCRIPTION_PLANS} />

        <SubscriptionFaq items={SUBSCRIPTION_FAQS} />
      </div>
    </main>
  );
}
