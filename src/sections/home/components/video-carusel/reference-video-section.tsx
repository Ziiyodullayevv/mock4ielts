import type { ReferenceVideoSectionContent } from '../../types';

import { ReferenceCarousel } from './reference-carousel';

export function ReferenceVideoSection({ slides }: ReferenceVideoSectionContent) {
  return (
    <div className="mx-auto w-full max-w-230">
      <ReferenceCarousel slides={slides} />
    </div>
  );
}
