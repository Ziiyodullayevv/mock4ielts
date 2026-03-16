'use client';

import type {
  PracticeSortKey,
  PracticeStatusFilter,
  PracticeSortDirection,
} from './practice-workspace';

import { cn } from '@/src/lib/utils';
import {
  Check,
  Funnel,
  Search,
  Shuffle,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';

type PracticeQuestionsToolbarProps = {
  onSortDirectionChange: (sortDirection: PracticeSortDirection) => void;
  onSortKeyChange: (sortKey: PracticeSortKey) => void;
  onStatusFilterChange: (statusFilter: PracticeStatusFilter) => void;
  onSearchTermChange: (searchTerm: string) => void;
  searchTerm: string;
  searchPlaceholder?: string;
  sortDirection: PracticeSortDirection;
  sortKey: PracticeSortKey;
  statusFilter: PracticeStatusFilter;
};

export function PracticeQuestionsToolbar({
  onSortDirectionChange,
  onSortKeyChange,
  onStatusFilterChange,
  onSearchTermChange,
  searchTerm,
  searchPlaceholder = 'Search questions',
  sortDirection,
  sortKey,
  statusFilter,
}: PracticeQuestionsToolbarProps) {
  const sortLabelByKey: Record<PracticeSortKey, string> = {
    attempts: 'Attempts',
    custom: 'Custom',
    'question-id': 'Question ID',
    standard: 'Standard',
  };
  const activeFilterCount = statusFilter === 'all' ? 0 : 1;

  const SortDirectionIcon = sortDirection === 'asc' ? ArrowUpNarrowWide : ArrowDownNarrowWide;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="relative w-full max-w-[320px] sm:w-[320px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/36" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-full bg-white/8 pl-10 pr-4 text-sm font-medium tracking-[-0.02em] text-white outline-none placeholder:text-white/48"
        />
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full bg-white/8 px-4 text-sm font-medium transition-colors',
              sortKey === 'custom' ? 'text-white/78 hover:text-white' : 'text-link-active'
            )}
            aria-label="Sort questions"
          >
            <SortDirectionIcon className="size-4" strokeWidth={2} />
            <span>{sortLabelByKey[sortKey]}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[250px] rounded-xl border border-white/8 bg-[#141414] p-2 text-sm text-white shadow-[0_20px_40px_rgba(0,0,0,0.42)]"
        >
          <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-white/85">
            Sort by
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onSortKeyChange('custom')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortKey === 'custom' && 'bg-white/8 text-white'
            )}
          >
            Custom
            {sortKey === 'custom' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onSortKeyChange('standard')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortKey === 'standard' && 'bg-white/8 text-white'
            )}
          >
            Standard
            {sortKey === 'standard' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onSortKeyChange('question-id')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortKey === 'question-id' && 'bg-white/8 text-white'
            )}
          >
            Question ID
            {sortKey === 'question-id' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onSortKeyChange('attempts')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortKey === 'attempts' && 'bg-white/8 text-white'
            )}
          >
            Attempts
            {sortKey === 'attempts' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-white/85">
            Order
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onSortDirectionChange('asc')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortDirection === 'asc' && 'bg-white/8 text-white'
            )}
          >
            <ArrowUpNarrowWide className="size-4 text-white/72" />
            Least first
            {sortDirection === 'asc' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onSortDirectionChange('desc')}
            className={cn(
              'h-10 rounded-lg px-3 text-sm text-white/88 focus:bg-white/8 focus:text-white',
              sortDirection === 'desc' && 'bg-white/8 text-white'
            )}
          >
            <ArrowDownNarrowWide className="size-4 text-white/72" />
            Most first
            {sortDirection === 'desc' ? <Check className="ml-auto size-4 text-white" /> : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full bg-white/8 px-4 text-sm font-medium transition-colors',
              activeFilterCount ? 'text-link-active' : 'text-white/70 hover:text-white'
            )}
            aria-label="Filter questions"
          >
            <Funnel className="size-4" strokeWidth={2} />
            {activeFilterCount ? <span className="leading-none">{activeFilterCount}</span> : null}
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
        className="ml-auto grid size-10 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/8"
        aria-label="Shuffle list"
      >
        <Shuffle className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
