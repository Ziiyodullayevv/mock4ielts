'use client';

import type { ReferenceVideoSlide } from '../../types';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

type VideoCardProps = {
  isActive: boolean;
  slide: ReferenceVideoSlide;
};

export function VideoCard({ isActive, slide }: VideoCardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const hasVideo = Boolean(slide.previewVideo);
  const shouldPlayVideo = hasVideo && isActive && isInView;

  const mediaFrameClassName = 'absolute inset-0 block h-full w-full object-cover object-center';
  const mediaTransformStyle = {
    objectPosition: slide.mediaPosition ?? 'center',
    transform: `scale(${slide.mediaScale ?? 1})`,
  } as const;

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(rootElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (shouldPlayVideo) {
      videoElement.currentTime = 0;
      void videoElement.play().catch(() => undefined);
    } else {
      videoElement.pause();
    }
  }, [shouldPlayVideo]);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative overflow-hidden rounded-none border border-stone-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:rounded-lg dark:border-white/8 dark:bg-[#0b0b0b] dark:shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
          <Image
            fill
            priority={isActive}
            src={slide.poster}
            alt={slide.previewVideoAlt}
            sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
            className={mediaFrameClassName}
            style={mediaTransformStyle}
          />

          {hasVideo && (
            <video
              ref={videoRef}
              loop
              muted
              autoPlay
              playsInline
              preload="auto"
              poster={slide.poster}
              className={mediaFrameClassName}
              style={{
                ...mediaTransformStyle,
                opacity: shouldPlayVideo ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
              aria-label={slide.previewVideoAlt}
            >
              <source src={slide.previewVideo} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
