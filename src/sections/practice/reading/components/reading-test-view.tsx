'use client';

import type { Answers, TestResult, ReadingTest } from '../types';

import { Button } from '@/src/components/ui/button';
import { MainFooter } from '@/src/layouts/main/footer';
import { ReadingTestLayout } from '@/src/layouts/reading';
import { RotateCcw, BarChart3, ArrowLeft } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  PracticeTextSizeProvider,
  PRACTICE_TEXT_SIZE_DEFAULT,
} from '@/src/sections/practice/shared/practice-text-size';
import {
  PracticeScoreSummary,
  PracticeConfirmDialog,
  PracticeSubmittingOverlay,
} from '@/src/sections/practice/components';

import { ReadingPartPanel } from './reading-part-panel';
import { computeResult, getPartQuestions, getListeningQuestionAnchorId } from '../utils';

type Stage = 'test' | 'submitted' | 'review';
type ExitIntent = 'button' | 'browser-back';

interface Props {
  attemptId?: string | null;
  initialResult?: TestResult | null;
  initialReviewTest?: ReadingTest;
  isRetrying?: boolean;
  onBack: () => void;
  onRetryAttempt?: () => Promise<void> | void;
  onShowSubmittedResult?: () => void;
  onSubmitAttempt?: (answers: Answers) => Promise<{
    result: TestResult;
    reviewTest?: ReadingTest;
  }>;
  test: ReadingTest;
}

const QUESTION_SCROLL_OFFSET = 156;
const QUESTION_SCROLL_SETTLE_DELAY_MS = 260;
const DEFAULT_DURATION_MINUTES = 60;

function getTestDurationSeconds(test: ReadingTest) {
  return (test.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60;
}

function getFirstQuestionId(test: ReadingTest, partNumber: number) {
  const part = test.parts.find((entry) => entry.number === partNumber);

  if (!part) {
    return null;
  }

  return getPartQuestions(part)[0]?.id ?? null;
}

function getNextQuestionTarget(test: ReadingTest, currentQuestionId: string) {
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

export function ReadingTestView({
  attemptId,
  initialResult = null,
  initialReviewTest,
  isRetrying = false,
  onBack,
  onRetryAttempt,
  onShowSubmittedResult,
  onSubmitAttempt,
  test,
}: Props) {
  const allowNextBrowserNavigationRef = useRef(false);
  const hasAutoSubmittedOnTimeoutRef = useRef(false);
  const [answers, setAnswers] = useState<Answers>(initialResult?.answers ?? {});
  const [activePart, setActivePart] = useState<number>(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() =>
    getFirstQuestionId(test, 1)
  );
  const [displayTest, setDisplayTest] = useState<ReadingTest>(initialReviewTest ?? test);
  const [exitIntent, setExitIntent] = useState<ExitIntent>('button');
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>(initialResult ? 'submitted' : 'test');
  const [result, setResult] = useState<TestResult | null>(initialResult);
  const totalDurationSeconds = getTestDurationSeconds(test);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(totalDurationSeconds);
  const [textSize, setTextSize] = useState(PRACTICE_TEXT_SIZE_DEFAULT);
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
          __readingExitGuard: true,
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

      const nextResult = computeResult(test, answers);
      setResult({
        ...nextResult,
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
  const isSubmitAction = !isReview && activePart >= displayTest.parts.length;

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

    const previousPart = Math.max(1, activePart - 1);

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

    setIsSubmitDialogOpen(true);
  };

  const handleLogoAction = () => {
    if (isReview) {
      onBack();
      return;
    }

    openExitDialog('button');
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
                Back to reading
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

            <PracticeScoreSummary result={result} />
          </div>
        </div>

        <MainFooter />
      </div>
    );
  }

  return (
    <>
      <ReadingTestLayout
        activePart={activePart}
        activeQuestionId={activeQuestionId}
        answers={answers}
        isPrimaryActionDisabled={isSubmitting}
        isPrevDisabled={isBackToTestsAction}
        isReview={isReview}
        onLogoClick={handleLogoAction}
        onPartChange={(partNumber) => {
          setActivePart(partNumber);
          setActiveQuestionId(getFirstQuestionId(displayTest, partNumber));
        }}
        onPrevPart={handlePrevAction}
        onPrimaryAction={handlePrimaryAction}
        onQuestionSelect={(partNumber, questionId) => {
          setActivePart(partNumber);
          setActiveQuestionId(questionId);
          setPendingQuestionId(questionId);
        }}
        onTextSizeChange={setTextSize}
        primaryActionLabelOverride={isSubmitting ? 'Submitting...' : undefined}
        prevActionLabel="Prev"
        test={displayTest}
        textSize={textSize}
        timeLeftSeconds={timeLeftSeconds}
      >
        <PracticeTextSizeProvider value={textSize}>
          <ReadingPartPanel
            activeQuestionId={activeQuestionId}
            answers={answers}
            onChange={handleChange}
            part={currentPart}
            showAnswer={isReview}
          />
        </PracticeTextSizeProvider>
      </ReadingTestLayout>

      {isSubmitting ? (
        <PracticeSubmittingOverlay description="Your reading answers are being submitted and checked." />
      ) : null}

      <PracticeConfirmDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        title="Leave this test?"
        description="If you leave now, this reading attempt will not be submitted and your result will not be calculated."
        cancelLabel="Stay here"
        confirmLabel="Leave test"
        onConfirm={() => {
          if (exitIntent === 'browser-back') {
            if (window.history.length > 2) {
              allowNextBrowserNavigationRef.current = true;
              window.history.go(-2);
              return;
            }
          }

          onBack();
        }}
      />

      <PracticeConfirmDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        title="Submit your answers?"
        description="Your reading answers will be sent for checking and this attempt will be completed. Are you sure you want to submit now?"
        cancelLabel="Cancel"
        confirmLabel="Submit answers"
        confirmDisabled={isSubmitting || !isSubmitAction}
        onConfirm={() => {
          void handleSubmit();
        }}
      />
    </>
  );
}
