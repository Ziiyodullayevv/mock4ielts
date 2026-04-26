import { CONTESTS, CONTEST_CUP_IMAGE } from '../data';
import {
  ContestList,
  ContestHeader,
  ContestSponsorLink,
  ContestBottomSection,
} from '../components';

export function ContestView() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-20 sm:pt-20">
        <ContestHeader cupImageUrl={CONTEST_CUP_IMAGE} />
        <ContestList contests={CONTESTS} />
        <ContestSponsorLink />
        <ContestBottomSection />
      </div>
    </section>
  );
}
