import type { ContestItem } from '../types';

import { ContestCard } from './contest-card';

type ContestListProps = {
  contests: ContestItem[];
};

export function ContestList({ contests }: ContestListProps) {
  return (
    <div className="flex snap-x snap-mandatory flex-nowrap items-center gap-6 overflow-x-auto py-12 pl-6 pr-6 lg:w-full lg:snap-none lg:justify-center lg:overflow-visible lg:p-0 lg:py-14">
      {contests.map((contest) => (
        <ContestCard key={contest.id} contest={contest} />
      ))}
    </div>
  );
}
