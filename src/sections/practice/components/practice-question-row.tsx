'use client';

import type { PracticeSectionType, PracticeQuestionItem } from '../types';

import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { toast } from '@/src/components/ui/sonner';
import { useRouter, usePathname } from '@/src/routes/hooks';
import { paths } from '@/src/routes/paths';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startMockExam } from '@/src/sections/mock-exams/api/mock-exams-api';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import { useFavoriteToggleMutation } from '@/src/sections/practice/hooks/use-favorite-toggle-mutation';
import { startListeningSectionAttempt } from '@/src/sections/practice/listening/api/listening-attempt-api';
import { getListeningSectionDetail } from '@/src/sections/practice/listening/api/get-listening-section-detail';
import { X, Mic, Zap, Star, Check, Timer, Files, Circle, PenTool, BookOpen, Headphones, type LucideIcon } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from '@/src/components/ui/sheet';

import { PracticeCountdownOverlay } from './practice-test-state';

type PracticeQuestionRowProps = {
  animationDelayMs?: number;
  enableEntranceAnimation?: boolean;
  index: number;
  item: PracticeQuestionItem;
};

const ATTEMPT_COUNT_FORMATTER = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const PRACTICE_SECTION_CONTENT = {
  listening: {
    aboutTitle: 'About IELTS Listening',
    description:
      'IELTS listening section details and structure.',
    emptyStartNotice: null,
    examCoverageItems: [
      'Part 1: A conversation between two people set in an everyday social context.',
      'Part 2: A monologue set in an everyday social context.',
      'Part 3: A conversation between 2 to 4 people in an educational or training context.',
      'Part 4: A monologue on an academic subject.',
    ],
    examCoverageTitle: 'The IELTS listening exam covers:',
    improvementCopy:
      'This mock follows the real IELTS Listening flow with natural speed audio, distractors, and detail-focused questions. It is designed to strengthen your concentration, answer selection speed, and spelling accuracy under time pressure.',
    improvementPoints: [
      {
        icon: Mic,
        text: 'Topic recognition in fast speech',
      },
      {
        icon: BookOpen,
        text: 'Gap-fill and form completion focus',
      },
    ],
    itemLabel: 'Question',
    sectionLabel: 'Listening',
    statsIcon: Headphones,
    tips: [
      'Use headphones for clearer details and speaker transitions.',
      'Keep 1-2 minutes for quick answer review at the end.',
    ],
  },
  reading: {
    aboutTitle: 'About IELTS Reading',
    description:
      'IELTS reading section details and structure.',
    emptyStartNotice: null,
    examCoverageItems: [
      'Three passages with increasing difficulty and academic-style topics.',
      'Question types such as matching headings, multiple choice, true/false/not given, and summary completion.',
      'A 60-minute time limit with no extra answer transfer time.',
    ],
    examCoverageTitle: 'The IELTS reading exam covers:',
    improvementCopy:
      'This mock follows the real IELTS Reading flow with passage-based tasks, scanning pressure, and evidence-driven questions. It is designed to strengthen your skimming speed, keyword tracking, and answer accuracy under timed conditions.',
    improvementPoints: [
      {
        icon: BookOpen,
        text: 'Skimming and scanning under time pressure',
      },
      {
        icon: Zap,
        text: 'Matching headings and evidence tracking',
      },
    ],
    itemLabel: 'Section',
    sectionLabel: 'Reading',
    statsIcon: BookOpen,
    tips: [
      'Aim to spend roughly 20 minutes per passage.',
      'Mark keywords first, then locate the supporting evidence in the passage.',
    ],
  },
  writing: {
    aboutTitle: 'About IELTS Writing',
    description:
      'IELTS writing section details and structure.',
    emptyStartNotice:
      'Writing practice list is live, but starting a writing set is not enabled yet.',
    examCoverageItems: [
      'Task 1 focuses on visual information, data description, or letter-style responses depending on the test format.',
      'Task 2 focuses on extended essay writing with clear argument, support, and structure.',
      'A 60-minute time limit where planning, coherence, and grammar control matter together.',
    ],
    examCoverageTitle: 'The IELTS writing exam covers:',
    improvementCopy:
      'This mock follows the real IELTS Writing flow with timed planning, structured response building, and band-focused marking criteria. It is designed to strengthen your coherence, idea development, and grammar accuracy under pressure.',
    improvementPoints: [
      {
        icon: PenTool,
        text: 'Task response and structured idea development',
      },
      {
        icon: BookOpen,
        text: 'Grammar range and coherence control',
      },
    ],
    itemLabel: 'Section',
    sectionLabel: 'Writing',
    statsIcon: PenTool,
    tips: [
      'Split your time intentionally between Task 1 and Task 2 before you begin.',
      'Plan key ideas first so your paragraphs stay focused and connected.',
    ],
  },
  speaking: {
    aboutTitle: 'About IELTS Speaking',
    description:
      'IELTS speaking section details and structure.',
    emptyStartNotice: null,
    examCoverageItems: [
      'Part 1 focuses on short personal questions with natural everyday answers.',
      'Part 2 focuses on an individual long turn built from a cue card prompt.',
      'Part 3 focuses on deeper discussion, explanation, and opinion development.',
    ],
    examCoverageTitle: 'The IELTS speaking exam covers:',
    improvementCopy:
      'This mock follows the real IELTS Speaking flow with cue-card pacing, follow-up discussion, and fluency-focused prompts. It is designed to strengthen your spontaneous speaking, idea expansion, and confidence under exam timing.',
    improvementPoints: [
      {
        icon: Mic,
        text: 'Fluency and spontaneous response building',
      },
      {
        icon: Zap,
        text: 'Extending answers with examples and reasons',
      },
    ],
    itemLabel: 'Section',
    sectionLabel: 'Speaking',
    statsIcon: Mic,
    tips: [
      'Answer naturally first, then extend with one reason or example.',
      'Keep your pace steady instead of trying to sound fast.',
    ],
  },
  'mock-exam': {
    aboutTitle: 'About Full IELTS Mock Exams',
    description:
      'Full IELTS mock exam details and structure.',
    emptyStartNotice: null,
    examCoverageItems: [
      'Listening, Reading, Writing, and Speaking are combined into one full IELTS-style exam flow.',
      'The format is designed to simulate full test pacing, stamina, and section transitions.',
      'It helps you measure readiness across all four skills instead of one skill in isolation.',
    ],
    examCoverageTitle: 'A full IELTS mock exam covers:',
    improvementCopy:
      'This mock follows the full IELTS experience with multi-skill pacing, longer focus time, and realistic exam structure. It is designed to strengthen your stamina, time control, and overall readiness across all four modules.',
    improvementPoints: [
      {
        icon: Headphones,
        text: 'Listening and reading under sustained focus',
      },
      {
        icon: PenTool,
        text: 'Writing and speaking readiness in one flow',
      },
    ],
    itemLabel: 'Mock Exam',
    sectionLabel: 'Mock exam',
    statsIcon: Files,
    tips: [
      'Set aside one uninterrupted session so the exam feels realistic.',
      'Use the result to spot which skill breaks down first under full-test pressure.',
    ],
  },
} as const satisfies Record<
  PracticeSectionType,
  {
    aboutTitle: string;
    description: string;
    emptyStartNotice: string | null;
    examCoverageItems: string[];
    examCoverageTitle: string;
    improvementCopy: string;
    improvementPoints: Array<{
      icon: LucideIcon;
      text: string;
    }>;
    itemLabel: string;
    sectionLabel: string;
    statsIcon: LucideIcon;
    tips: string[];
  }
