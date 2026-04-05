'use client';

import type { Answers, TestResult, ListeningTest } from '../types';

import { Button } from '@/src/components/ui/button';
import { MainFooter } from '@/src/layouts/main/footer';
import { ListeningTestLayout } from '@/src/layouts/listening';
import { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, BarChart3, ArrowLeft, LoaderCircle } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/src/components/ui/dialog';

import { PartPanel } from './part-panel';
import { ScoreSummary } from './score-summary-shell';
import { computeResult, getPartQuestions, getListeningQuestionAnchorId } from '../utils';

type Stage = 'test' | 'submitted' | 'review';
type ExitIntent = 'button' | 'browser-back';

interface Props {
  attemptId?: string | null;
  initialResult?: TestResult | null;
  initialReviewTest?: ListeningTest;
  isRetrying?: boolean;
  onShowSubmittedResult?: () => void;
  onSubmitAttempt?: (answers: Answers) => Promise<{
    result: TestResult;
    reviewTest?: ListeningTest;
  }>;
  onRetryAttempt?: () => Promise<void> | void;
  test: ListeningTest;
  onBack: () => void;
}

const QUESTION_SCROLL_OFFSET = 156;
const QUESTION_SCROLL_SETTLE_DELAY_MS = 260;
const DEFAULT_DURATION_MINUTES = 30;

