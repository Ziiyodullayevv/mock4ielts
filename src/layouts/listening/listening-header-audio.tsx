'use client';

import type { ListeningHeaderAudioControls } from './use-listening-header-audio';

import { cn } from '@/src/lib/utils';
import { Slider } from '@/src/components/ui/slider';
import { Play, Pause, Volume1, Volume2, VolumeX } from 'lucide-react';
import { PracticeAudioSliderCard } from '@/src/layouts/practice/practice-audio-slider-card';

type ListeningHeaderAudioProps = {
  controls: ListeningHeaderAudioControls;
  variant?: 'desktop' | 'mobile';
};

export function ListeningHeaderAudio({ controls, variant = 'desktop' }: ListeningHeaderAudioProps) {
  const { handleToggleMute, handleVolumeChange, volume } = controls;
  const isMobileVariant = variant === 'mobile';
  const progressMax = controls.duration > 0 ? controls.duration : 1;
  const PlaybackIcon = controls.isPlaying ? Pause : Play;

  if (isMobileVariant) {
    return (
      <div>
        {controls.canControlPlayback ? (
          <div className="border-b border-stone-200/70 px-2.5 py-2.5 dark:border-white/8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={controls.handleTogglePlay}
                aria-label={controls.isPlaying ? 'Pause audio' : 'Play audio'}
                title={controls.isPlaying ? 'Pause audio' : 'Play audio'}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-white/86"
              >
                <PlaybackIcon className="size-4" strokeWidth={2.2} />
              </button>

              <Slider
                value={[Math.min(controls.currentTime, progressMax)]}
                max={progressMax}
                step={0.25}
                onValueChange={(nextValue) => controls.handleSeek(nextValue[0] ?? 0)}
                aria-label="Audio progress"
                className="min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:shadow-[0_4px_10px_rgba(255,159,47,0.3)] [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-[#ffb347] dark:[&_[data-slot=slider-track]]:bg-white/18"
              />
            </div>
          </div>
        ) : null}

        <PracticeAudioSliderCard
          volume={volume}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
        />
      </div>
    );
  }

  const LeadingVolumeIcon = volume === 0 ? VolumeX : Volume1;

  return (
    <div className={cn('flex shrink-0 items-center', isMobileVariant ? 'w-full' : 'w-[230px]')}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
            isMobileVariant ? 'h-9 w-9' : ''
          )}
          aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          title={volume === 0 ? 'Unmute audio' : 'Mute audio'}
        >
          <LeadingVolumeIcon
            className={cn(isMobileVariant ? 'size-5' : 'size-4.5')}
            strokeWidth={2.2}
          />
        </button>

        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(nextValue) => handleVolumeChange(nextValue[0] ?? 0)}
          aria-label="Audio volume"
          className={cn(
            'min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-stone-400 [&_[data-slot=slider-thumb]]:border-stone-800 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_8px_18px_rgba(15,23,42,0.18)] [&_[data-slot=slider-track]]:bg-stone-200 dark:[&_[data-slot=slider-range]]:bg-white/68 dark:[&_[data-slot=slider-thumb]]:border-white/20 dark:[&_[data-slot=slider-thumb]]:bg-white dark:[&_[data-slot=slider-thumb]]:shadow-none dark:[&_[data-slot=slider-track]]:bg-white/14',
            isMobileVariant
              ? '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2'
              : '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2'
          )}
        />

        <button
          type="button"
          onClick={() => handleVolumeChange(100)}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
            isMobileVariant ? 'h-9 w-9' : ''
          )}
          aria-label="Set audio volume to maximum"
          title="Set audio volume to maximum"
        >
          <Volume2 className={cn(isMobileVariant ? 'size-5' : 'size-4.5')} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
