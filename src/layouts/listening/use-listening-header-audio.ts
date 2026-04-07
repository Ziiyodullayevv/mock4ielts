'use client';

import type { RefObject } from 'react';

import { useRef, useState, useEffect } from 'react';

export type ListeningHeaderAudioControls = {
  audioRef: RefObject<HTMLAudioElement | null>;
  handleToggleMute: () => void;
  handleVolumeChange: (nextVolume: number) => void;
  volume: number;
};

export function useListeningHeaderAudio(audioUrl?: string): ListeningHeaderAudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNonZeroVolumeRef = useRef(80);
  const [volume, setVolume] = useState(80);

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);

    if (nextVolume > 0) {
      lastNonZeroVolumeRef.current = nextVolume;
    }
  };

  const handleToggleMute = () => {
    if (volume === 0) {
      handleVolumeChange(lastNonZeroVolumeRef.current || 80);
      return;
    }

    handleVolumeChange(0);
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    audio.volume = volume / 100;
    return undefined;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      return undefined;
    }

    const keepPlaying = () => {
      if (!audio.ended) {
        void audio.play().catch(() => undefined);
      }
    };

    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
    audio.addEventListener('pause', keepPlaying);

    return () => {
      audio.removeEventListener('pause', keepPlaying);
    };
  }, [audioUrl]);

  return {
    audioRef,
    handleToggleMute,
    handleVolumeChange,
    volume,
  };
}
