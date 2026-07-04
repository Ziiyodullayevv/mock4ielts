'use client';

import { cn } from '@/src/lib/utils';
import { Slider as SliderPrimitive } from 'radix-ui';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

type PracticeAudioSliderCardProps = {
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
  volume: number;
};

const SOUND_TICK_PERCENTS = [25, 50, 75] as const;

export function PracticeAudioSliderCard({
  onToggleMute,
  onVolumeChange,
  volume,
}: PracticeAudioSliderCardProps) {
  const LeadingIcon = volume === 0 ? VolumeX : Volume1;

  return (
    <div className="px-2.5 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          title={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200/70 hover:text-stone-950 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white"
        >
          <LeadingIcon className="size-4" strokeWidth={2} />
        </button>

        <SliderPrimitive.Root
          value={[volume]}
          min={0}
          max={100}
          step={1}
          aria-label="Audio volume"
          onValueChange={(nextValue) => onVolumeChange(nextValue[0] ?? 0)}
          className="relative flex w-full touch-none items-center select-none"
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {SOUND_TICK_PERCENTS.map((tickPercent) => {
              const isActiveTick = tickPercent <= volume;

              return (
                <span
                  key={tickPercent}
                  className={cn(
                    'absolute top-1/2 block h-2 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                    isActiveTick
                      ? 'bg-white/75 dark:bg-white/65'
                      : 'bg-stone-300 dark:bg-white/18'
                  )}
                  style={{ left: `${tickPercent}%` }}
                />
              );
            })}
          </div>

          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#eaedf1] dark:bg-white/10">
            <SliderPrimitive.Range className="absolute h-full bg-linear-to-r from-[#58d790] to-[#149174]" />
          </SliderPrimitive.Track>

          <SliderPrimitive.Thumb className="relative z-10 block size-4.5 shrink-0 rounded-full border-[3px] border-white bg-[#eff3f7] shadow-[0_5px_12px_rgba(148,163,184,0.32)] outline-none" />
        </SliderPrimitive.Root>

        <button
          type="button"
          onClick={() => onVolumeChange(100)}
          aria-label="Set audio volume to maximum"
          title="Set audio volume to maximum"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200/70 hover:text-stone-950 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white"
        >
          <Volume2 className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
