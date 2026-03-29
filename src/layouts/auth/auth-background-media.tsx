'use client';

import Image from 'next/image';
import { useState } from 'react';

type AuthBackgroundMediaProps = {
  posterSrc: string;
  videoSrc: string;
};

export function AuthBackgroundMedia({
  posterSrc,
  videoSrc,
}: AuthBackgroundMediaProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <>
      <Image
        src={posterSrc}
        alt="Authentication background poster"
        fill
        priority
        sizes="100vw"
        className={`absolute inset-0 -z-20 object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-0' : 'opacity-100'}`}
      />

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setIsVideoReady(true)}
        onPlaying={() => setIsVideoReady(true)}
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </>
  );
}
