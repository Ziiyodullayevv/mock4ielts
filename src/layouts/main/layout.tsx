'use client';

import { MainFooter } from './footer';
import { MainHeader } from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-black text-white w-full mx-auto">
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}
