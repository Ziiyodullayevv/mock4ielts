'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { PracticeOverviewCard } from './practice-overview-card';
import { PracticeQuestionsList } from './practice-questions-list';
import { PracticeQuestionsToolbar } from './practice-questions-toolbar';

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

  const handleStatusFilterChange = (nextStatusFilter: PracticeStatusFilter) => {
    setStatusFilter(nextStatusFilter);
    triggerRowsAnimation();
  };

  const handleSearchTermChange = (nextSearchTerm: string) => {
    clearRowsAnimationTimer();
    setIsRowsAnimationActive(false);
    setSearchTerm(nextSearchTerm);
  };

  const filteredQuestions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return questions.filter((item) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        item.title.toLowerCase().includes(normalizedSearchTerm) ||
        String(item.id).includes(normalizedSearchTerm);

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'completed') return Boolean(item.isCompleted);
      return !item.isCompleted;
    });
  }, [questions, searchTerm, statusFilter]);

  return (
    <main className="min-h-screen pt-25 text-sm">
      <div className="mx-auto w-full max-w-300 px-5 xl:px-10">
        <div className="grid items-start gap-5 md:grid-cols-[21rem_minmax(0,1fr)] lg:grid-cols-[22.5rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
          <PracticeOverviewCard className="md:sticky md:top-28 md:self-start" overview={overview} />

          <section className="space-y-3">
            <PracticeQuestionsToolbar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              searchPlaceholder={searchPlaceholder}
              onSearchTermChange={handleSearchTermChange}
              onStatusFilterChange={handleStatusFilterChange}
            />

            {errorMessage ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-4 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {!errorMessage && isLoading && !filteredQuestions.length ? (
              <div className="rounded-2xl bg-white/6 px-4 py-4 text-sm text-white/64">
                {`Loading ${overview.title.toLowerCase()} sections...`}
              </div>
            ) : null}

            {!errorMessage && !isLoading && !filteredQuestions.length ? (
              <div className="rounded-2xl bg-white/6 px-4 py-4 text-sm text-white/64">
                {emptyMessage}
              </div>
            ) : null}

            <PracticeQuestionsList
              items={filteredQuestions}
              animateRows={isRowsAnimationActive}
              animationSeed={rowsAnimationSeed}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
