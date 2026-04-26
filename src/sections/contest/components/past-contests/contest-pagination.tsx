'use client';

import { cn } from '@/src/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import {
  contestButtonClassName,
  contestPrimaryButtonClassName,
} from '../contest-theme';

type ContestPaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function ContestPagination({ page, totalPages, onChange }: ContestPaginationProps) {
  const visible = getVisiblePages(page, totalPages);

  return (
    <footer className="mt-auto flex items-center justify-center gap-1.5 pt-6">
      <nav aria-label="Pagination" className="flex flex-nowrap items-center gap-1.5">
        <PageButton
          aria-label="Previous"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </PageButton>

        {visible.map((entry, idx) =>
          entry === 'gap' ? (
            <PageButton key={`gap-${idx}`} aria-label="More pages" disabled>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </PageButton>
          ) : (
            <PageButton
              key={entry}
              active={entry === page}
              onClick={() => onChange(entry)}
            >
              {entry}
            </PageButton>
          )
        )}

        <PageButton
          aria-label="Next"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </PageButton>
      </nav>
    </footer>
  );
}

type PageButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function PageButton({ active, className, children, ...props }: PageButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-7 min-w-7 select-none items-center justify-center rounded-full px-2.5 py-[3px] text-xs font-semibold leading-none transition-colors',
        active
          ? cn(contestPrimaryButtonClassName, 'pointer-events-none px-2.5 py-[3px] text-xs')
          : cn(contestButtonClassName, 'px-2.5 py-[3px] text-xs'),
        'disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'relative z-10 inline-flex items-center justify-center',
          active ? 'text-white' : 'text-[#475569] dark:text-white/70'
        )}
      >
        {children}
      </span>
    </button>
  );
}

function getVisiblePages(page: number, total: number): Array<number | 'gap'> {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'gap'> = [1, 2, 3, 4, 'gap', total];
  return pages;
}
