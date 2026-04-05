import type { ReferenceVideoSectionContent } from '../../types';

import { ReferenceCarousel } from './reference-carousel';

export function ReferenceVideoSection({ slides }: ReferenceVideoSectionContent) {
  return (
    <div className="mx-auto w-full max-w-230 max-sm:-mx-4 max-sm:w-[calc(100%+2rem)]">
      <ReferenceCarousel slides={slides} />
    </div>
  );
}
