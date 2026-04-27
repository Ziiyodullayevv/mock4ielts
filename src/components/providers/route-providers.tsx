'use client';

import { Suspense } from 'react';
import { Toaster } from '@/src/components/ui/sonner';
import { TooltipProvider } from '@/src/components/ui/tooltip';
import { QueryProvider } from '@/src/components/providers/query-provider';
import { NavigationProgress } from '@/src/components/navigation/navigation-progress';

type RouteProvidersProps = {
  children: React.ReactNode;
};

export function RouteProviders({ children }: RouteProvidersProps) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryProvider>
  );
}
