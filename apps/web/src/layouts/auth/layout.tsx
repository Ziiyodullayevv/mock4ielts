import type { ReactNode } from 'react';

import { AuthBackgroundMedia } from './auth-background-media';

const AUTH_BACKGROUND_POSTER = '/assets/auth/posters/banner-1.webp';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden sm:h-screen sm:w-screen sm:overflow-hidden">
      <AuthBackgroundMedia posterSrc={AUTH_BACKGROUND_POSTER} />

      <div className="relative z-10 min-h-[100svh] w-full sm:h-full">{children}</div>
    </div>
  );
}
