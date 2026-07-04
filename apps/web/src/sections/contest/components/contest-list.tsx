import type { ContestItem } from '../types';

import { ContestCard } from './contest-card';
import { getContestDisplayTone } from '../utils';

type ContestListProps = {
  contests: ContestItem[];
  isError?: boolean;
  isLoading?: boolean;
};

function getLatestContests(contests: ContestItem[]) {
  return contests
    .slice()
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())
    .slice(0, 2);
}

export function ContestList({ contests, isError = false, isLoading = false }: ContestListProps) {
  if (isLoading) {
    return (
      <div className="flex w-full snap-x snap-mandatory flex-nowrap items-center gap-5 overflow-x-auto px-4 py-6 [scroll-padding-left:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:[scroll-padding-left:1.5rem] lg:snap-none lg:justify-center lg:overflow-visible lg:px-10 lg:py-5 lg:pt-12">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-[250px] w-[min(34rem,calc(100vw-3.5rem))] shrink-0 animate-pulse rounded-[2rem] bg-black/8 dark:bg-white/8 lg:w-[400px]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-8 rounded-2xl bg-black/5 px-6 py-5 text-sm text-black/65 dark:bg-white/7 dark:text-white/65">
        Contests could not be loaded right now.
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="my-8 rounded-2xl bg-black/5 px-6 py-5 text-sm text-black/65 dark:bg-white/7 dark:text-white/65">
        No contests are available yet.
      </div>
    );
  }

  const visibleContests = getLatestContests(contests);

  return (
    <div className="flex w-full snap-x snap-mandatory flex-nowrap items-center gap-5 overflow-x-auto px-4 py-6 [scroll-padding-left:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:[scroll-padding-left:1.5rem] lg:snap-none lg:justify-center lg:overflow-visible lg:px-10 lg:py-5 lg:pt-12">
      {visibleContests.map((contest, index) => (
        <ContestCard
          key={contest.id}
          contest={contest}
          tone={getContestDisplayTone(contest.title, index === 1 ? 'violet' : 'default')}
        />
      ))}
    </div>
  );
}
