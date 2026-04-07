'use client';

import type { ListeningHeaderAudioControls } from './use-listening-header-audio';

import { cn } from '@/src/lib/utils';
import { Slider } from '@/src/components/ui/slider';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

type ListeningHeaderAudioProps = {
  controls: ListeningHeaderAudioControls;
  variant?: 'desktop' | 'mobile';
};

export function ListeningHeaderAudio({
  controls,
  variant = 'desktop',
}: ListeningHeaderAudioProps) {
  const { handleToggleMute, handleVolumeChange, volume } = controls;
  const isMobileVariant = variant === 'mobile';
  const LeadingVolumeIcon = volume === 0 ? VolumeX : Volume1;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center',
        isMobileVariant ? 'w-full' : 'w-[230px]'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={handleToggleMute}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900',
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
            'min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-stone-400 [&_[data-slot=slider-thumb]]:border-stone-800 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_8px_18px_rgba(15,23,42,0.18)] [&_[data-slot=slider-track]]:bg-stone-200',
            isMobileVariant
              ? '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2'
              : '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2'
          )}
        />

        <button
          type="button"
          onClick={() => handleVolumeChange(100)}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900',
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
