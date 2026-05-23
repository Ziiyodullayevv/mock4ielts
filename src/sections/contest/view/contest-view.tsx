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
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center pt-16 pb-10 sm:pt-20">
        <div className="w-full px-4 sm:px-6">
          <ContestHeader cupImageUrl={CONTEST_CUP_IMAGE} />
        </div>

        <ContestList contests={CONTESTS} />

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
