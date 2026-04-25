'use client';

import 'ldrs/react/Zoomies.css';

import { Zoomies } from 'ldrs/react';

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-white text-stone-950 dark:bg-[#050505] dark:text-white">
      <Zoomies size="80" stroke="5" bgOpacity="0.1" speed="1.4" color="#ff9f2f" />
    </div>
  );
}
