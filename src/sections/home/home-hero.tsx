'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';

import { HERO_SLIDES } from './data/hero-slides.data';

const AUTOPLAY_DELAY_MS = 3600;
const VISIBLE_THUMB_DISTANCE = 2;
const THUMB_SPACING = 50;

const THUMB_SIZE_BY_DISTANCE: Record<number, number> = {
  0: 40,
  1: 35,
  2: 25,
};

const THUMB_OPACITY_BY_DISTANCE: Record<number, number> = {
  0: 1,
  1: 0.72,
  2: 0.34,
};

function getCircularOffset(index: number, activeIndex: number, totalSlides: number) {
  const forwardOffset = (index - activeIndex + totalSlides) % totalSlides;
  const backwardOffset = forwardOffset - totalSlides;

  return Math.abs(forwardOffset) <= Math.abs(backwardOffset) ? forwardOffset : backwardOffset;
}

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeSlide]);

  useEffect(() => {
    videoRefs.current.forEach((videoElement, index) => {
      if (!videoElement) return;

      if (index === activeSlide) {
        videoElement.currentTime = 0;
        void videoElement.play().catch(() => undefined);
      } else {
        videoElement.pause();
      }
    });
  }, [activeSlide]);

  return (
    <section className="relative h-screen min-h-155 w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.poster}
                alt="Hero poster"
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />

              <video
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                loop
                muted
                playsInline
                poster={slide.poster}
                preload={isActive ? 'auto' : 'metadata'}
                onCanPlay={() => {
                  if (!isActive) return;
                  void videoRefs.current[index]?.play().catch(() => undefined);
                }}
              >
                <source src={slide.video} type="video/mp4" />
              </video>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-end pb-40 px-6 text-center">
        <h1 className="max-w-5xl text-4xl text-shadow-sm font-semibold leading-[1.04] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl">
          Reach your target IELTS score
        </h1>

        <p className="mt-6 max-w-200 text-shadow-sm font-medium text-base text-white/90 sm:text-2xl">
          All-in-one IELTS practice platform — fast, realistic, and effective
        </p>

        <div className="mt-10 flex w-full max-w-4xl items-center gap-3 rounded-full border border-white/20 bg-white/14 p-1.5 pl-3 shadow-lg backdrop-blur-sm">
          <div className="relative size-7 ml-2 shrink-0 overflow-hidden  rounded-sm">
            <Image
              src={HERO_SLIDES[activeSlide].poster}
              alt="Current prompt"
              fill
              className="object-cover"
            />
          </div>

          <div className="h-4 bg-white w-px" />

          <p className="line-clamp-1 flex-1 text-left text-shadow-sm text-white/90 text-base">
            {HERO_SLIDES[activeSlide].prompt}
          </p>

          <Button variant="black">Try Now</Button>
        </div>
      </div>

      <div className="absolute right-5 top-1/2 z-20 hidden h-90 w-20 -translate-y-1/2 lg:block">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeSlide;
          const offset = getCircularOffset(index, activeSlide, HERO_SLIDES.length);
          const distance = Math.abs(offset);

          if (distance > VISIBLE_THUMB_DISTANCE) return null;

          const size = THUMB_SIZE_BY_DISTANCE[distance] ?? THUMB_SIZE_BY_DISTANCE[2];
          const opacity = THUMB_OPACITY_BY_DISTANCE[distance] ?? THUMB_OPACITY_BY_DISTANCE[2];

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${slide.id}`}
              onClick={() => setActiveSlide(index)}
              style={{
                height: `${size}px`,
                opacity,
                top: `calc(50% + ${offset * THUMB_SPACING}px)`,
                width: `${size}px`,
                zIndex: 20 - distance,
              }}
              className="absolute left-1/2 shadow-lg rounded-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-all duration-500 ease-out"
            >
              <Image
                src={slide.poster}
                alt="Slide thumbnail"
                fill
                sizes="64px"
                className={`object-cover transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-95'}`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
