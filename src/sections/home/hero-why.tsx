'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';

import { BenefitCard } from './components/why';
import { benefits, galleryImages } from './data';

const GALLERY_TILE_COUNT = 60;
const tiledImages = Array.from(
  { length: GALLERY_TILE_COUNT },
  (_, index) => galleryImages[index % galleryImages.length]
);

export function HeroWhy() {
  const gallerySectionRef = useRef<HTMLDivElement | null>(null);
  const galleryGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      const element = gallerySectionRef.current;
      const gridElement = galleryGridRef.current;
      if (!element || !gridElement) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const start = viewportHeight * 0.9;
      const end = -rect.height * 0.45;

      const rawProgress = (start - rect.top) / (start - end);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      const translateY = (window.innerWidth < 768 ? -220 : -700) * clampedProgress;

      gridElement.style.transform = `translate3d(0, ${translateY}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="my-20 w-full overflow-hidden bg-background text-stone-950 transition-colors duration-300 dark:bg-black dark:text-white">
      <div className="mx-auto flex max-w-360 flex-col items-center px-6">
        <h2 className="text-center text-[48px] font-medium leading-tight text-stone-950 max-md:text-[32px] dark:text-white">
          Why MOCK4IELTS?
        </h2>

        <div className="my-4 hidden h-0.5 w-12.5 bg-stone-300 max-md:block dark:bg-white/25" />

        <p className="mt-3 max-w-190 text-center text-base text-stone-600 dark:text-white/65">
          Mock4IELTS helps you practice smarter with real exam-style questions, full mock tests, and
          progress tracking.
        </p>

        <div className="mt-20 flex w-full items-start justify-center gap-18 max-lg:gap-10 max-md:mt-12 max-md:flex-col max-md:items-center max-md:gap-8">
          {benefits.map((item, index) => (
            <div
              key={item.title}
              className="flex items-start gap-18 max-lg:gap-10 max-md:w-full max-md:flex-col max-md:items-center max-md:gap-8"
            >
              <BenefitCard item={item} />

              {index !== benefits.length - 1 && (
                <div className="mt-6 h-33 w-px bg-stone-200 max-md:mt-0 max-md:h-px max-md:w-full dark:bg-white/15" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div ref={gallerySectionRef} className="relative mt-10 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-linear-to-b from-background via-background/95 to-transparent max-md:h-16 dark:from-black dark:via-black/95" />

        <div className="relative w-full" style={{ perspective: '1200px' }}>
          <div
            className="relative left-1/2 w-[108vw] min-w-[72rem] max-w-none max-lg:w-[124vw] max-lg:min-w-[48rem] max-md:w-[136vw] max-md:min-w-[34rem]"
            style={{
              transform: 'translateX(-50%) rotateX(22deg)',
              transformOrigin: 'center top',
            }}
          >
            <div className="relative h-135 overflow-hidden max-md:h-64">
              <div
                ref={galleryGridRef}
                className="grid w-full grid-cols-5 justify-items-stretch gap-4 px-0 pb-10 transition-transform duration-75 ease-out max-lg:grid-cols-4 max-md:grid-cols-3 max-md:gap-2"
                style={{
                  transform: 'translate3d(0, 0, 0)',
                  willChange: 'transform',
                }}
              >
                {tiledImages.map((image, index) => (
                  <Image
                    key={`${image.alt}-${index}`}
                    src={image.src}
                    alt={image.alt}
                    width={300}
                    height={180}
                    unoptimized
                    className="aspect-[1.58/1] h-50 w-full object-cover opacity-90 transition-transform duration-300 max-md:h-32"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
