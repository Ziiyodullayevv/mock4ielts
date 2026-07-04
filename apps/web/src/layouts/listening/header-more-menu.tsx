'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Expand, Minimize, MoonStar, SunMedium } from 'lucide-react';

import { useFullscreen } from './use-fullscreen';

export function PracticeHeaderThemeButton() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');
  const ThemeIcon = isDarkMode ? MoonStar : SunMedium;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={mounted ? isDarkMode : undefined}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white"
    >
      <ThemeIcon className="size-4.5" strokeWidth={1.9} />
    </button>
  );
}

export const ListeningHeaderMoreMenu = PracticeHeaderThemeButton;

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
      className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white dark:disabled:text-white/30 dark:disabled:hover:bg-transparent"
    >
      <FullscreenIcon className="size-4.5" strokeWidth={1.9} />
    </button>
  );
}
