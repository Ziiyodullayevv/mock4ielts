'use client';

import type { PracticeStatusFilter } from './practice-workspace';

import { cn } from '@/src/lib/utils';
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
      <label className="relative min-w-0 flex-1 max-w-[15.75rem] md:w-[280px] md:max-w-[280px] md:flex-none lg:w-[320px] lg:max-w-[320px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10.5 w-full rounded-full bg-white/8 pl-10 pr-4 text-[13.5px] font-medium tracking-[-0.02em] text-white outline-none placeholder:text-white/48 md:h-10 md:text-sm"
        />
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative inline-flex size-10.5 items-center justify-center rounded-full bg-white/8 transition-colors md:size-10',
              activeFilterCount ? 'text-link-active' : 'text-white/70 hover:text-white'
            )}
            aria-label="Filter questions"
          >
            <Funnel className="size-4" strokeWidth={2} />
            {activeFilterCount ? (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-link-active" />
            ) : null}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[220px] rounded-xl border border-white/8 bg-[#141414] p-2 text-sm text-white shadow-[0_20px_40px_rgba(0,0,0,0.42)]"
        >
          <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-white/85">
            Status
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('all')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              statusFilter === 'all' && 'bg-white/8 text-white'
            )}
          >
            All
            {statusFilter === 'all' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('completed')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              statusFilter === 'completed' && 'bg-white/8 text-white'
            )}
          >
            Completed
            {statusFilter === 'completed' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onStatusFilterChange('uncompleted')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              statusFilter === 'uncompleted' && 'bg-white/8 text-white'
            )}
          >
            Uncompleted
            {statusFilter === 'uncompleted' ? (
              <Check className="ml-auto size-4 text-white" />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        className="ml-auto grid size-10.5 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/8 hover:text-white md:size-10"
        aria-label="Shuffle list"
      >
        <Shuffle className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
