'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'motion/react';

const BANNER_IMAGE = '/assets/home/creative-banner/footer-banner.webp';
const BANNER_VIDEO = '/assets/home/creative-banner/footer-banner.mp4';

const HIDDEN = { opacity: 0, y: 24, filter: 'blur(8px)' };
const VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const EASE = [0.22, 1, 0.36, 1] as const;

export function HomeCreativeBanner() {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  return (
    <section
      className="relative isolate overflow-hidden bg-background text-foreground transition-colors duration-300 dark:bg-black dark:text-white"
      onFocus={() => setShouldLoadVideo(true)}
      onMouseEnter={() => setShouldLoadVideo(true)}
      onTouchStart={() => setShouldLoadVideo(true)}
    >
      <div className="relative h-[420px] w-full overflow-hidden max-md:h-[320px]">
        <Image
          src={BANNER_IMAGE}
          alt="Video cover"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />

        {shouldLoadVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={BANNER_IMAGE}
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            <source src={BANNER_VIDEO} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-white/48 dark:bg-black/40" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <motion.h2
            initial={HIDDEN}
            whileInView={VISIBLE}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="text-[48px] font-medium text-stone-950 max-md:text-[32px] dark:text-white"
          >
            Real IELTS Exam Experience
          </motion.h2>

          <motion.div
            initial={HIDDEN}
            whileInView={VISIBLE}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.16, ease: EASE }}
            className="flex gap-4 max-md:flex-col-reverse"
          >
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-[#006aff] px-10 py-2 text-[16px] font-semibold text-white shadow-lg transition-all hover:shadow-xl max-md:text-[14px] max-md:leading-[28px]"
            >
              Try it now
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="-mt-[2px] relative flex w-full scale-y-[-1] items-center justify-center">
        <div className="relative aspect-video h-[155px] w-full max-md:h-[110px]">
          <Image
            src={BANNER_IMAGE}
            alt="Video reflection"
            fill
            sizes="100vw"
            className="hidden object-cover object-center"
          />

          {shouldLoadVideo && (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={BANNER_IMAGE}
              className="block h-full w-full object-cover object-bottom"
            >
              <source src={BANNER_VIDEO} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="absolute h-[157px] w-full bg-gradient-to-b from-white to-white/60 backdrop-blur-[10px] dark:from-black dark:to-black/60" />
      </div>
    </section>
  );
}
