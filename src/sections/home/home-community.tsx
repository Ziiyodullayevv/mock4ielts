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
      className="relative isolate flex flex-col justify-center min-h-120 py-10 overflow-hidden bg-black text-white"
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

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-10 w-23 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
          <Globe className="h-5 w-5 text-white" strokeWidth={1.9} />
        </div>

        <p className="text-[36px] font-medium leading-none tracking-[-0.04em] md:text-[28px]">
          Join Our
        </p>

        <h2 className="mt-4 text-[92px] font-semibold leading-[0.92] tracking-[-0.07em] md:text-[56px]">
          Community
        </h2>

        <div className="mt-10 flex items-center gap-3">
          <Button className="h-14 px-5 bg-blue-600 hover:bg-blue-600" size="lg" variant="black">
            <FaTelegramPlane className="size-5" />
            Join Telegram
          </Button>

          <Button className="h-14 px-5" size="lg" variant="outlined">
            Get Support
          </Button>
        </div>
      </div>
    </section>
  );
}
