'use client';

import { useEffect } from 'react';
import { paths } from '@/src/routes/paths';
import { useRouter } from '@/src/routes/hooks';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { LoadingScreen } from '@/src/components/loading-screen';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { subscriptionPageBackgroundClassName } from '@/src/sections/subscription/constants/subscription';

import { StatisticsOverview } from '../components/statistics-overview';

export function MyStatisticsView() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthSession();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    router.replace(buildLoginHref(paths.statistics.root));
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <main className={`${subscriptionPageBackgroundClassName} pb-14 pt-24`}>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6">
          <h1 className="text-[34px] font-semibold tracking-[-0.05em] text-stone-950 dark:text-white sm:text-[42px]">
            My Statistics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-white/64 sm:text-base">
            Review your progress across practice, mock exams, contests, and the full question bank.
          </p>
        </div>

        <StatisticsOverview />
      </div>
    </main>
  );
}
