'use client';

import type { ReferenceVideoSlide } from '../../types';

import Image from 'next/image';

type VideoCardProps = {
  slide: ReferenceVideoSlide;
};

export function VideoCard({ slide }: VideoCardProps) {
  return (
    <div className="relative overflow-hidden rounded-none border border-stone-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:rounded-lg dark:border-white/8 dark:bg-[#0b0b0b] dark:shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
        <Image
          fill
          src={slide.poster}
          alt={slide.previewVideoAlt}
          sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
          className="absolute inset-0 block h-full w-full object-cover object-center"
          style={{
            objectPosition: slide.mediaPosition ?? 'center',
            transform: `scale(${slide.mediaScale ?? 1})`,
          }}
        />
      </div>
    </div>
  );
}
