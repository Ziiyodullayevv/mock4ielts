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
          <Image
            fill
            src={slide.poster}
            alt={slide.previewVideoAlt}
            sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            poster={slide.poster}
            className="absolute inset-0 h-full w-full object-cover"
            aria-label={slide.previewVideoAlt}
          >
            <source src={slide.previewVideo} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-26 bg-linear-to-t from-black/65 to-transparent" />
        </div>
      </div>

      <div className="pointer-events-none mx-auto mt-2 h-8 w-[72%] rounded-full bg-[#7f4517]/35 blur-2xl md:mt-5 md:h-12" />
    </div>
  );
}