function getTestDurationSeconds(test: ListeningTest) {
  return (test.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60;
}

function getFirstQuestionId(test: ListeningTest, partNumber: number) {
  const part = test.parts.find((entry) => entry.number === partNumber);

  if (!part) {
    return null;
  }

  return getPartQuestions(part)[0]?.id ?? null;
}

function getNextQuestionTarget(test: ListeningTest, currentQuestionId: string) {
  for (const part of test.parts) {
    const questions = getPartQuestions(part);
    const currentQuestionIndex = questions.findIndex((question) => question.id === currentQuestionId);

    if (currentQuestionIndex === -1) {
      continue;
    }

    const nextQuestion = questions[currentQuestionIndex + 1];

    if (nextQuestion) {
      return {
        partNumber: part.number,
        questionId: nextQuestion.id,
      };
    }

    const nextPart = test.parts.find((entry) => entry.number === part.number + 1);
    const firstQuestionInNextPart = nextPart ? getPartQuestions(nextPart)[0] : null;

    if (nextPart && firstQuestionInNextPart) {
      return {
        partNumber: nextPart.number,
        questionId: firstQuestionInNextPart.id,
      };
    }

    return null;
  }

  return null;
}

export function ListeningTestView({
  attemptId,
  initialResult = null,
  initialReviewTest,
  isRetrying = false,
  onShowSubmittedResult,
  onSubmitAttempt,
  onRetryAttempt,
  test,
  onBack,
}: Props) {
  const allowNextBrowserNavigationRef = useRef(false);
  const hasAutoSubmittedOnTimeoutRef = useRef(false);
  const [answers, setAnswers] = useState<Answers>(initialResult?.answers ?? {});
  const [activePart, setActivePart] = useState<number>(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() =>
    getFirstQuestionId(test, 1)
  );
  const [displayTest, setDisplayTest] = useState<ListeningTest>(initialReviewTest ?? test);
  const [exitIntent, setExitIntent] = useState<ExitIntent>('button');
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>(initialResult ? 'submitted' : 'test');
  const [result, setResult] = useState<TestResult | null>(initialResult);
  const totalDurationSeconds = getTestDurationSeconds(test);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(totalDurationSeconds);
  const currentPart = displayTest.parts.find((part) => part.number === activePart)!;

  useEffect(() => {
    if (stage === 'test') {
      setDisplayTest(test);
    }
  }, [stage, test]);

  useEffect(() => {
    if (!attemptId || !initialResult) {
      return;
    }

    setAnswers(initialResult.answers);
    setDisplayTest(initialReviewTest ?? test);
    setResult(initialResult);
    setStage('submitted');
  }, [attemptId, initialResult, initialReviewTest, test]);

  useEffect(() => {
    if (stage !== 'test' || timeLeftSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((currentTime) => Math.max(0, currentTime - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, timeLeftSeconds]);

  useEffect(() => {
    if (stage !== 'test' || timeLeftSeconds > 0) {
      hasAutoSubmittedOnTimeoutRef.current = false;
    }
  }, [stage, timeLeftSeconds]);

  useEffect(() => {
    if (stage !== 'test') {
      return undefined;
    }

    const pushGuardState = () => {
      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          __listeningExitGuard: true,
        },
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

  useEffect(() => {
    if (!pendingQuestionId) {
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const target = document.getElementById(getListeningQuestionAnchorId(pendingQuestionId));

      if (target) {
        setActiveQuestionId(pendingQuestionId);
        const targetTop = window.scrollY + target.getBoundingClientRect().top - QUESTION_SCROLL_OFFSET;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });

        const focusTarget = target.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [data-question-focus], button:not([disabled])'
        );

        window.setTimeout(() => {
          const elementToFocus = focusTarget ?? target;

          elementToFocus.focus({ preventScroll: true });

          if (
            elementToFocus instanceof HTMLInputElement ||
            elementToFocus instanceof HTMLTextAreaElement
          ) {
            const cursorPosition = elementToFocus.value.length;
            elementToFocus.setSelectionRange(cursorPosition, cursorPosition);
          }
        }, QUESTION_SCROLL_SETTLE_DELAY_MS);
      }

      setPendingQuestionId(null);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [activePart, pendingQuestionId]);

  useEffect(() => {
    const anchorPrefix = 'listening-question-';

    const handleFocusIn = (event: FocusEvent) => {
      const eventTarget = event.target;

      if (!(eventTarget instanceof HTMLElement)) {
        return;
      }

      const questionAnchor = eventTarget.closest(`[id^="${anchorPrefix}"]`) as HTMLElement | null;

      if (!questionAnchor) {
        return;
      }

      const nextQuestionId = questionAnchor.id.replace(anchorPrefix, '');

      setActiveQuestionId((previousId) =>
        previousId === nextQuestionId ? previousId : nextQuestionId
      );
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [currentPart]);

  useEffect(() => {
    if (stage !== 'test') {
      return undefined;
    }

    const anchorPrefix = 'listening-question-';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== 'Enter' ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing
      ) {
        return;
      }

      const eventTarget = event.target;

      if (!(eventTarget instanceof HTMLInputElement) || eventTarget.type !== 'text') {
        return;
      }

      const questionAnchor = eventTarget.closest(`[id^="${anchorPrefix}"]`) as HTMLElement | null;

      if (!questionAnchor) {
        return;
      }

      const currentQuestionId = questionAnchor.id.replace(anchorPrefix, '');
      const nextQuestionTarget = getNextQuestionTarget(displayTest, currentQuestionId);

      if (!nextQuestionTarget) {
        return;
      }

      event.preventDefault();
      setActivePart(nextQuestionTarget.partNumber);
      setActiveQuestionId(nextQuestionTarget.questionId);
      setPendingQuestionId(nextQuestionTarget.questionId);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [displayTest, stage]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fallbackTimeSpentSeconds = Math.max(0, totalDurationSeconds - timeLeftSeconds);

      if (onSubmitAttempt) {
        const submission = await onSubmitAttempt(answers);

        setDisplayTest(submission.reviewTest ?? test);
        setResult({
          ...submission.result,
          timeSpentSeconds: submission.result.timeSpentSeconds ?? fallbackTimeSpentSeconds,
        });
        setStage('submitted');
        onShowSubmittedResult?.();
        return;
      }

      const r = computeResult(test, answers);
      setResult({
        ...r,
        timeSpentSeconds: fallbackTimeSpentSeconds,
      });
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
    test,
    timeLeftSeconds,
    totalDurationSeconds,
  ]);

  useEffect(() => {
    if (
      stage !== 'test' ||
      isSubmitting ||
      timeLeftSeconds > 0 ||
      hasAutoSubmittedOnTimeoutRef.current
    ) {
      return;
    }

    hasAutoSubmittedOnTimeoutRef.current = true;
    void handleSubmit();
  }, [handleSubmit, isSubmitting, stage, timeLeftSeconds]);

  const handleReview = () => {
    setStage('review');
    setActivePart(1);
    setActiveQuestionId(getFirstQuestionId(displayTest, 1));
  };

  const handleRetry = () => {
    hasAutoSubmittedOnTimeoutRef.current = false;

    if (onRetryAttempt) {
      void onRetryAttempt();
      return;
    }

    setAnswers({});
    setDisplayTest(test);
    setResult(null);
    setStage('test');
    setActivePart(1);
    setActiveQuestionId(getFirstQuestionId(test, 1));
    setTimeLeftSeconds(totalDurationSeconds);
  };

  const isReview = stage === 'review';
  const isBackToTestsAction = activePart === 1;

  const handlePrevAction = () => {
    if (isBackToTestsAction) {
      if (isReview) {
        onBack();
        return;
      }

      setExitIntent('button');
      setIsExitDialogOpen(true);
      return;
    }

    const previousPart = Math.max(1, activePart - 1) as 1 | 2 | 3 | 4;

    setActivePart(previousPart);
    setActiveQuestionId(getFirstQuestionId(displayTest, previousPart));
  };

  const handlePrimaryAction = () => {
    if (isReview) {
      handleRetry();
      return;
    }

    if (activePart < displayTest.parts.length) {
      const nextPart = Math.min(displayTest.parts.length, activePart + 1);

      setActivePart(nextPart);
      setActiveQuestionId(getFirstQuestionId(displayTest, nextPart));
      return;
    }

      void handleSubmit();
    };

  if (stage === 'submitted' && result) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="black"
                onClick={onBack}
                className="h-11 rounded-xl border-transparent bg-white/8 px-4 text-sm font-medium text-white hover:bg-white/12"
              >
                <ArrowLeft className="size-4" strokeWidth={2.2} />
                Back to tests
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="orange"
                  onClick={handleReview}
                  className="h-11 rounded-xl px-4 text-sm font-medium"
                >
                  <BarChart3 className="size-[18px]" />
                  Review answers
                </Button>

                <Button
                  type="button"
                  variant="default"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="h-11 rounded-xl border-transparent bg-[#ff3131] px-4 text-sm font-medium text-white hover:bg-[#ff4949]"
                >
                  <RotateCcw className="size-[18px]" />
                  {isRetrying ? 'Starting...' : 'Try again'}
                </Button>
              </div>
            </div>

            <ScoreSummary result={result} />
          </div>
        </div>

        <MainFooter />
      </div>
    );
  }

  return (
    <>
      <ListeningTestLayout
        activePart={activePart}
        activeQuestionId={activeQuestionId}
        audioUrl={currentPart.audioUrl}
        answers={answers}
        isPrimaryActionDisabled={isSubmitting}
        isPrevDisabled={false}
        isReview={isReview}
        onPartChange={(partNumber) => {
          setActivePart(partNumber);
          setActiveQuestionId(getFirstQuestionId(test, partNumber));
        }}
        onPrevPart={handlePrevAction}
        onPrimaryAction={handlePrimaryAction}
        onQuestionSelect={(partNumber, questionId) => {
          setActivePart(partNumber);
          setActiveQuestionId(questionId);
          setPendingQuestionId(questionId);
        }}
        primaryActionLabelOverride={isSubmitting ? 'Submitting...' : undefined}
        prevActionLabel={isBackToTestsAction ? 'Back to tests' : 'Prev'}
        test={displayTest}
        timeLeftSeconds={timeLeftSeconds}
      >
        <div className="mx-auto w-full max-w-[1000px]">
          <PartPanel
            activeQuestionId={activeQuestionId}
            part={currentPart}
            answers={answers}
            onChange={handleChange}
            showAnswer={isReview}
          />
        </div>
      </ListeningTestLayout>

      {isSubmitting ? <ListeningSubmittingOverlay /> : null}

      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent
          overlayClassName="z-[120] bg-black/58"
          showCloseButton={false}
          className="z-[121] border border-white/10 bg-[#111111] text-white sm:max-w-md"
        >
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              Leave this test?
            </DialogTitle>
            <DialogDescription className="text-sm leading-7 text-white/68">
              If you leave now, this listening attempt will not be submitted and your result
              will not be calculated.
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
    </>
  );
}

function ListeningSubmittingOverlay() {
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-white/72 px-6 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center text-stone-950">
        <LoaderCircle className="size-9 animate-spin text-stone-900" />
        <div className="space-y-1.5">
          <p className="text-lg font-semibold tracking-[-0.02em]">Calculating your result...</p>
          <p className="text-sm text-stone-600">Your answers are being submitted and checked.</p>
        </div>
      </div>
    </div>
  );
}
