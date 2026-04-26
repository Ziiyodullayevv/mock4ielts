import { Suspense } from 'react';

import { MainFooter } from './footer';
import { MainHeader } from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="mx-auto w-full bg-background text-foreground transition-colors duration-300 dark:bg-black dark:text-white">
      <Suspense fallback={null}>
        <MainHeader />
      </Suspense>

      <main className="min-h-screen">{children}</main>

      <MainFooter />
    </div>
  );
}
