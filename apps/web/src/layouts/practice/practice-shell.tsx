'use client';

import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

type PracticeShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  mainClassName?: string;
  rootClassName?: string;
};

export function PracticeShell({
  children,
  footer,
  header,
  mainClassName,
  rootClassName,
}: PracticeShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground transition-colors duration-300',
        rootClassName
      )}
    >
      {header}
      <main className={cn('mx-auto px-4 py-6 pb-32 md:pb-28', mainClassName)}>{children}</main>
      {footer}
    </div>
  );
}
