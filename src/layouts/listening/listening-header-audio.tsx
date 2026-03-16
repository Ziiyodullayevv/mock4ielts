'use client';

import { useRef, useEffect } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

import { useListeningHeaderAudio } from './use-listening-header-audio';

type ListeningHeaderAudioProps = {
  audioUrl?: string;
};

export function ListeningHeaderAudio({ audioUrl }: ListeningHeaderAudioProps) {
  const {
    audioRef,
    controlRef,
    handleToggleMute,
    handleVolumeChange,
    handleVolumeTrackPointerDown,
    isVolumeOpen,
    setIsVolumeOpen,
    volume,
    volumeSurfaceRef,
  } = useListeningHeaderAudio(audioUrl);

  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const isFilled = volume > 50;

  const resetAutoClose = () => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = setTimeout(() => setIsVolumeOpen(false), 3000);
  };

  useEffect(() => {
    if (isVolumeOpen) resetAutoClose();
    else if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [isVolumeOpen]);

  const handleInteraction = () => {
    if (isVolumeOpen) resetAutoClose();
  };

  return (
    <div ref={controlRef} className="relative flex shrink-0 flex-col items-center">
      {audioUrl ? (
        <audio ref={audioRef} autoPlay preload="auto" src={audioUrl} className="hidden" />
      ) : null}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsVolumeOpen((s) => !s)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/30 bg-white text-stone-600 shadow-md transition-all duration-200 hover:bg-stone-100 hover:text-stone-900"
        aria-expanded={isVolumeOpen}
        aria-label="Open audio controls"
      >
        <VolumeIcon style={{ width: isVolumeOpen ? 14 : 16, height: isVolumeOpen ? 14 : 16 }} />
      </button>

      {/* Volume popup */}
      <div
        className="absolute top-[calc(100%+10px)] z-40"
        style={{
          left: '50%',
          transformOrigin: 'top center',
          transition:
            'opacity 0.25s cubic-bezier(0.34,1.4,0.64,1), transform 0.25s cubic-bezier(0.34,1.4,0.64,1)',
          opacity: isVolumeOpen ? 1 : 0,
          transform: isVolumeOpen
            ? 'translateX(-50%) scale(1) translateY(0)'
            : 'translateX(-50%) scale(0.88) translateY(-8px)',
          pointerEvents: isVolumeOpen ? 'auto' : 'none',
        }}
      >
        {/* Slider — rounded-xl, overflow-hidden ichki fill ni kesadi */}
        <div
          ref={volumeSurfaceRef}
          data-volume-surface
          role="slider"
          aria-label="Audio volume"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={volume}
          tabIndex={0}
          onPointerDown={(e) => {
            e.preventDefault();
            handleInteraction();
            handleVolumeTrackPointerDown(e.clientY);
          }}
          onPointerMove={handleInteraction}
          onKeyDown={(e) => {
            handleInteraction();
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
              e.preventDefault();
              handleVolumeChange(Math.min(100, volume + 5));
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
              e.preventDefault();
              handleVolumeChange(Math.max(0, volume - 5));
            }
          }}
          className="relative cursor-ns-resize overflow-hidden outline-none rounded-xl shadow-lg"
          style={{
            marginTop: 10,
            width: 52,
            height: 140,
            background: 'rgba(124, 124, 124, 0.92)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          }}
        >
          {/* Fill — rounded yo'q, overflow-hidden parent kesadi */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: `${volume}%`,
              background: 'white',
              transition: 'height 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'height',
            }}
          />

          {/* Foiz */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleInteraction();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMute();
              handleInteraction();
            }}
            className="absolute left-1/2 z-10 -translate-x-1/2 outline-none transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{ bottom: 12 }}
            aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          >
            <span
              className="tabular-nums font-semibold leading-none"
              style={{
                fontSize: 13,
                letterSpacing: '-0.02em',
                color: isFilled ? 'black' : 'rgb(189, 189, 189)',
                transition: 'color 0.2s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {volume}
              <span style={{ fontSize: 9, marginLeft: 1, fontWeight: 500 }}>%</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
