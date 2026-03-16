'use client';

import { Expand, Minimize } from 'lucide-react';

import { useFullscreen } from './use-fullscreen';

export function FullscreenToggle() {
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();
  const Icon = isFullscreen ? Minimize : Expand;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      disabled={!isSupported}
      className="flex size-11 items-center justify-center rounded-full border border-border/30 bg-white shadow-md transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
    >
      <Icon className="size-4" />
    </button>
  );
}
