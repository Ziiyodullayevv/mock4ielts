'use client';

import type { RefObject } from 'react';

import { useRef, useState, useEffect } from 'react';

export type ListeningHeaderAudioControls = {
  audioRef: RefObject<HTMLAudioElement | null>;
  canControlPlayback: boolean;
  currentTime: number;
  duration: number;
  handleSeek: (nextTime: number) => void;
  handleTogglePlay: () => void;
  handleToggleMute: () => void;
  handleVolumeChange: (nextVolume: number) => void;
  isPlaying: boolean;
  volume: number;
};

type ListeningHeaderAudioOptions = {
  autoPlay?: boolean;
  lockPlayback?: boolean;
};

export function useListeningHeaderAudio(
  audioUrl?: string,
  { autoPlay = true, lockPlayback = true }: ListeningHeaderAudioOptions = {}
): ListeningHeaderAudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNonZeroVolumeRef = useRef(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const canControlPlayback = Boolean(audioUrl && !lockPlayback);

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

  const handleTogglePlay = () => {
    const audio = audioRef.current;

    if (!audio || !canControlPlayback) {
      return;
    }

    if (audio.paused) {
      void audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  };

  const handleSeek = (nextTime: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(nextTime)) {
      return;
    }

    audio.currentTime = Math.min(Math.max(nextTime, 0), duration || audio.duration || 0);
    setCurrentTime(audio.currentTime);
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
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return undefined;
    }

    const syncTime = () => setCurrentTime(audio.currentTime || 0);
    const syncDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const syncPlaying = () => setIsPlaying(!audio.paused && !audio.ended);
    const keepPlaying = () => {
      if (lockPlayback && !audio.ended) {
        void audio.play().catch(() => undefined);
      }
    };

    audio.currentTime = 0;
    setCurrentTime(0);
    syncDuration();

    if (autoPlay) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }

    audio.addEventListener('loadedmetadata', syncDuration);
    audio.addEventListener('durationchange', syncDuration);
    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('play', syncPlaying);
    audio.addEventListener('pause', syncPlaying);
    audio.addEventListener('ended', syncPlaying);

    if (lockPlayback) {
      audio.addEventListener('pause', keepPlaying);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', syncDuration);
      audio.removeEventListener('durationchange', syncDuration);
      audio.removeEventListener('timeupdate', syncTime);
      audio.removeEventListener('play', syncPlaying);
      audio.removeEventListener('pause', syncPlaying);
      audio.removeEventListener('ended', syncPlaying);
      audio.removeEventListener('pause', keepPlaying);
    };
  }, [audioUrl, autoPlay, lockPlayback]);

  return {
    audioRef,
    canControlPlayback,
    currentTime,
    duration,
    handleSeek,
    handleTogglePlay,
    handleToggleMute,
    handleVolumeChange,
    isPlaying,
    volume,
  };
}
