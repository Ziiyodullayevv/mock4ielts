'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { PracticeOverviewCard } from './practice-overview-card';
import { PracticeQuestionsList } from './practice-questions-list';
import { PracticeQuestionsToolbar } from './practice-questions-toolbar';

export type PracticeSortKey = 'attempts' | 'custom' | 'question-id' | 'standard';
export type PracticeSortDirection = 'asc' | 'desc';
export type PracticeStatusFilter = 'all' | 'completed' | 'uncompleted';

type PracticeWindow = Window & {
  __practiceRowsInitialAnimationPlayed?: boolean;
};

type PracticeWorkspaceProps = {
  emptyMessage?: string;
  errorMessage?: string | null;
  isLoading?: boolean;
  overview: PracticeOverview;
  questions: PracticeQuestionItem[];
  searchPlaceholder?: string;
};

export function PracticeWorkspace({
  emptyMessage = 'No practice items found.',
  errorMessage,
  isLoading = false,
  overview,
  questions,
  searchPlaceholder,
}: PracticeWorkspaceProps) {
  const [rowsAnimationSeed, setRowsAnimationSeed] = useState(0);
  const [isRowsAnimationActive, setIsRowsAnimationActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<PracticeSortKey>('custom');
  const [sortDirection, setSortDirection] = useState<PracticeSortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<PracticeStatusFilter>('all');
  const rowsAnimationTimerRef = useRef<number | null>(null);

  const clearRowsAnimationTimer = useCallback(() => {
    if (rowsAnimationTimerRef.current) {
      window.clearTimeout(rowsAnimationTimerRef.current);
      rowsAnimationTimerRef.current = null;
    }
  }, []);

  const scheduleRowsAnimationStop = useCallback(() => {
    clearRowsAnimationTimer();
    rowsAnimationTimerRef.current = window.setTimeout(() => {
      setIsRowsAnimationActive(false);
      rowsAnimationTimerRef.current = null;
    }, 560);
  }, [clearRowsAnimationTimer]);

  const triggerRowsAnimation = useCallback(() => {
    setIsRowsAnimationActive(true);
    setRowsAnimationSeed((currentSeed) => currentSeed + 1);
    scheduleRowsAnimationStop();
  }, [scheduleRowsAnimationStop]);

  useEffect(() => () => clearRowsAnimationTimer(), [clearRowsAnimationTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const practiceWindow = window as PracticeWindow;
    if (practiceWindow.__practiceRowsInitialAnimationPlayed) return;

    const animationFrameId = window.requestAnimationFrame(() => {
      triggerRowsAnimation();
      practiceWindow.__practiceRowsInitialAnimationPlayed = true;
    });

    // eslint-disable-next-line consistent-return
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [triggerRowsAnimation]);

  const handleSortKeyChange = (nextSortKey: PracticeSortKey) => {
    setSortKey(nextSortKey);

    if (nextSortKey === 'attempts') {
      setSortDirection('desc');
    } else if (nextSortKey === 'question-id') {
      setSortDirection('asc');
    }

    triggerRowsAnimation();
  };

  const handleSortDirectionChange = (nextSortDirection: PracticeSortDirection) => {
    setSortDirection(nextSortDirection);
    triggerRowsAnimation();
  };

  const handleStatusFilterChange = (nextStatusFilter: PracticeStatusFilter) => {
    setStatusFilter(nextStatusFilter);
    triggerRowsAnimation();
  };

  const handleSearchTermChange = (nextSearchTerm: string) => {
    clearRowsAnimationTimer();
    setIsRowsAnimationActive(false);
    setSearchTerm(nextSearchTerm);
  };

  const sortedQuestions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const withIndex = questions
      .map((item, index) => ({ index, item }))
      .filter(({ item }) => {
        const matchesSearch =
          !normalizedSearchTerm ||
          item.title.toLowerCase().includes(normalizedSearchTerm) ||
          String(item.id).includes(normalizedSearchTerm);

        if (!matchesSearch) return false;
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return Boolean(item.isCompleted);
        return !item.isCompleted;
      });

    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    const sorted = [...withIndex].sort((left, right) => {
      if (sortKey === 'custom') {
        return (left.index - right.index) * directionFactor;
      }

      if (sortKey === 'question-id') {
        return (left.item.id - right.item.id) * directionFactor;
      }

      if (sortKey === 'attempts') {
        return (left.item.attemptCount - right.item.attemptCount) * directionFactor;
      }

      const leftCompleted = left.item.isCompleted ? 1 : 0;
      const rightCompleted = right.item.isCompleted ? 1 : 0;

      if (leftCompleted !== rightCompleted) {
        return (rightCompleted - leftCompleted) * directionFactor;
      }

      return (left.item.id - right.item.id) * directionFactor;
    });

    return sorted.map(({ item }) => item);
  }, [questions, searchTerm, sortDirection, sortKey, statusFilter]);

  return (
    <main className="min-h-screen pt-25 text-sm">
      <div className="mx-auto w-full max-w-[1200px] px-5 xl:px-10">
        <div className="grid items-start gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <PracticeOverviewCard className="xl:sticky xl:top-28 xl:self-start" overview={overview} />

          <section className="space-y-3">
            <PracticeQuestionsToolbar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              searchPlaceholder={searchPlaceholder}
              sortDirection={sortDirection}
              sortKey={sortKey}
              onSearchTermChange={handleSearchTermChange}
              onSortDirectionChange={handleSortDirectionChange}
              onSortKeyChange={handleSortKeyChange}
              onStatusFilterChange={handleStatusFilterChange}
            />

            {errorMessage ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-4 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {!errorMessage && isLoading && !sortedQuestions.length ? (
              <div className="rounded-2xl bg-white/6 px-4 py-4 text-sm text-white/64">
                Loading listening sections...
              </div>
            ) : null}

            {!errorMessage && !isLoading && !sortedQuestions.length ? (
              <div className="rounded-2xl bg-white/6 px-4 py-4 text-sm text-white/64">
                {emptyMessage}
              </div>
            ) : null}

            <PracticeQuestionsList
              items={sortedQuestions}
              animateRows={isRowsAnimationActive}
              animationSeed={rowsAnimationSeed}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
