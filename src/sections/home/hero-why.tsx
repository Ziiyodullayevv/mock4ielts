'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

import { BenefitCard } from './components/why';
import { benefits, galleryImages } from './data';

const tiledImages = [...galleryImages, ...galleryImages];

export function HeroWhy() {
  const gallerySectionRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      const element = gallerySectionRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const start = viewportHeight * 0.9;
      const end = -rect.height * 0.45;

      const rawProgress = (start - rect.top) / (start - end);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(clampedProgress);
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

  const desktopTranslateY = -700 * scrollProgress;
  const mobileTranslateY = -220 * scrollProgress;

  return (
    <section className="my-20 w-full overflow-hidden bg-black text-white">
      <div className="mx-auto flex max-w-360 flex-col items-center px-6">
        <h2 className="text-center text-[48px] font-medium leading-tight max-md:text-[32px]">
          Why MOCK4IELTS?
        </h2>

        <div className="my-4 hidden h-0.5 w-12.5 bg-white/25 max-md:block" />

        <p className="mt-3 max-w-190 text-center text-base text-white/65">
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
                <div className="mt-6 h-33 w-px bg-white/15 max-md:mt-0 max-md:h-px max-md:w-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div ref={gallerySectionRef} className="relative mt-10 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-linear-to-b from-black via-black/95 to-transparent max-md:h-16" />

        <div className="flex justify-center" style={{ perspective: '900px' }}>
          <div className="max-w-none max-md:relative max-md:left-1/2 max-md:w-[calc(100%+3rem)] max-md:-translate-x-1/2" style={{ transform: 'rotateX(28deg)' }}>
            <div className="relative h-135 overflow-hidden max-md:h-64">
              <div
                className="grid grid-cols-5 justify-items-center gap-5 px-6 pb-10 transition-transform duration-75 ease-out max-md:grid-cols-3 max-md:gap-2 max-md:px-3"
                style={{
                  transform: `translate3d(0, ${
                    typeof window !== 'undefined' && window.innerWidth < 768
                      ? mobileTranslateY
                      : desktopTranslateY
                  }px, 0)`,
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
                    className="aspect-[1.58/1] h-50 w-70 object-cover opacity-90 transition-transform duration-300 max-md:h-32 max-md:w-46"
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
