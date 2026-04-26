'use client';

import { Globe } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { Button } from '@/src/components/ui/button';

import { communityImages } from './data';
import { FloatingImages } from './components/community/';

export function HomeCommunity() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const safeMouse = useMemo(
    () => ({
      x: mouse.x,
      y: mouse.y,
    }),
    [mouse.x, mouse.y]
  );

  return (
    <section
      className="relative isolate flex min-h-[46rem] flex-col items-center justify-center overflow-hidden bg-[#edf4ff] py-16 text-stone-950 sm:min-h-120 sm:py-10 dark:bg-black dark:text-white"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        setMouse({
          x,
          y,
        });
      }}
      onMouseLeave={() => {
        setMouse({ x: 0, y: 0 });
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f8fbff_0%,#e7f0ff_42%,#cfe1ff_100%)] dark:bg-[linear-gradient(160deg,#000_50%,#032f9f_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6)_0%,transparent_52%),linear-gradient(90deg,rgba(255,255,255,0.08)_0%,rgba(77,113,168,0.14)_100%)] dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.24)_100%)]" />

      <FloatingImages communityImages={communityImages} mouseX={safeMouse.x} mouseY={safeMouse.y} />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-[19rem] flex-col items-center justify-center px-6 text-center sm:max-w-none sm:px-6">
        <div className="mb-8 hidden h-10 w-23 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_38px_rgba(15,23,42,0.08)] backdrop-blur-md sm:flex dark:bg-white/15 dark:shadow-none">
          <Globe className="h-5 w-5 text-stone-900 dark:text-white" strokeWidth={1.9} />
        </div>

        <p className="text-[22px] font-medium leading-none tracking-[-0.04em] text-stone-700 sm:text-[36px] dark:text-white/82">
          Join Our
        </p>

        <h2 className="mt-2 text-[3rem] font-semibold leading-[0.92] tracking-[-0.07em] text-stone-950 sm:mt-4 sm:text-[72px] lg:text-[92px] dark:text-white">
          Community
        </h2>

        <div className="mt-9 flex w-full max-w-[16rem] flex-col items-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            className="h-14 w-full rounded-full bg-blue-600 px-5 text-white shadow-[0_18px_38px_rgba(37,99,235,0.22)] hover:bg-blue-600 sm:w-auto dark:shadow-none"
            size="lg"
            variant="black"
          >
            <FaTelegramPlane className="size-5" />
            Join Telegram
          </Button>

          <Button
            className="h-14 w-full rounded-full border border-stone-300 bg-white/82 px-5 text-stone-950 shadow-[0_18px_38px_rgba(15,23,42,0.08)] hover:bg-white sm:w-auto dark:border-white/20 dark:bg-transparent dark:text-white dark:shadow-none dark:hover:bg-white dark:hover:text-black"
            size="lg"
            variant="outlined"
          >
            Get Support
          </Button>
        </div>
      </div>
    </section>
  );
}
