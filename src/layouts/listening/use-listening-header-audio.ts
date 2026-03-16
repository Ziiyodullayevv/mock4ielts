'use client';

import { useRef, useState, useEffect } from 'react';

export function useListeningHeaderAudio(audioUrl?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const volumeSurfaceRef = useRef<HTMLDivElement | null>(null);
  const lastNonZeroVolumeRef = useRef(80);
  const [volume, setVolume] = useState(80);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

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
    if (!isVolumeOpen) {
      return undefined;
    }

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) {
        setIsVolumeOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
    };
  }, [isVolumeOpen]);

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

  const updateVolumeFromClientY = (clientY: number) => {
    const surfaceElement = volumeSurfaceRef.current;

    if (!surfaceElement) {
      return;
    }

    const rect = surfaceElement.getBoundingClientRect();
    const pointerOffset = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const nextVolume = Math.round((1 - pointerOffset / rect.height) * 100);

    handleVolumeChange(nextVolume);
  };

  const handleVolumeTrackPointerDown = (clientY: number) => {
    updateVolumeFromClientY(clientY);

    const handlePointerMove = (event: PointerEvent) => {
      updateVolumeFromClientY(event.clientY);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return {
    audioRef,
    controlRef,
    handleToggleMute,
    handleVolumeChange,
    handleVolumeTrackPointerDown,
    isVolumeOpen,
    setIsVolumeOpen,
    volume,
    volumeSurfaceRef,
  };
}
