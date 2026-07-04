'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useRef, useEffect } from 'react';

import { BenefitCard } from './components/why';
import { benefits, galleryImages } from './data';

const GALLERY_TILE_COUNT = 60;
const GALLERY_PERSPECTIVE_PX = 920;
const GALLERY_PLANE_TRANSFORM = 'translateX(-50%) rotateX(28deg) scale3d(1.12, 1.04, 1)';

const tiledImages = Array.from(
  { length: GALLERY_TILE_COUNT },
  (_, index) => galleryImages[index % galleryImages.length]
);

const HIDDEN = { opacity: 0, y: 24, filter: 'blur(8px)' };
const VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const EASE = [0.22, 1, 0.36, 1] as const;

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
        <motion.h2
          initial={HIDDEN}
          whileInView={VISIBLE}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center text-[48px] font-medium leading-tight text-stone-950 max-md:text-[32px] dark:text-white"
        >
          Why MOCK4IELTS?
        </motion.h2>

        <motion.div
          initial={HIDDEN}
          whileInView={VISIBLE}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          className="my-4 hidden h-0.5 w-12.5 bg-stone-300 max-md:block dark:bg-white/25"
        />

        <motion.p
          initial={HIDDEN}
          whileInView={VISIBLE}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
          className="mt-3 max-w-190 text-center text-base text-stone-600 dark:text-white/65"
        >
          Mock4IELTS helps you practice smarter with real exam-style questions, full mock tests, and
          progress tracking.
        </motion.p>

        <div className="mt-20 flex w-full items-start justify-center gap-18 max-lg:gap-10 max-md:mt-12 max-md:flex-col max-md:items-center max-md:gap-8">
          {benefits.map((item, index) => (
            <motion.div
              key={item.title}
              initial={HIDDEN}
              whileInView={VISIBLE}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: 0.1 + index * 0.12, ease: EASE }}
              className="flex items-start gap-18 max-lg:gap-10 max-md:w-full max-md:flex-col max-md:items-center max-md:gap-8"
            >
              <BenefitCard item={item} />

              {index !== benefits.length - 1 && (
                <div className="mt-6 h-33 w-px bg-stone-200 max-md:mt-0 max-md:h-px max-md:w-full dark:bg-white/15" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div ref={gallerySectionRef} className="relative mt-10 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.985)_16%,rgba(255,255,255,0.92)_38%,rgba(255,255,255,0.68)_58%,rgba(255,255,255,0.28)_78%,rgba(255,255,255,0)_100%)] max-md:h-24 dark:bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.985)_16%,rgba(0,0,0,0.92)_38%,rgba(0,0,0,0.68)_58%,rgba(0,0,0,0.28)_78%,rgba(0,0,0,0)_100%)]" />
        <div className="pointer-events-none absolute inset-x-[-5%] top-0 z-10 h-18 bg-background/72 blur-3xl max-md:h-14 dark:bg-black/72" />

        <div className="relative w-full" style={{ perspective: `${GALLERY_PERSPECTIVE_PX}px` }}>
          <div
            className="relative left-1/2 w-[116vw] min-w-[78rem] max-w-none max-lg:w-[134vw] max-lg:min-w-[54rem] max-md:w-[152vw] max-md:min-w-[38rem]"
            style={{
              transform: GALLERY_PLANE_TRANSFORM,
              transformOrigin: 'center top',
            }}
          >
            <div className="relative h-145 overflow-hidden max-md:h-72">
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
