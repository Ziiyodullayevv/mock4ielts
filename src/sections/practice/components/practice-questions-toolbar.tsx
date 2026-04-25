'use client';

import type { PracticeStatusFilter } from './practice-workspace';

import { cn } from '@/src/lib/utils';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import { Check, Funnel, Search, Shuffle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

type PracticeQuestionsToolbarProps = {
  onStatusFilterChange: (statusFilter: PracticeStatusFilter) => void;
  onSearchTermChange: (searchTerm: string) => void;
  searchTerm: string;
  searchPlaceholder?: string;
  statusFilter: PracticeStatusFilter;
};

export function PracticeQuestionsToolbar({
  onStatusFilterChange,
  onSearchTermChange,
  searchTerm,
  searchPlaceholder = 'Search questions',
  statusFilter,
}: PracticeQuestionsToolbarProps) {
  const activeFilterCount = statusFilter === 'all' ? 0 : 1;

  return (
    <div className="flex items-center gap-2.5 text-sm md:gap-3">
      <div
        className={cn(
          'min-w-0 flex-1 max-w-[15.75rem] rounded-full shadow-sm md:w-[280px] md:max-w-[280px] md:flex-none lg:w-[320px] lg:max-w-[320px] dark:shadow-none dark:after:!bg-[#1e1e1e]',
          PRACTICE_HEADER_RING_CLASS
        )}
      >
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/40 dark:text-white/42" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10.5 w-full rounded-full border border-transparent bg-transparent pl-10 pr-4 text-[13.5px] font-medium tracking-[-0.02em] text-black outline-none placeholder:text-black/42 md:h-10 md:text-sm dark:text-white dark:placeholder:text-white/48"
          />
        </label>
      </div>

      <DropdownMenu>
        <div
          className={cn(
            'rounded-full shadow-sm dark:shadow-none dark:after:!bg-[#1e1e1e]',
            PRACTICE_HEADER_RING_CLASS
          )}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'relative inline-flex size-10.5 items-center justify-center rounded-full bg-transparent text-black/70 transition-colors hover:bg-stone-100 md:size-10 dark:text-white/70 dark:hover:bg-white/8',
                activeFilterCount ? 'text-link-active' : 'hover:text-black dark:hover:text-white'
              )}
              aria-label="Filter questions"
            >
              <Funnel className="size-4" strokeWidth={2} />
              {activeFilterCount ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-link-active" />
              ) : null}
            </button>
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[220px] rounded-xl border border-transparent bg-[#f7f7f7] p-2 text-sm text-black shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-white/8 dark:bg-[#141414] dark:text-white dark:shadow-[0_20px_40px_rgba(0,0,0,0.42)]"
        >
          <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-black/85 dark:text-white/85">
            Status
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('all')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-black/88 focus:bg-[#ededed] focus:text-black dark:text-white/88 dark:focus:bg-white/8 dark:focus:text-white',
              statusFilter === 'all' && 'bg-[#ededed] text-black dark:bg-white/8 dark:text-white'
            )}
          >
            All
            {statusFilter === 'all' ? <Check className="ml-auto size-4 text-black dark:text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('completed')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-black/88 focus:bg-[#ededed] focus:text-black dark:text-white/88 dark:focus:bg-white/8 dark:focus:text-white',
              statusFilter === 'completed' && 'bg-[#ededed] text-black dark:bg-white/8 dark:text-white'
            )}
          >
            Completed
            {statusFilter === 'completed' ? <Check className="ml-auto size-4 text-black dark:text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('uncompleted')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-black/88 focus:bg-[#ededed] focus:text-black dark:text-white/88 dark:focus:bg-white/8 dark:focus:text-white',
              statusFilter === 'uncompleted' && 'bg-[#ededed] text-black dark:bg-white/8 dark:text-white'
            )}
          >
            Uncompleted
            {statusFilter === 'uncompleted' ? (
              <Check className="ml-auto size-4 text-black dark:text-white" />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        className={cn(
          'ml-auto rounded-full before:opacity-0 before:transition-opacity after:opacity-0 after:transition-opacity hover:before:opacity-100 hover:after:opacity-100',
          PRACTICE_HEADER_RING_CLASS
        )}
      >
        <button
          type="button"
          className="grid size-10.5 place-items-center rounded-full bg-transparent text-black/52 transition-colors hover:bg-[#ededed] hover:text-black md:size-10 dark:text-white/52 dark:hover:bg-white/8 dark:hover:text-white"
          aria-label="Shuffle list"
        >
          <Shuffle className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
