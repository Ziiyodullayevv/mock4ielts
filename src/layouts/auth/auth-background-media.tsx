'use client';

import Image from 'next/image';

type AuthBackgroundMediaProps = {
  posterSrc: string;
};

export function AuthBackgroundMedia({ posterSrc }: AuthBackgroundMediaProps) {
  return (
    <Image
      src={posterSrc}
      alt="Authentication background"
      fill
      priority
      quality={100}
      sizes="100vw"
      className="absolute inset-0 -z-10 object-cover"
    />
  );
}
