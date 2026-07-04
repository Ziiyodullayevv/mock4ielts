'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { PracticeOverviewCard } from './practice-overview-card';
import { PracticeQuestionsList } from './practice-questions-list';
import { PracticeQuestionsToolbar } from './practice-questions-toolbar';
import { PracticeQuestionsListLoading } from './practice-questions-list-loading';

export type PracticeStatusFilter = 'all' | 'completed' | 'uncompleted';
export type PracticeSortOrder = 'title-asc' | 'title-desc' | 'original';
type PracticeOpenBehavior = 'info' | 'start';

type PracticeWindow = Window & {
  __practiceRowsInitialAnimationPlayed?: boolean;
};

const practiceTitleCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

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
  const [openItemHref, setOpenItemHref] = useState<string | null>(null);
  const [openRequestId, setOpenRequestId] = useState(0);
  const [openBehavior, setOpenBehavior] = useState<PracticeOpenBehavior>('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<PracticeSortOrder>('title-asc');
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

  const handleSortOrderChange = (nextSortOrder: PracticeSortOrder) => {
    setSortOrder(nextSortOrder);
    triggerRowsAnimation();
  };

  const handleSearchTermChange = (nextSearchTerm: string) => {
    clearRowsAnimationTimer();
    setIsRowsAnimationActive(false);
    setSearchTerm(nextSearchTerm);
  };

  const filteredQuestions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const withOriginalIndex = questions.map((item, originalIndex) => ({ item, originalIndex }));

    return withOriginalIndex
      .filter(({ item }) => {
        const matchesSearch =
          !normalizedSearchTerm ||
          item.title.toLowerCase().includes(normalizedSearchTerm) ||
          String(item.id).includes(normalizedSearchTerm);

        if (!matchesSearch) return false;
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return Boolean(item.isCompleted);
        return !item.isCompleted;
      })
      .sort((left, right) => {
        if (sortOrder === 'original') {
          return left.originalIndex - right.originalIndex;
        }

        const titleComparison = practiceTitleCollator.compare(left.item.title, right.item.title);
        const stableComparison = titleComparison || left.originalIndex - right.originalIndex;

        return sortOrder === 'title-asc' ? stableComparison : -stableComparison;
      })
      .map(({ item }) => item);
  }, [questions, searchTerm, sortOrder, statusFilter]);

  const currentQuestion = useMemo(() => {
    const nextUncompletedQuestion = questions.find((item) => !item.isCompleted);
    return nextUncompletedQuestion ?? questions[0] ?? null;
  }, [questions]);

  const currentQuestionLabel = currentQuestion ? currentQuestion.title : null;

  const handleOpenCurrentQuestion = () => {
    if (!currentQuestion) {
      return;
    }

    setSearchTerm('');
    setSortOrder('title-asc');
    setStatusFilter('all');
    setOpenBehavior('info');
    setOpenItemHref(currentQuestion.href);
    setOpenRequestId((currentRequestId) => currentRequestId + 1);
  };

  const handleStartRandomQuestion = () => {
    if (!filteredQuestions.length) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const randomQuestion = filteredQuestions[randomIndex];

    if (!randomQuestion) {
      return;
    }

    setOpenBehavior('start');
    setOpenItemHref(randomQuestion.href);
    setOpenRequestId((currentRequestId) => currentRequestId + 1);
  };

  const isInitialLoading = !errorMessage && isLoading && !questions.length;

  return (
    <main className="min-h-screen bg-background pt-25 text-sm text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-300 px-5 xl:px-10">
        <div className="grid items-start gap-5 md:grid-cols-[21rem_minmax(0,1fr)] lg:grid-cols-[22.5rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
          <PracticeOverviewCard
            className="w-full md:justify-self-start md:sticky md:top-28 md:self-start"
            currentQuestion={currentQuestion}
            currentQuestionLabel={currentQuestionLabel}
            onPracticeClick={handleOpenCurrentQuestion}
            overview={overview}
          />

          <section className="space-y-3">
            <PracticeQuestionsToolbar
              canStartRandom={filteredQuestions.length > 0}
              onRandomStart={handleStartRandomQuestion}
              searchTerm={searchTerm}
              sortOrder={sortOrder}
              statusFilter={statusFilter}
              searchPlaceholder={searchPlaceholder}
              onSearchTermChange={handleSearchTermChange}
              onSortOrderChange={handleSortOrderChange}
              onStatusFilterChange={handleStatusFilterChange}
            />

            {errorMessage ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/8 dark:text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {!errorMessage && isInitialLoading ? <PracticeQuestionsListLoading /> : null}

            {!errorMessage && !isLoading && !filteredQuestions.length ? (
              <div className="rounded-2xl border border-transparent bg-[#f7f7f7] px-4 py-4 text-sm text-black/64 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-transparent dark:bg-white/6 dark:text-white/64 dark:shadow-none">
                {emptyMessage}
              </div>
            ) : null}

            {!isInitialLoading ? (
              <PracticeQuestionsList
                items={filteredQuestions}
                animateRows={isRowsAnimationActive}
                animationSeed={rowsAnimationSeed}
                openItemHref={openItemHref}
                openBehavior={openBehavior}
                openRequestId={openRequestId}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
