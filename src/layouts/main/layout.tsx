import { Suspense } from 'react';

import { MainFooter } from './footer';
import { MainHeader } from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-black text-white w-full mx-auto">
      <Suspense fallback={null}>
        <MainHeader />
      </Suspense>

      <main className="min-h-screen">{children}</main>

      <MainFooter />
    </div>
  );
}