>;

export function PracticeQuestionRow({
  animationDelayMs = 0,
  enableEntranceAnimation = false,
  index,
  item,
}: PracticeQuestionRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const favoriteToggleMutation = useFavoriteToggleMutation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isAttemptPrepared, setIsAttemptPrepared] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [targetHref, setTargetHref] = useState(item.href);
  const sectionType = item.sectionType ?? 'listening';
  const isStartAvailable =
    item.isStartAvailable ?? ['listening', 'reading', 'writing', 'speaking'].includes(sectionType);
  const content = PRACTICE_SECTION_CONTENT[sectionType];
  const hasGradientRow = index % 2 === 0;
  const attemptLabel =
    item.countLabel ??
    (item.questionCount
      ? `${item.questionCount} q`
      : ATTEMPT_COUNT_FORMATTER.format(item.attemptCount).toLowerCase());
  const requiredTokenCount = item.tokenCost ?? 0;
  const StatsIcon = content.statsIcon;
  const canFavorite = Boolean(item.remoteId);

  const startAttemptMutation = useMutation({
    mutationFn: startListeningSectionAttempt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const startMockExamMutation = useMutation({
    mutationFn: startMockExam,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  useEffect(() => {
    if (countdownValue === null) {
      return undefined;
    }

    if (countdownValue === 1) {
      if (!isAttemptPrepared) {
        return undefined;
      }

      const startTimer = window.setTimeout(() => {
        router.push(targetHref);
      }, 1000);

      return () => window.clearTimeout(startTimer);
    }

    const timer = window.setTimeout(() => {
      setCountdownValue((currentValue) => {
        if (typeof currentValue !== 'number') {
          return currentValue;
        }

        return Math.max(1, currentValue - 1);
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdownValue, isAttemptPrepared, router, targetHref]);

  const handleStartPractice = async () => {
    if (!isStartAvailable) {
      return;
    }

    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginHref(pathname || item.href));
      return;
    }

    if (sectionType === 'mock-exam') {
      if (!item.examId) {
        setStartError('Mock exam id is missing for this test.');
        return;
      }

      setStartError(null);

      try {
        const { attemptId } = await startMockExamMutation.mutateAsync(item.examId);
        const detailsHref = paths.mockExam.details(item.examId);
        const nextHref = `${detailsHref}?attemptId=${encodeURIComponent(attemptId)}`;

        setIsInfoOpen(false);
        router.prefetch(detailsHref);
        router.push(nextHref);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to start this mock exam right now.';

        setStartError(message);
        toast.error(message);
      }

      return;
    }

    if (sectionType !== 'listening') {
      setIsInfoOpen(false);
      router.prefetch(item.href);
      router.push(item.href);
      return;
    }

    const sectionId = item.href.split('/').filter(Boolean).at(-1);

    if (!sectionId) {
      setStartError(`Section id is missing for this ${content.sectionLabel.toLowerCase()} test.`);
      return;
    }

    setStartError(null);

    try {
      const { attemptId } = await startAttemptMutation.mutateAsync(sectionId);
      const nextHref = `${item.href}?attemptId=${encodeURIComponent(attemptId)}`;

      setTargetHref(nextHref);
      setIsAttemptPrepared(false);
      setIsInfoOpen(false);
      setCountdownValue(3);
      router.prefetch(nextHref);
      void queryClient
        .prefetchQuery({
          queryFn: () => getListeningSectionDetail(sectionId),
          queryKey: ['published-sections', 'listening', sectionId],
        })
        .finally(() => {
          setIsAttemptPrepared(true);
        });
    } catch (error) {
      setStartError(
        error instanceof Error
          ? error.message
          : `Unable to start this ${content.sectionLabel.toLowerCase()} test.`
      );
    }
  };

  const handleToggleFavorite = async () => {
    if (!item.remoteId) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginHref(pathname || item.href));
      return;
    }

    try {
      const result = await favoriteToggleMutation.mutateAsync(item.remoteId);

      toast.success(result.added ? 'Added to favorites.' : 'Removed from favorites.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update favorites right now.'
      );
    }
  };

  return (
    <>
      <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <motion.div
          initial={enableEntranceAnimation ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: animationDelayMs / 1000,
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className={cn(
              'group grid min-h-10 grid-cols-[minmax(0,1fr)_3.8rem_3.2rem_2rem] items-center gap-x-2 rounded-xl px-3 py-1.5 text-sm transition-colors sm:grid-cols-[minmax(0,1fr)_4.8rem_4.4rem_2.3rem] sm:gap-x-3 sm:px-3',
              hasGradientRow
                ? `${PRACTICE_HEADER_RING_CLASS} shadow-sm dark:shadow-none dark:after:!bg-[#1e1e1e]`
                : 'bg-transparent'
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-4 shrink-0 place-items-center">
                {item.isCompleted ? (
                  <Check className="size-4 text-[#18c458]" strokeWidth={2.3} />
                ) : (
                  <Circle className="size-4 text-black/42 dark:text-white/72" strokeWidth={1.9} />
                )}
              </span>

              <button
                type="button"
                disabled={sectionType === 'mock-exam' && startMockExamMutation.isPending}
                onClick={() => {
                  if (sectionType === 'mock-exam') {
                    void handleStartPractice();
                    return;
                  }

                  setIsInfoOpen(true);
                }}
                className="truncate text-left text-sm font-semibold tracking-[-0.02em] text-black/92 transition-[color,filter] group-hover:bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] group-hover:bg-clip-text group-hover:text-transparent group-hover:brightness-105 hover:bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] hover:bg-clip-text hover:text-transparent hover:brightness-105 focus-visible:bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] focus-visible:bg-clip-text focus-visible:text-transparent disabled:cursor-wait disabled:opacity-70 dark:text-white/92"
              >
                {item.id}. {item.title}
              </button>
            </div>

            <p className="justify-self-start text-sm font-medium tabular-nums text-black/66 dark:text-white/66">
              {attemptLabel}
            </p>

            <div className="justify-self-start">
              {item.tokenCost ? (
                <span className="inline-flex items-center gap-1 text-link-active">
                  <TokenIcon className="text-[14px]" />
                  <span className="text-sm font-semibold leading-none">{item.tokenCost}</span>
                </span>
              ) : (
                <span className="block h-4 w-8" aria-hidden="true" />
              )}
            </div>

            <div className="justify-self-end">
              {canFavorite ? (
                <button
                  type="button"
                  aria-label={item.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={item.isStarred}
                  disabled={favoriteToggleMutation.isPending}
                  onClick={handleToggleFavorite}
                  className="grid size-7 place-items-center rounded-lg transition-colors hover:bg-[#ededed] disabled:cursor-not-allowed disabled:opacity-65 dark:hover:bg-white/8 sm:size-8"
                >
                  <Star
                    className={cn(
                      'size-4 transition-all duration-200',
                      item.isStarred
                        ? 'fill-[#ffc31a] text-[#ffc31a]'
                        : 'text-black/54 hover:fill-[#ffc31a] hover:text-[#ffc31a] dark:text-white/78'
                    )}
                    strokeWidth={1.95}
                  />
                </button>
              ) : (
                <span className="block size-7 sm:size-8" aria-hidden="true" />
              )}
            </div>
          </div>
        </motion.div>

        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="bg-black/55 backdrop-blur-xl data-[state=open]:duration-200 data-[state=closed]:duration-150"
          className="h-[96vh] rounded-t-2xl border-0 bg-[#f7f7f7] p-0 text-black data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 dark:bg-[#141414] dark:text-white"
        >
          <SheetClose className="absolute -top-6 right-6 z-20 inline-flex items-center justify-center text-white/72 transition-all duration-200 ease-out data-[state=closed]:translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 hover:text-white focus:outline-none">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </SheetClose>

          <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-5 pb-8 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
            <SheetHeader className="sticky top-0 z-10 -mx-5 border-b border-black/8 bg-[#f7f7f7]/95 px-5 py-4 text-left backdrop-blur-md sm:-mx-8 sm:px-8 dark:border-white/8 dark:bg-[#141414]/95">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 pr-2">
                  <SheetTitle className="text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl dark:text-[#ff9f2f]">
                    {content.aboutTitle}
                  </SheetTitle>
                  <SheetDescription className="sr-only">{content.description}</SheetDescription>
                </div>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  disabled={
                    !isHydrated ||
                    startAttemptMutation.isPending ||
                    startMockExamMutation.isPending ||
                    !isStartAvailable
                  }
                  className={cn(
                    'inline-flex h-10 shrink-0 self-start items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors sm:self-auto',
                    isStartAvailable
                      ? 'bg-black text-white hover:bg-black/88 disabled:cursor-not-allowed disabled:bg-black/70 dark:bg-[#ff9f2f] dark:text-black dark:hover:bg-[#ffab44] dark:disabled:bg-[#ff9f2f]/70'
                      : 'cursor-not-allowed bg-black/10 text-black/38 dark:bg-white/10 dark:text-white/38'
                  )}
                >
                  {isStartAvailable
                    ? sectionType === 'mock-exam'
                      ? startMockExamMutation.isPending
                        ? 'Starting...'
                        : 'Start Practice'
                      : startAttemptMutation.isPending
                      ? 'Starting...'
                      : 'Start Practice'
                    : 'Coming soon'}
                </button>
              </div>
            </SheetHeader>

            <div className="space-y-7 py-6 text-sm">
              <p className="text-sm text-black/70 dark:text-white/70">
                {content.itemLabel} {item.id} - {item.title}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ededed] px-3 py-1.5 font-medium text-black/95 dark:bg-white/8 dark:text-white/95">
                  <StatsIcon className="size-4 text-black dark:text-[#ff9f2f]" />
                  {item.statLabel ?? `${item.questionCount ?? 40} Questions`}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ededed] px-3 py-1.5 font-medium text-black/95 dark:bg-white/8 dark:text-white/95">
                  <Timer className="size-4 text-black dark:text-[#ff9f2f]" />
                  {item.durationMinutes ?? 35} minutes
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ededed] px-3 py-1.5 font-medium text-black/78 dark:bg-white/8 dark:text-[#0f9cff]">
                  <TokenIcon className="text-[15px]" />
                  {requiredTokenCount > 0
                    ? `${requiredTokenCount} token required`
                    : 'No token required'}
                </span>
              </div>

              <div className="rounded-xl bg-[#ededed] p-4 sm:p-5 dark:bg-white/6">
                <p className="mb-3 text-base font-semibold text-black/95 dark:text-white/95">
                  What this set helps you improve
                </p>
                <p className="text-sm leading-7 text-black/78 dark:text-white/78">
                  {content.improvementCopy}
                </p>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {content.improvementPoints.map((point) => {
                    const ImprovementIcon = point.icon;

                    return (
                      <div key={point.text} className="inline-flex items-center gap-2 text-black/86 dark:text-white/86">
                        <ImprovementIcon className="size-4 text-black dark:text-[#ff9f2f]" />
                        {point.text}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-base font-semibold text-black/94 dark:text-white/94">
                  {content.examCoverageTitle}
                </p>

                <ul className="list-disc space-y-4 pl-5 text-sm leading-7 text-black/82 marker:text-black dark:text-white/82 dark:marker:text-[#ff9f2f]">
                  {content.examCoverageItems.map((examCoverageItem) => (
                    <li key={examCoverageItem}>{examCoverageItem}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#ededed] p-4 sm:p-5 dark:bg-white/6">
                <p className="inline-flex items-center gap-2 text-base font-semibold text-black/94 dark:text-white/94">
                  <Zap className="size-4 text-black dark:text-[#ff9f2f]" />
                  Before you start
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-black/78 dark:text-white/78">
                  {content.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                  <li>
                    {requiredTokenCount > 0
                      ? `This mock requires ${requiredTokenCount} tokens to start.`
                      : 'This mock can be started without token payment.'}
                  </li>
                </ul>
              </div>

              {content.emptyStartNotice ? (
                <div className="rounded-xl border border-black/10 bg-black/3 px-4 py-3 text-sm text-black/70 dark:border-white/10 dark:bg-white/4 dark:text-white/70">
                  {content.emptyStartNotice}
                </div>
              ) : null}

              {startError ? (
                <div className="rounded-xl border border-[#ff784b]/30 bg-[#ff784b]/10 px-4 py-3 text-sm text-[#ffc8bb]">
                  {startError}
                </div>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {countdownValue !== null ? <PracticeCountdownOverlay value={countdownValue} /> : null}
    </>
  );
}
