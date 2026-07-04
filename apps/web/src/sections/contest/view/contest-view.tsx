'use client';

import { CONTEST_CUP_IMAGE } from '../data';
import { useContestsQuery } from '../hooks';
import {
  ContestList,
  ContestHeader,
  ContestSponsorLink,
  ContestBottomSection,
} from '../components';

export function ContestView() {
  const contestsQuery = useContestsQuery({ size: 20 });

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center pt-16 pb-10 sm:pt-20">
        <div className="w-full px-4 sm:px-6">
          <ContestHeader cupImageUrl={CONTEST_CUP_IMAGE} />
        </div>

        <ContestList
          contests={contestsQuery.data?.items ?? []}
          isError={contestsQuery.isError}
          isLoading={contestsQuery.isLoading}
        />

        <div className="w-full px-4 sm:px-6">
          <ContestSponsorLink />
        </div>

        <div className="w-full px-4 sm:px-6">
          <ContestBottomSection />
        </div>
      </div>
    </section>
  );
}
