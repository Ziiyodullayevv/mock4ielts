'use client';

import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/src/routes/paths';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';

import { HERO_SLIDES } from './data/hero-slides.data';

const AUTOPLAY_DELAY_MS = 4200;
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
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const firstHeroSlide = HERO_SLIDES[0];
  const activeHeroSlide = isDesktopViewport ? HERO_SLIDES[activeSlide] : firstHeroSlide;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const updateViewportMode = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewportMode();
    mediaQuery.addEventListener('change', updateViewportMode);

    return () => mediaQuery.removeEventListener('change', updateViewportMode);
  }, []);

  useEffect(() => {
    if (!isDesktopViewport) return undefined;

    const timeoutId = window.setTimeout(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeSlide, isDesktopViewport]);

  useEffect(() => {
    if (!isDesktopViewport || !videoRef.current) return;

    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => undefined);
  }, [activeSlide, isDesktopViewport]);

  return (
    <section className="relative h-[660px] w-full overflow-hidden bg-[#111] text-white lg:h-screen lg:min-h-155">
      <div className="absolute -inset-2">
        <Image
          src={firstHeroSlide.optimizedPoster}
          alt="Hero poster"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          unoptimized
          className="object-cover object-center lg:hidden"
        />

        <div className="absolute inset-0 hidden lg:block">
          <Image
            src={activeHeroSlide.optimizedPoster}
            alt="Hero poster"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            unoptimized
            className="object-cover object-center"
          />

          <video
            key={activeHeroSlide.video}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            poster={activeHeroSlide.optimizedPoster}
            preload="metadata"
          >
            <source src={activeHeroSlide.video} type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="absolute inset-0 lg:bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.04)_34%,rgba(0,0,0,0.24)_100%)]" />

      <div className="relative z-10 flex h-[660px] w-full flex-col justify-end px-6 pb-22 pt-28 text-center lg:hidden">
        <h1 className="mx-auto max-w-[19rem] text-[3.15rem] font-semibold leading-[0.92] tracking-[-0.065em] text-white text-shadow-sm">
          Reach your target IELTS score
        </h1>

        <p className="mx-auto mt-5 max-w-[22rem] text-lg font-medium leading-7 text-white/92 text-shadow-sm">
          All-in-one IELTS practice platform — fast, realistic, and effective
        </p>

        <Button
          asChild
          className="mx-auto mt-8 h-14 w-full max-w-[14rem] rounded-full text-base font-semibold"
          variant="black"
        >
          <Link href={paths.mockExam.root}>Try Now</Link>
        </Button>
      </div>

      <div className="relative z-10 mx-auto hidden h-full w-full max-w-7xl flex-col items-center justify-end px-6 pb-40 text-center lg:flex">
        <h1 className="max-w-5xl text-4xl text-shadow-sm font-semibold leading-[1.04] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl">
          Reach your target IELTS score
        </h1>

        <p className="mt-6 max-w-200 text-shadow-sm font-medium text-base text-white/90 sm:text-2xl">
          All-in-one IELTS practice platform — fast, realistic, and effective
        </p>

        <div className="mt-10 flex w-full max-w-4xl items-center gap-3 rounded-full border border-white/20 bg-white/14 p-1.5 pl-3 shadow-lg backdrop-blur-sm">
          <div className="relative size-7 ml-2 shrink-0 overflow-hidden  rounded-sm">
            <Image
              src={activeHeroSlide.optimizedPoster}
              alt="Current prompt"
              fill
              className="object-cover"
            />
          </div>

          <div className="h-4 bg-white w-px" />

          <p className="line-clamp-1 flex-1 text-left text-shadow-sm text-white/90 text-base">
            {activeHeroSlide.prompt}
          </p>

          <Button asChild className="h-11 rounded-full px-5 text-sm font-semibold" variant="black">
            <Link href={paths.mockExam.root}>Try Now</Link>
          </Button>
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
              className="absolute left-1/2 overflow-hidden rounded-lg shadow-lg -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            >
              <Image
                src={slide.optimizedPoster}
                alt="Slide thumbnail"
                fill
                sizes="64px"
                unoptimized
                className={`object-cover transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-95'}`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
