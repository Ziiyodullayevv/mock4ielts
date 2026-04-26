'use client';

import type { ReadingTest } from '@/src/sections/practice/reading/types';
import type { SpeakingTest } from '@/src/sections/practice/speaking/types';
import type { WritingTest, WritingAnswers, WritingTestResult } from '@/src/sections/practice/writing/types';
import type { TestResult, ListeningTest, Answers as ListeningAnswers } from '@/src/sections/practice/listening/types';

import { cn } from '@/src/lib/utils';
import { paths } from '@/src/routes/paths';
import { useQuery } from '@tanstack/react-query';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, usePathname } from '@/src/routes/hooks';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { computeResult as computeReadingResult } from '@/src/sections/practice/reading/utils';
import { ReadingTestView } from '@/src/sections/practice/reading/components/reading-test-view';
import { WritingTestView } from '@/src/sections/practice/writing/components/writing-test-view';
import { computeResult as computeListeningResult } from '@/src/sections/practice/listening/utils';
import { SpeakingTestView } from '@/src/sections/practice/speaking/components/speaking-test-view';
import { useMockExamDetailQuery } from '@/src/sections/mock-exams/hooks/use-mock-exam-detail-query';
import { ListeningTestView } from '@/src/sections/practice/listening/components/listening-test-view';
import {
  PracticePageState,
  PracticeSubmittingOverlay,
} from '@/src/sections/practice/components';
import { getReadingSectionDetail } from '@/src/sections/practice/reading/api/get-reading-section-detail';
import { getWritingSectionDetail } from '@/src/sections/practice/writing/api/get-writing-section-detail';
import { getSpeakingSectionDetail } from '@/src/sections/practice/speaking/api/get-speaking-section-detail';
import {
  buildListeningSubmitPayload,
} from '@/src/sections/practice/listening/api/listening-attempt-api';
import { getListeningSectionDetail } from '@/src/sections/practice/listening/api/get-listening-section-detail';
import {
  X,
  Mic,
  Zap,
  Timer,
  PenTool,
  BookOpen,
  ArrowLeft,
  Headphones,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from '@/src/components/ui/sheet';
import {
  contestButtonClassName,
  contestInsetCardClassName,
  contestPrimaryButtonClassName,
} from '@/src/sections/contest/components/contest-theme';
import {
  finishMockExam,
  getMockExamResult,
  type MockExamResult,
  type MockExamSection,
  submitMockExamSection,
} from '@/src/sections/mock-exams/api/mock-exams-api';

type MockExamRunnerPageProps = {
  attemptId: string | null;
  examId: string;
  examTitle?: string;
};

type RunnerView = 'overview' | 'section';

const SECTION_LABELS: Record<MockExamSection['type'], string> = {
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
  writing: 'Writing',
};

const mockFinishedButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-[#4ade80] bg-[linear-gradient(135deg,#4ade80_0%,#22c55e_55%,#16a34a_100%)] text-white shadow-[0_12px_28px_rgba(34,197,94,0.24)] transition-[filter,box-shadow] duration-200 hover:brightness-105 dark:shadow-[0_12px_28px_rgba(34,197,94,0.18)]";

const MOCK_SECTION_INFO = {
  listening: {
    aboutTitle: 'About IELTS Listening',
    coverageItems: [
      'Four audio parts with everyday and academic contexts.',
      'Question types include form completion, matching, multiple choice, and short answers.',
      'You need focused listening because the audio is played once.',
    ],
    coverageTitle: 'This mock listening section covers:',
    description: 'Preview the listening section before you start this part of the mock exam.',
    durationLabel: '30 minutes',
    improvementCopy:
      'This section trains attention to speaker changes, detail extraction, spelling accuracy, and answer selection under real exam pressure.',
    improvementPoints: [
      { icon: Headphones, text: 'Audio detail recognition' },
      { icon: Zap, text: 'Fast distractor filtering' },
    ],
    statsIcon: Headphones,
    statsLabel: '40 questions',
    tips: [
      'Use headphones before starting.',
      'Keep moving with the audio; do not spend too long on one missed answer.',
    ],
  },
  reading: {
    aboutTitle: 'About IELTS Reading',
    coverageItems: [
      'Three passages with increasing difficulty.',
      'Question types include matching, true/false/not given, completion, and multiple choice.',
      'There is no extra answer transfer time, so pacing matters.',
    ],
    coverageTitle: 'This mock reading section covers:',
    description: 'Preview the reading section before you start this part of the mock exam.',
    durationLabel: '60 minutes',
    improvementCopy:
      'This section trains skimming, scanning, keyword tracking, and evidence-based answer selection under timed conditions.',
    improvementPoints: [
      { icon: BookOpen, text: 'Passage scanning' },
      { icon: Zap, text: 'Evidence matching' },
    ],
    statsIcon: BookOpen,
    statsLabel: '40 questions',
    tips: [
      'Aim for roughly 20 minutes per passage.',
      'Find the supporting line before choosing an answer.',
    ],
  },
  writing: {
    aboutTitle: 'About IELTS Writing',
    coverageItems: [
      'Task 1 focuses on visual data, process, map, or letter-style writing depending on the test.',
      'Task 2 focuses on an essay with argument, examples, and structure.',
      'Planning, coherence, grammar, and vocabulary all affect the result.',
    ],
    coverageTitle: 'This mock writing section covers:',
    description: 'Preview the writing section before you start this part of the mock exam.',
    durationLabel: '60 minutes',
    improvementCopy:
      'This section trains timed planning, structured paragraph writing, task response, and language control.',
    improvementPoints: [
      { icon: PenTool, text: 'Task response planning' },
      { icon: BookOpen, text: 'Coherence and grammar control' },
    ],
    statsIcon: PenTool,
    statsLabel: '2 tasks',
    tips: [
      'Split your time before you begin.',
      'Plan the main idea of each paragraph first.',
    ],
  },
  speaking: {
    aboutTitle: 'About IELTS Speaking',
    coverageItems: [
      'Part 1 focuses on short personal questions.',
      'Part 2 uses a cue card for an individual long turn.',
      'Part 3 asks deeper follow-up questions and opinions.',
    ],
    coverageTitle: 'This mock speaking section covers:',
    description: 'Preview the speaking section before you start this part of the mock exam.',
    durationLabel: '11-14 minutes',
    improvementCopy:
      'This section trains spontaneous answers, fluency, idea expansion, and confidence across the IELTS speaking format.',
    improvementPoints: [
      { icon: Mic, text: 'Fluency and response flow' },
      { icon: Zap, text: 'Idea expansion under pressure' },
    ],
    statsIcon: Mic,
    statsLabel: '3 parts',
    tips: [
      'Answer naturally, then add one reason or example.',
      'Speaking unlocks after listening, reading, and writing are finished.',
    ],
  },
} as const satisfies Record<
  MockExamSection['type'],
  {
    aboutTitle: string;
    coverageItems: string[];
    coverageTitle: string;
    description: string;
    durationLabel: string;
    improvementCopy: string;
    improvementPoints: Array<{
      icon: LucideIcon;
      text: string;
    }>;
    statsIcon: LucideIcon;
    statsLabel: string;
    tips: string[];
  }
>;

function formatTimeSpent(value?: number | null) {
  if (!value || value <= 0) {
    return 'Not available';
  }

  const totalMinutes = Math.round(value / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function buildWritingMockResult(answers: WritingAnswers): WritingTestResult {
  return {
    answers,
    timeSpentSeconds: undefined,
  };
}

function buildSpeakingPlaceholderAnswers(test: SpeakingTest) {
  return test.parts.flatMap((part) =>
    part.questions.map((question) => ({
      answer: '',
      question_id: question.id,
    }))
  );
}

function isSectionUnlocked(
  sectionType: MockExamSection['type'],
  completedSectionTypes: Set<MockExamSection['type']>
) {
  if (sectionType !== 'speaking') {
    return true;
  }

  return ['listening', 'reading', 'writing'].every((type) =>
    completedSectionTypes.has(type as MockExamSection['type'])
  );
}

function findNextStartableSection(
  sections: MockExamSection[],
  completedSectionTypes: Set<MockExamSection['type']>,
  afterSectionType?: MockExamSection['type']
) {
  const currentIndex =
    afterSectionType !== undefined
      ? sections.findIndex((section) => section.type === afterSectionType)
      : -1;
  const orderedCandidates =
    currentIndex >= 0
      ? [...sections.slice(currentIndex + 1), ...sections.slice(0, currentIndex)]
      : sections;

  return (
    orderedCandidates.find(
      (section) =>
        !completedSectionTypes.has(section.type) &&
        isSectionUnlocked(section.type, completedSectionTypes)
    ) ?? null
  );
}

function MockExamSummary({
  examTitle,
  onClose,
  result,
}: {
  examTitle: string;
  onClose: () => void;
  result: MockExamResult;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-stone-950 dark:bg-[#0b0b0b] dark:text-white">
      <div className="w-full max-w-3xl rounded-[32px] border border-stone-200 bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_28px_72px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-stone-500 uppercase dark:text-white/45">
              Mock Exam Complete
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-950 dark:text-white">
              {examTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-white/65">
              Full mock exam flow finished. Final result was loaded from the mock exam endpoint.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-stone-100"
          >
            Close mock exam
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-stone-500 uppercase dark:text-white/45">
              Overall Band
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-950 dark:text-white">
              {result.overallBand ?? '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-stone-500 uppercase dark:text-white/45">
              Score
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-950 dark:text-white">
              {result.score ?? '—'}
              {typeof result.totalScore === 'number' ? (
                <span className="ml-1 text-base font-medium text-stone-500 dark:text-white/55">
                  / {result.totalScore}
                </span>
              ) : null}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-stone-500 uppercase dark:text-white/45">
              Time Spent
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-950 dark:text-white">
              {formatTimeSpent(result.timeSpentSeconds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockExamSectionInfoSheet({
  onOpenChange,
  onStart,
  open,
  section,
}: {
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
  open: boolean;
  section: MockExamSection | null;
}) {
  if (!section) {
    return null;
  }

  const content = MOCK_SECTION_INFO[section.type];
  const StatsIcon = content.statsIcon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="bg-black/55 backdrop-blur-xl data-[state=open]:duration-200 data-[state=closed]:duration-150"
        className="h-[96vh] rounded-t-2xl border-0 bg-[#f7f7f7] p-0 text-black data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 dark:bg-[#111111] dark:text-white"
      >
        <SheetClose className="absolute -top-6 right-6 z-20 inline-flex items-center justify-center text-white/72 transition-all duration-200 ease-out data-[state=closed]:translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 hover:text-white focus:outline-none">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-5 pb-8 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
          <SheetHeader className="sticky top-0 z-10 -mx-5 border-b border-black/8 bg-[#f7f7f7]/95 px-5 py-4 text-left backdrop-blur-md sm:-mx-8 sm:px-8 dark:border-white/8 dark:bg-[#111111]/95">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-stone-500 uppercase dark:text-white/45">
                  Mock Section
                </p>
                <SheetTitle className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl dark:text-[#ff9f2f]">
                  {content.aboutTitle}
                </SheetTitle>
                <SheetDescription className="sr-only">{content.description}</SheetDescription>
              </div>

              <button
                type="button"
                onClick={onStart}
                className={cn(contestPrimaryButtonClassName, 'h-11 shrink-0 px-5 text-sm font-semibold')}
              >
                Start {SECTION_LABELS[section.type]}
              </button>
            </div>
          </SheetHeader>

          <div className="space-y-7 py-6 text-sm">
            <p className="text-sm text-black/70 dark:text-white/70">
              {SECTION_LABELS[section.type]} - {section.title}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ededed] px-3 py-1.5 font-medium text-black/95 dark:bg-white/8 dark:text-white/95">
                <StatsIcon className="size-4 text-black dark:text-[#ff9f2f]" />
                {content.statsLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ededed] px-3 py-1.5 font-medium text-black/95 dark:bg-white/8 dark:text-white/95">
                <Timer className="size-4 text-black dark:text-[#ff9f2f]" />
                {content.durationLabel}
              </span>
            </div>

            <div className="rounded-2xl bg-[#ededed] p-4 sm:p-5 dark:bg-white/6">
              <p className="mb-3 text-base font-semibold text-black/95 dark:text-white/95">
                What this section helps you improve
              </p>
              <p className="text-sm leading-7 text-black/78 dark:text-white/78">
                {content.improvementCopy}
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {content.improvementPoints.map((point) => {
                  const ImprovementIcon = point.icon;

                  return (
                    <div
                      key={point.text}
                      className="inline-flex items-center gap-2 text-black/86 dark:text-white/86"
                    >
                      <ImprovementIcon className="size-4 text-black dark:text-[#ff9f2f]" />
                      {point.text}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base font-semibold text-black/94 dark:text-white/94">
                {content.coverageTitle}
              </p>

              <ul className="list-disc space-y-4 pl-5 text-sm leading-7 text-black/82 marker:text-black dark:text-white/82 dark:marker:text-[#ff9f2f]">
                {content.coverageItems.map((coverageItem) => (
                  <li key={coverageItem}>{coverageItem}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-[#ededed] p-4 sm:p-5 dark:bg-white/6">
              <p className="inline-flex items-center gap-2 text-base font-semibold text-black/94 dark:text-white/94">
                <Zap className="size-4 text-black dark:text-[#ff9f2f]" />
                Before you start
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-black/78 dark:text-white/78">
                {content.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MockExamSectionChooser({
  activeType,
  completedTypes,
  examTitle,
  onBack,
  onPreviewSection,
  onSelectSection,
  sections,
}: {
  activeType: MockExamSection['type'] | null;
  completedTypes: Set<MockExamSection['type']>;
  examTitle: string;
  onBack: () => void;
  onPreviewSection: (sectionType: MockExamSection['type']) => void;
  onSelectSection: (sectionType: MockExamSection['type']) => void;
  sections: MockExamSection[];
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-stone-950 dark:bg-[#0b0b0b] dark:text-white">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className={cn(contestButtonClassName, 'h-10 gap-2 px-4 text-sm font-semibold')}
          >
            <ArrowLeft className="relative z-10 size-4" />
            <span className="relative z-10">Back</span>
          </button>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-stone-950 dark:text-white sm:text-4xl">
            {examTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-white/60">
            Choose an unlocked section to continue your full IELTS mock exam.
          </p>
        </div>

        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
          {sections.map((section, index) => {
            const isCompleted = completedTypes.has(section.type);
            const isUnlocked = isSectionUnlocked(section.type, completedTypes);
            const canStart = isUnlocked && !isCompleted;
            const isActive = activeType === section.type && canStart;

            return (
              <div
                key={section.type}
                onClick={() => {
                  if (canStart) {
                    onPreviewSection(section.type);
                  }
                }}
                className={cn(
                  contestInsetCardClassName,
                  'rounded-3xl p-5 transition-[transform,box-shadow] duration-200',
                  isActive
                    ? 'after:!bg-[#fff6ec] shadow-[0_12px_28px_rgba(255,120,75,0.16)] dark:after:!bg-[#1a1510] dark:shadow-[0_12px_28px_rgba(255,120,75,0.14)]'
                    : 'hover:after:bg-[#f8fafc] dark:hover:after:bg-[#1a1a1a]',
                  canStart ? 'cursor-pointer' : isCompleted ? 'cursor-default' : 'opacity-70'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-stone-500 uppercase dark:text-white/45">
                      Section {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-stone-950 capitalize dark:text-white">
                      {SECTION_LABELS[section.type]}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 dark:text-white/60">
                      {section.title}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]',
                      isCompleted
                        ? cn(mockFinishedButtonClassName, 'px-3 py-1 text-[11px]')
                        : isUnlocked
                          ? cn(
                              contestButtonClassName,
                              'px-3 py-1 text-[11px] shadow-none dark:shadow-none'
                            )
                          : cn(
                              contestButtonClassName,
                              'px-3 py-1 text-[11px] opacity-70 shadow-none dark:shadow-none'
                            )
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10',
                        isCompleted
                          ? 'text-white'
                          : isUnlocked
                            ? 'text-stone-600 dark:text-white/70'
                            : 'text-stone-600 dark:text-white/70'
                      )}
                    >
                      {isCompleted ? 'Finished' : isUnlocked ? 'Ready' : 'Locked'}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (canStart) {
                      onSelectSection(section.type);
                    }
                  }}
                  disabled={!canStart}
                  className={cn(
                    'mt-5 h-11 px-5 text-sm font-semibold',
                    isActive && isUnlocked
                      ? contestPrimaryButtonClassName
                      : cn(
                          contestButtonClassName,
                          !canStart ? 'cursor-default opacity-70' : 'shadow-none dark:shadow-none'
                        )
                  )}
                >
                  <span
                    className={cn(
                      'relative z-10',
                      isActive && isUnlocked
                        ? 'text-white'
                        : 'text-stone-600 dark:text-white/70'
                    )}
                  >
                    {isCompleted ? 'Completed' : 'Start section'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MockExamRunnerPage({
  attemptId,
  examId,
  examTitle,
}: MockExamRunnerPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const detailQuery = useMockExamDetailQuery(examId, isHydrated && isAuthenticated && Boolean(examId));
  const [activeSectionType, setActiveSectionType] = useState<MockExamSection['type'] | null>(null);
  const [selectedSectionType, setSelectedSectionType] = useState<MockExamSection['type'] | null>(null);
  const [pendingSectionType, setPendingSectionType] = useState<MockExamSection['type'] | null>(null);
  const [viewMode, setViewMode] = useState<RunnerView>('overview');
  const [completedSectionTypes, setCompletedSectionTypes] = useState<Set<MockExamSection['type']>>(
    () => new Set()
  );
  const [finalResult, setFinalResult] = useState<MockExamResult | null>(null);
  const [finalError, setFinalError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const completedSectionTypesRef = useRef<Set<MockExamSection['type']>>(new Set());

  useEffect(() => {
    completedSectionTypesRef.current = completedSectionTypes;
  }, [completedSectionTypes]);

  useEffect(() => {
    setActiveSectionType(null);
    setSelectedSectionType(null);
    setPendingSectionType(null);
    setViewMode('overview');
    setCompletedSectionTypes(new Set());
    completedSectionTypesRef.current = new Set();
    setFinalResult(null);
    setFinalError(null);
    setIsFinishing(false);
  }, [attemptId, examId]);

  const orderedSections = useMemo(() => detailQuery.data?.sections ?? [], [detailQuery.data?.sections]);

  const sectionsByType = useMemo(
    () =>
      Object.fromEntries(
        orderedSections.map((section) => [section.type, section])
      ) as Partial<Record<MockExamSection['type'], MockExamSection>>,
    [orderedSections]
  );

  const listeningQuery = useQuery({
    enabled: isHydrated && isAuthenticated && Boolean(sectionsByType.listening?.id),
    queryFn: () => getListeningSectionDetail(sectionsByType.listening?.id ?? ''),
    queryKey: ['mock-exams', 'section-detail', 'listening', sectionsByType.listening?.id],
    staleTime: 1000 * 60,
  });

  const readingQuery = useQuery({
    enabled: isHydrated && isAuthenticated && Boolean(sectionsByType.reading?.id),
    queryFn: () => getReadingSectionDetail(sectionsByType.reading?.id ?? ''),
    queryKey: ['mock-exams', 'section-detail', 'reading', sectionsByType.reading?.id],
    staleTime: 1000 * 60,
  });

  const writingQuery = useQuery({
    enabled: isHydrated && isAuthenticated && Boolean(sectionsByType.writing?.id),
    queryFn: () => getWritingSectionDetail(sectionsByType.writing?.id ?? ''),
    queryKey: ['mock-exams', 'section-detail', 'writing', sectionsByType.writing?.id],
    staleTime: 1000 * 60,
  });

  const speakingQuery = useQuery({
    enabled: isHydrated && isAuthenticated && Boolean(sectionsByType.speaking?.id),
    queryFn: () => getSpeakingSectionDetail(sectionsByType.speaking?.id ?? ''),
    queryKey: ['mock-exams', 'section-detail', 'speaking', sectionsByType.speaking?.id],
    staleTime: 1000 * 60,
  });

  const activeSection = activeSectionType ? sectionsByType[activeSectionType] ?? null : null;
  const pendingSection = pendingSectionType ? sectionsByType[pendingSectionType] ?? null : null;

  const activeSectionState = useMemo(() => {
    switch (activeSectionType) {
      case 'listening':
        return listeningQuery;
      case 'reading':
        return readingQuery;
      case 'writing':
        return writingQuery;
      case 'speaking':
        return speakingQuery;
      default:
        return null;
    }
  }, [activeSectionType, listeningQuery, readingQuery, speakingQuery, writingQuery]);

  const closeRunner = useCallback(() => {
    router.push(paths.mockExam.root);
  }, [router]);

  const showOverview = useCallback(() => {
    setViewMode('overview');
  }, []);

  const completeSection = useCallback(
    async (sectionType: MockExamSection['type']) => {
      if (!examId || !attemptId) {
        return;
      }

      if (completedSectionTypesRef.current.has(sectionType)) {
        return;
      }

      const nextCompleted = new Set(completedSectionTypesRef.current);
      nextCompleted.add(sectionType);
      completedSectionTypesRef.current = nextCompleted;
      setCompletedSectionTypes(nextCompleted);

      const nextSection = findNextStartableSection(orderedSections, nextCompleted, sectionType);

      if (nextSection) {
        setActiveSectionType(null);
        setSelectedSectionType(nextSection.type);
        setPendingSectionType(null);
        setViewMode('overview');
        return;
      }

      setActiveSectionType(null);
      setSelectedSectionType(null);
      setPendingSectionType(null);
      setViewMode('overview');
      setFinalError(null);
      setIsFinishing(true);

      try {
        await finishMockExam(examId, attemptId);
        setFinalResult(await getMockExamResult(examId, attemptId));
      } catch (error) {
        setFinalError(error instanceof Error ? error.message : 'Could not finish mock exam.');
      } finally {
        setIsFinishing(false);
      }
    },
    [attemptId, examId, orderedSections]
  );

  const handleListeningSubmit = useCallback(
    async (answers: ListeningAnswers) => {
      if (!attemptId || !examId || !sectionsByType.listening?.id || !listeningQuery.data) {
        throw new Error('Listening section is not ready yet.');
      }

      const payload = buildListeningSubmitPayload(
        listeningQuery.data,
        answers,
        attemptId
      );

      await submitMockExamSection({
        answers: payload.answers,
        attemptId,
        examId,
        sectionId: sectionsByType.listening.id,
      });

      return {
        result: {
          ...computeListeningResult(listeningQuery.data, answers),
          attemptId,
          source: 'local',
        } satisfies TestResult,
        reviewTest: listeningQuery.data,
      };
    },
    [attemptId, examId, listeningQuery.data, sectionsByType.listening?.id]
  );

  const handleReadingSubmit = useCallback(
    async (answers: ListeningAnswers) => {
      if (!attemptId || !examId || !sectionsByType.reading?.id || !readingQuery.data) {
        throw new Error('Reading section is not ready yet.');
      }

      const payload = buildListeningSubmitPayload(
        readingQuery.data as unknown as ListeningTest,
        answers,
        attemptId
      );

      await submitMockExamSection({
        answers: payload.answers,
        attemptId,
        examId,
        sectionId: sectionsByType.reading.id,
      });

      return {
        result: {
          ...computeReadingResult(readingQuery.data, answers),
          attemptId,
          source: 'local',
        } satisfies TestResult,
        reviewTest: readingQuery.data as ReadingTest,
      };
    },
    [attemptId, examId, readingQuery.data, sectionsByType.reading?.id]
  );

  const handleWritingSubmit = useCallback(
    async (answers: WritingAnswers) => {
      if (!attemptId || !examId || !sectionsByType.writing?.id || !writingQuery.data) {
        throw new Error('Writing section is not ready yet.');
      }

      await submitMockExamSection({
        answers: writingQuery.data.parts.map((part) => ({
          answer: answers[part.task.id] ?? '',
          question_id: part.task.id,
        })),
        attemptId,
        examId,
        sectionId: sectionsByType.writing.id,
      });

      return {
        result: buildWritingMockResult(answers),
      };
    },
    [attemptId, examId, sectionsByType.writing?.id, writingQuery.data]
  );

  const handleSpeakingComplete = useCallback(async () => {
    if (!attemptId || !examId || !sectionsByType.speaking?.id || !speakingQuery.data) {
      throw new Error('Speaking section is not ready yet.');
    }

    await submitMockExamSection({
      answers: buildSpeakingPlaceholderAnswers(speakingQuery.data),
      attemptId,
      examId,
      sectionId: sectionsByType.speaking.id,
    });

    await completeSection('speaking');
  }, [attemptId, completeSection, examId, sectionsByType.speaking?.id, speakingQuery.data]);

  const handleSectionSelect = useCallback(
    (sectionType: MockExamSection['type']) => {
      const isCompleted = completedSectionTypes.has(sectionType);
      const isUnlocked = isSectionUnlocked(sectionType, completedSectionTypes);

      if (isCompleted || !isUnlocked) {
        return;
      }

      setSelectedSectionType(sectionType);
      setPendingSectionType(sectionType);
    },
    [completedSectionTypes]
  );

  const handleSectionInfoOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingSectionType(null);
    }
  }, []);

  const handleStartPendingSection = useCallback(() => {
    if (!pendingSectionType) {
      return;
    }

    const isCompleted = completedSectionTypes.has(pendingSectionType);
    const isUnlocked = isSectionUnlocked(pendingSectionType, completedSectionTypes);

    if (isCompleted || !isUnlocked) {
      return;
    }

    setActiveSectionType(pendingSectionType);
    setPendingSectionType(null);
    setSelectedSectionType(pendingSectionType);
    setViewMode('section');
  }, [completedSectionTypes, pendingSectionType]);

  const handleSectionPreview = useCallback(
    (sectionType: MockExamSection['type']) => {
      const isCompleted = completedSectionTypes.has(sectionType);
      const isUnlocked = isSectionUnlocked(sectionType, completedSectionTypes);

      if (isCompleted || !isUnlocked) {
        return;
      }

      setSelectedSectionType(sectionType);
    },
    [completedSectionTypes]
  );

  useEffect(() => {
    if (!isHydrated || isAuthenticated) {
      return;
    }

    router.replace(buildLoginHref(pathname || '/mock-exams'));
  }, [isAuthenticated, isHydrated, pathname, router]);

  const resolvedExamTitle = detailQuery.data?.title ?? examTitle ?? 'Mock Exam';
  const activeError =
    activeSectionState?.error instanceof Error ? activeSectionState.error.message : null;
  const defaultSelectedSectionType = useMemo(
    () => findNextStartableSection(orderedSections, completedSectionTypes)?.type ?? null,
    [completedSectionTypes, orderedSections]
  );
  const highlightedSectionType = selectedSectionType ?? defaultSelectedSectionType;

  const activeSectionView = (() => {
    if (viewMode === 'overview' && orderedSections.length) {
      return (
        <MockExamSectionChooser
          activeType={highlightedSectionType}
          completedTypes={completedSectionTypes}
          examTitle={resolvedExamTitle}
          onBack={closeRunner}
          onPreviewSection={handleSectionPreview}
          onSelectSection={handleSectionSelect}
          sections={orderedSections}
        />
      );
    }

    if (!activeSectionType || !activeSection) {
      if (finalResult) {
        return (
          <MockExamSummary
            examTitle={resolvedExamTitle}
            onClose={closeRunner}
            result={finalResult}
          />
        );
      }

      if (finalError) {
        return (
          <PracticePageState
            actionLabel="Close mock exam"
            description={finalError}
            label="We couldn't finish this mock exam."
            onAction={closeRunner}
          />
        );
      }

      return <PracticePageState icon="spinner" label="Preparing your mock exam..." />;
    }

    if (activeError) {
      return (
        <PracticePageState
          actionLabel="Close mock exam"
          description={activeError}
          label={`We couldn't load the ${SECTION_LABELS[activeSection.type].toLowerCase()} section.`}
          onAction={closeRunner}
        />
      );
    }

    if (activeSectionState?.isLoading || !activeSectionState?.data) {
      return (
        <PracticePageState
          icon="spinner"
          label={`Loading ${SECTION_LABELS[activeSection.type].toLowerCase()} section...`}
        />
      );
    }

    if (activeSection.type === 'listening') {
      return (
        <ListeningTestView
          attemptId={attemptId}
          onBack={showOverview}
          onShowSubmittedResult={() => {
            void completeSection('listening');
          }}
          onSubmitAttempt={handleListeningSubmit}
          test={activeSectionState.data as ListeningTest}
        />
      );
    }

    if (activeSection.type === 'reading') {
      return (
        <ReadingTestView
          attemptId={attemptId}
          onBack={showOverview}
          onShowSubmittedResult={() => {
            void completeSection('reading');
          }}
          onSubmitAttempt={handleReadingSubmit}
          test={activeSectionState.data as ReadingTest}
        />
      );
    }

    if (activeSection.type === 'writing') {
      return (
        <WritingTestView
          attemptId={attemptId}
          onBack={showOverview}
          onShowSubmittedResult={() => {
            void completeSection('writing');
          }}
          onSubmitAttempt={handleWritingSubmit}
          test={activeSectionState.data as WritingTest}
        />
      );
    }

    return (
      <SpeakingTestView
        attemptId={attemptId ?? `mock-${activeSection.id}`}
        onExamComplete={() => {
          void handleSpeakingComplete();
        }}
        onExit={showOverview}
        showResultDialog={false}
        test={activeSectionState.data as SpeakingTest}
      />
    );
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isHydrated ? (
        <PracticePageState icon="spinner" label="Checking your session..." />
      ) : detailQuery.isLoading && !detailQuery.data ? (
        <PracticePageState icon="spinner" label="Loading mock exam details..." />
      ) : detailQuery.error instanceof Error ? (
        <PracticePageState
          actionLabel="Back to mock exams"
          description={detailQuery.error.message}
          label="We couldn't load this mock exam."
          onAction={closeRunner}
        />
      ) : !attemptId ? (
        <PracticePageState
          actionLabel="Back to mock exams"
          description="Start this mock exam from the mock exam list so an attempt can be created first."
          label="Mock exam attempt is missing."
          onAction={closeRunner}
        />
      ) : (
        activeSectionView
      )}

      <MockExamSectionInfoSheet
        onOpenChange={handleSectionInfoOpenChange}
        onStart={handleStartPendingSection}
        open={Boolean(pendingSection)}
        section={pendingSection}
      />

      {isFinishing ? (
        <PracticeSubmittingOverlay
          description="Your final mock exam result is being prepared."
          label="Finishing mock exam..."
        />
      ) : null}
    </div>
  );
}
