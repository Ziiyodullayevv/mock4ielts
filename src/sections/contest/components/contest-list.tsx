import type { ContestItem } from '../types';

import { ContestCard } from './contest-card';

type ContestListProps = {
  contests: ContestItem[];
};

export function ContestList({ contests }: ContestListProps) {
  return (
    <div className="flex w-full snap-x snap-mandatory flex-nowrap items-center gap-5 overflow-x-auto px-4 py-6 [scroll-padding-left:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:[scroll-padding-left:1.5rem] lg:snap-none lg:justify-center lg:overflow-visible lg:px-10 lg:py-5 lg:pt-12">
      {contests.map((contest) => (
        <ContestCard key={contest.id} contest={contest} />
      ))}
    </div>
  );
}
