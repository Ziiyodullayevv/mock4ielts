'use client';

import { Expand, Minimize } from 'lucide-react';

import { useFullscreen } from './use-fullscreen';

export function ListeningHeaderMoreMenu() {
  return (
    <div className="relative flex shrink-0">
      <button
        type="button"
        aria-label="More controls"
        title="More controls"
        className="inline-flex size-9 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  );
}

export function ListeningHeaderFullscreenButton() {
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();
  const FullscreenIcon = isFullscreen ? Minimize : Expand;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      disabled={!isSupported}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
    >
      <FullscreenIcon className="size-4.5" strokeWidth={1.9} />
    </button>
  );
}
