import { RankingPanel } from './ranking/ranking-panel';
import { PastContestsPanel } from './past-contests/past-contests-panel';
import { PAST_CONTESTS, GLOBAL_RANKING_LIST, GLOBAL_RANKING_PODIUM } from '../data';

export function ContestBottomSection() {
  return (
    <div className="mt-12 flex w-full max-w-6xl flex-col items-start gap-12 md:items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <RankingPanel podium={GLOBAL_RANKING_PODIUM} list={GLOBAL_RANKING_LIST} />
      <PastContestsPanel entries={PAST_CONTESTS} />
    </div>
  );
}
