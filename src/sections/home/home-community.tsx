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
      className="relative isolate flex min-h-[46rem] flex-col items-center justify-center overflow-hidden bg-black py-16 text-white sm:min-h-120 sm:py-10"
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
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#000_50%,#032f9f_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.24)_100%)]" />

      <FloatingImages communityImages={communityImages} mouseX={safeMouse.x} mouseY={safeMouse.y} />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-[19rem] flex-col items-center justify-center px-6 text-center sm:max-w-none sm:px-6">
        <div className="mb-8 hidden h-10 w-23 items-center justify-center rounded-full bg-white/15 backdrop-blur-md sm:flex">
          <Globe className="h-5 w-5 text-white" strokeWidth={1.9} />
        </div>

        <p className="text-[22px] font-medium leading-none tracking-[-0.04em] sm:text-[36px]">
          Join Our
        </p>

        <h2 className="mt-2 text-[3rem] font-semibold leading-[0.92] tracking-[-0.07em] sm:mt-4 sm:text-[72px] lg:text-[92px]">
          Community
        </h2>

        <div className="mt-9 flex w-full max-w-[16rem] flex-col items-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row">
          <Button
            className="h-14 w-full rounded-full bg-blue-600 px-5 hover:bg-blue-600 sm:w-auto"
            size="lg"
            variant="black"
          >
            <FaTelegramPlane className="size-5" />
            Join Telegram
          </Button>

          <Button className="h-14 w-full rounded-full px-5 sm:w-auto" size="lg" variant="outlined">
            Get Support
          </Button>
        </div>
      </div>
    </section>
  );
}
