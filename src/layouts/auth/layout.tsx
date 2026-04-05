import type { ReactNode } from 'react';

import { AuthBackgroundMedia } from './auth-background-media';

const AUTH_BACKGROUND_POSTER = '/assets/auth/posters/auth-1.png';
const AUTH_BACKGROUND_VIDEO = '/assets/auth/videos/auth-1.mp4';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden sm:h-screen sm:w-screen sm:overflow-hidden">
      <AuthBackgroundMedia
        posterSrc={AUTH_BACKGROUND_POSTER}
        videoSrc={AUTH_BACKGROUND_VIDEO}
      />

      <div className="relative z-10 min-h-[100svh] w-full sm:h-full">{children}</div>
    </div>
  );
}
