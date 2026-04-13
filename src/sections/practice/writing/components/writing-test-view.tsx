'use client';

import type { WritingTest, WritingAnswers, WritingTextSize, WritingTestResult } from '../types';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { MainFooter } from '@/src/layouts/main/footer';
import { WritingTestLayout } from '@/src/layouts/writing';
import { ArrowLeft, BarChart3, RotateCcw } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PracticeSubmittingOverlay } from '@/src/sections/practice/components';
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/src/components/ui/dialog';

import { countWords } from '../utils';
import { WRITING_TEXT_SIZE_DEFAULT } from '../types';
import { WritingTaskPanel } from './writing-task-panel';

type Stage = 'test' | 'submitted' | 'review';
type ExitIntent = 'button' | 'browser-back';

interface Props {
  attemptId?: string | null;
  initialResult?: WritingTestResult | null;
  isRetrying?: boolean;
  onBack: () => void;
  onRetryAttempt?: () => Promise<void> | void;
  onShowSubmittedResult?: () => void;
  onSubmitAttempt?: (answers: WritingAnswers) => Promise<{ result: WritingTestResult }>;
  test: WritingTest;
}

const DEFAULT_DURATION_MINUTES = 60;

function getTestDurationSeconds(test: WritingTest) {
  return (test.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60;
}

export function WritingTestView({
  attemptId,
  initialResult = null,
  isRetrying = false,
  onBack,
  onRetryAttempt,
  onShowSubmittedResult,
  onSubmitAttempt,
  test,
}: Props) {
  const allowNextBrowserNavigationRef = useRef(false);
  const hasAutoSubmittedOnTimeoutRef = useRef(false);
  const [answers, setAnswers] = useState<WritingAnswers>(initialResult?.answers ?? {});
  const [activePart, setActivePart] = useState<number>(1);
  const [exitIntent, setExitIntent] = useState<ExitIntent>('button');
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>(initialResult ? 'submitted' : 'test');
  const [result, setResult] = useState<WritingTestResult | null>(initialResult);
  const totalDurationSeconds = getTestDurationSeconds(test);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(totalDurationSeconds);
  const [textSize, setTextSize] = useState<WritingTextSize>(WRITING_TEXT_SIZE_DEFAULT);
  const currentPart = test.parts.find((part) => part.number === activePart)!;

  useEffect(() => {
    if (!attemptId || !initialResult) return;
    setAnswers(initialResult.answers);
    setResult(initialResult);
    setStage('submitted');
  }, [attemptId, initialResult]);

  useEffect(() => {
    if (stage !== 'test' || timeLeftSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeftSeconds((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, timeLeftSeconds]);

  useEffect(() => {
    if (stage !== 'test') {
      hasAutoSubmittedOnTimeoutRef.current = false;
    }
  }, [stage, timeLeftSeconds]);

  useEffect(() => {
    if (stage !== 'test') return undefined;

    const pushGuardState = () => {
      window.history.pushState(
        { ...(window.history.state ?? {}), __writingExitGuard: true },
        '',
        window.location.href
      );
    };

    pushGuardState();

    const handlePopState = () => {
      if (allowNextBrowserNavigationRef.current) {
        allowNextBrowserNavigationRef.current = false;
        return;
      }
      setExitIntent('browser-back');
      setIsExitDialogOpen(true);
      pushGuardState();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  const handleChange = (taskId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const fallbackTimeSpentSeconds = Math.max(0, totalDurationSeconds - timeLeftSeconds);

      if (onSubmitAttempt) {
        const submission = await onSubmitAttempt(answers);
        setResult({
          ...submission.result,
          timeSpentSeconds: submission.result.timeSpentSeconds ?? fallbackTimeSpentSeconds,
        });
        setStage('submitted');
        onShowSubmittedResult?.();
        return;
      }

      setResult({ answers, timeSpentSeconds: fallbackTimeSpentSeconds });
      setStage('submitted');
      onShowSubmittedResult?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    answers,
    isSubmitting,
    onShowSubmittedResult,
    onSubmitAttempt,
    timeLeftSeconds,
    totalDurationSeconds,
  ]);

  useEffect(() => {
    if (
      stage !== 'test' ||
      isSubmitting ||
      timeLeftSeconds > 0 ||
      hasAutoSubmittedOnTimeoutRef.current
    )
      return;
    hasAutoSubmittedOnTimeoutRef.current = true;
    void handleSubmit();
  }, [handleSubmit, isSubmitting, stage, timeLeftSeconds]);

  const handleReview = () => {
    setStage('review');
    setActivePart(1);
  };

  const handleRetry = () => {
    hasAutoSubmittedOnTimeoutRef.current = false;
    if (onRetryAttempt) {
      void onRetryAttempt();
      return;
    }
    setAnswers({});
    setResult(null);
    setStage('test');
    setActivePart(1);
    setTimeLeftSeconds(totalDurationSeconds);
  };

  const isReview = stage === 'review';
  const isBackToTestsAction = activePart === 1;

  const openExitDialog = (intent: ExitIntent) => {
    setExitIntent(intent);
    setIsExitDialogOpen(true);
  };

  const handlePrevAction = () => {
    if (isBackToTestsAction) {
      if (isReview) {
        onBack();
        return;
      }
      openExitDialog('button');
      return;
    }
    setActivePart((p) => Math.max(1, p - 1));
  };

  const handlePrimaryAction = () => {
    if (isReview) {
      handleRetry();
      return;
    }
    if (activePart < test.parts.length) {
      setActivePart((p) => Math.min(test.parts.length, p + 1));
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  const handleLogoAction = () => {
    if (isReview) {
      onBack();
      return;
    }
    openExitDialog('button');
  };

  // ── Submitted result screen ──
  if (stage === 'submitted' && result) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="black"
                onClick={onBack}
                className="h-11 rounded-xl border-transparent bg-white/8 px-4 text-sm font-medium text-white hover:bg-white/12"
              >
                <ArrowLeft className="size-4" strokeWidth={2.2} />
                Back to writing
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="orange"
                  onClick={handleReview}
                  className="h-11 rounded-xl px-4 text-sm font-medium"
                >
                  <BarChart3 className="size-4.5" />
                  Review essays
                </Button>
                <Button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="h-11 rounded-xl border-transparent bg-[#ff3131] px-4 text-sm font-medium text-white hover:bg-[#ff4949]"
                >
                  <RotateCcw className="size-4.5" />
                  {isRetrying ? 'Starting...' : 'Try again'}
                </Button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <p className="text-sm text-white/60">Status</p>
                <p className="mt-1 text-lg font-semibold text-white">Submitted — awaiting review</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Writing essays require human grading. Your submission has been recorded.
                </p>
              </div>

              {test.parts.map((part) => {
                const essay = result.answers[part.task.id] ?? '';
                const words = countWords(essay);

                return (
                  <div
                    key={part.number}
                    className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{part.title}</p>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold tabular-nums',
                          words >= part.task.wordLimitMin
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        )}
                      >
                        {words} words
                      </span>
                    </div>
                    {essay ? (
                      <p className="text-sm leading-7 text-white/60 line-clamp-3">{essay}</p>
                    ) : (
                      <p className="text-sm italic text-white/30">No response submitted.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  return (
    <>
      <WritingTestLayout
        activePart={activePart}
        answers={answers}
        isPrimaryActionDisabled={isSubmitting}
        isPrevDisabled={false}
        isReview={isReview}
        onLogoClick={handleLogoAction}
        onPartChange={(partNumber) => setActivePart(partNumber)}
        onPrevPart={handlePrevAction}
        onPrimaryAction={handlePrimaryAction}
        onTextSizeChange={setTextSize}
        primaryActionLabelOverride={isSubmitting ? 'Submitting...' : undefined}
        prevActionLabel={isBackToTestsAction ? 'Back to tests' : 'Prev'}
        test={test}
        textSize={textSize}
        timeLeftSeconds={timeLeftSeconds}
      >
        <WritingTaskPanel
          answers={answers}
          isReview={isReview}
          onChange={handleChange}
          part={currentPart}
          textSize={textSize}
        />
      </WritingTestLayout>

      {isSubmitting ? (
        <PracticeSubmittingOverlay description="Your writing answers are being submitted." />
      ) : null}

      {/* Exit dialog */}
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent
          overlayClassName="z-[120] bg-black/58"
          showCloseButton={false}
          className="z-121 border border-white/10 bg-[#111111] text-white sm:max-w-md"
        >
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-white">Leave this test?</DialogTitle>
            <DialogDescription className="text-sm leading-7 text-white/68">
              If you leave now, this writing attempt will not be submitted and your response will
              not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:justify-start">
            <Button
              type="button"
              variant="orange"
              className="rounded-full"
              onClick={() => {
                setIsExitDialogOpen(false);
                if (exitIntent === 'browser-back') {
                  if (window.history.length > 2) {
                    allowNextBrowserNavigationRef.current = true;
                    window.history.go(-2);
                    return;
                  }
                }
                onBack();
              }}
            >
              Leave test
            </Button>
            <Button
              type="button"
              variant="black"
              className="rounded-full border-white/14 bg-white/6 hover:bg-white/10"
              onClick={() => setIsExitDialogOpen(false)}
            >
              Stay here
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent
          overlayClassName="z-[120] bg-black/58"
          showCloseButton={false}
          className="z-121 border border-white/10 bg-[#111111] text-white sm:max-w-md"
        >
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              Submit your essays?
            </DialogTitle>
            <DialogDescription className="text-sm leading-7 text-white/68">
              Your writing responses will be submitted for review. Are you sure you want to submit
              now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:justify-start">
            <Button
              type="button"
              variant="orange"
              className="rounded-full"
              disabled={isSubmitting}
              onClick={() => {
                setIsSubmitDialogOpen(false);
                void handleSubmit();
              }}
            >
              Submit essays
            </Button>
            <Button
              type="button"
              variant="black"
              className="rounded-full border-white/14 bg-white/6 hover:bg-white/10"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
