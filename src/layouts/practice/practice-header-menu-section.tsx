'use client';

import type { ReactNode } from 'react';

import { cn } from '@/src/lib/utils';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

type PracticeHeaderMenuSectionProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title: string;
};

type PracticeHeaderMenuRowProps = {
  action: ReactNode;
  className?: string;
  label: string;
};

type PracticeHeaderMenuQuickActionsProps = {
  children: ReactNode;
  className?: string;
};

type PracticeHeaderMenuQuickActionShellProps = {
  children: ReactNode;
  className?: string;
};

export function PracticeHeaderMenuSection({
  children,
  className,
  contentClassName,
  title,
}: PracticeHeaderMenuSectionProps) {
  return (
    <section className={cn('space-y-1.5', className)}>
      <div className="px-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
        {title}
      </div>
      <div className={cn('rounded-2xl bg-stone-50 px-2.5 py-2.5 dark:bg-white/4', contentClassName)}>
        {children}
      </div>
    </section>
  );
}

export function PracticeHeaderMenuRow({
  action,
  className,
  label,
}: PracticeHeaderMenuRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl px-1 py-1 text-sm font-medium text-stone-900 dark:text-white',
        className
      )}
    >
      <span>{label}</span>
      {action}
    </div>
  );
}

export function PracticeHeaderMenuQuickActions({
  children,
  className,
}: PracticeHeaderMenuQuickActionsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PracticeHeaderMenuQuickActionShell({
  children,
  className,
}: PracticeHeaderMenuQuickActionShellProps) {
  return (
    <div
      className={cn(
        'flex aspect-square min-h-12 items-center justify-center rounded-2xl p-1 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] [&>button]:size-10 [&>button]:rounded-[14px] dark:shadow-none',
        PRACTICE_HEADER_RING_CLASS,
        className
      )}
    >
      {children}
    </div>
  );
}
