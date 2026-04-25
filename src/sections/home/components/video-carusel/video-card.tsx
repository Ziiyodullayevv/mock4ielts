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
      <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.12)] dark:border-white/8 dark:bg-[#0b0b0b] dark:shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
        <div className="relative aspect-video w-full">
          <Image
            fill
            src={slide.poster}
            alt={slide.previewVideoAlt}
            sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
          />

          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            poster={slide.poster}
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
            aria-label={slide.previewVideoAlt}
          >
            <source src={slide.previewVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
