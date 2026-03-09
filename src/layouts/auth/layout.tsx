import type { ReactNode } from 'react';

import Image from 'next/image';

const AUTH_BACKGROUND_POSTER = '/assets/auth/posters/auth-1.png';
const AUTH_BACKGROUND_VIDEO = '/assets/auth/videos/auth-1.mp4';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Image
        src={AUTH_BACKGROUND_POSTER}
        alt="Authentication background poster"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover"
      />

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={AUTH_BACKGROUND_POSTER}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src={AUTH_BACKGROUND_VIDEO} type="video/mp4" />
      </video>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
