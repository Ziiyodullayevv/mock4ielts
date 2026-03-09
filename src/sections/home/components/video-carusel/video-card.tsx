'use client';

import type { ReferenceVideoSlide } from '../../types';

import Image from 'next/image';
import { useRef, useEffect } from 'react';

type VideoCardProps = {
  isActive: boolean;
  slide: ReferenceVideoSlide;
};

export function VideoCard({ isActive, slide }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      videoElement.currentTime = 0;
      void videoElement.play().catch(() => undefined);
      return;
    }

    videoElement.pause();
  }, [isActive]);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl bg-[#0b0b0b] shadow-[0_30px_120px_rgba(0,0,0,0.75)] md:rounded-xl">
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            poster={slide.poster}
            className="h-full w-full object-cover"
            aria-label={slide.previewVideoAlt}
          >
            <source src={slide.previewVideo} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-26 bg-linear-to-t from-black/65 to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 w-[88%] max-w-90 -translate-x-1/2 rounded-2xl border border-white/15 bg-black/75 p-2 backdrop-blur-sm md:bottom-4">
        <div className="flex items-center gap-1.5 md:gap-2">
          {slide.references.map((reference, index) => (
            <div key={reference.id} className="contents">
              <div className="relative h-14 min-w-0 flex-1 overflow-hidden rounded-lg border border-white/15 md:h-16">
                <Image
                  fill
                  src={reference.image}
                  alt={reference.alt}
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              {index < slide.references.length - 1 ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-xs font-semibold text-white md:size-6 md:text-sm">
                  +
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none mx-auto mt-2 h-8 w-[72%] rounded-full bg-[#7f4517]/35 blur-2xl md:mt-5 md:h-12" />
    </div>
  );
}
