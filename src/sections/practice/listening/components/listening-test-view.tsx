'use client';

import type { Answers, TestResult, ListeningTest } from '../types';

import { useState, useEffect } from 'react';
import { ListeningTestLayout } from '@/src/layouts/listening';

import { PartPanel } from './part-panel';
import { ScoreSummary } from './score-summary';
import { computeResult, getPartQuestions, getListeningQuestionAnchorId } from '../utils';

type Stage = 'test' | 'submitted' | 'review';

interface Props {
  test: ListeningTest;
  onBack: () => void;
}

const QUESTION_SCROLL_OFFSET = 156;

function getFirstQuestionId(test: ListeningTest, partNumber: 1 | 2 | 3 | 4) {
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

export function ListeningTestView({ test, onBack }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [activePart, setActivePart] = useState<1 | 2 | 3 | 4>(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() =>
    getFirstQuestionId(test, 1)
  );
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('test');
  const [result, setResult] = useState<TestResult | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60);
  const currentPart = test.parts.find((part) => part.number === activePart)!;

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
          behavior: 'auto',
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
        }, 80);
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
      const nextQuestionTarget = getNextQuestionTarget(test, currentQuestionId);

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
  }, [stage, test]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const r = computeResult(test, answers);
    setResult(r);
    setStage('submitted');
  };

  const handleReview = () => {
    setStage('review');
    setActivePart(1);
    setActiveQuestionId(getFirstQuestionId(test, 1));
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setStage('test');
    setActivePart(1);
    setActiveQuestionId(getFirstQuestionId(test, 1));
    setTimeLeftSeconds(30 * 60);
  };

  const isReview = stage === 'review';

  const handlePrimaryAction = () => {
    if (isReview) {
      handleRetry();
      return;
    }

    if (activePart < 4) {
      const nextPart = Math.min(4, activePart + 1) as 1 | 2 | 3 | 4;

      setActivePart(nextPart);
      setActiveQuestionId(getFirstQuestionId(test, nextPart));
      return;
    }

    handleSubmit();
  };

  if (stage === 'submitted' && result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          ← Back to tests
        </button>
        <ScoreSummary result={result} onReview={handleReview} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <ListeningTestLayout
      activePart={activePart}
      activeQuestionId={activeQuestionId}
      audioUrl={currentPart.audioUrl}
      answers={answers}
      isReview={isReview}
      onPartChange={(partNumber) => {
        setActivePart(partNumber);
        setActiveQuestionId(getFirstQuestionId(test, partNumber));
      }}
      onPrevPart={() => {
        const previousPart = Math.max(1, activePart - 1) as 1 | 2 | 3 | 4;

        setActivePart(previousPart);
        setActiveQuestionId(getFirstQuestionId(test, previousPart));
      }}
      onPrimaryAction={handlePrimaryAction}
      onQuestionSelect={(partNumber, questionId) => {
        setActivePart(partNumber);
        setActiveQuestionId(questionId);
        setPendingQuestionId(questionId);
      }}
      test={test}
      timeLeftSeconds={timeLeftSeconds}
    >
      <div className="mx-auto max-w-3xl">
        <PartPanel
          activeQuestionId={activeQuestionId}
          part={currentPart}
          answers={answers}
          onChange={handleChange}
          showAnswer={isReview}
        />
      </div>
    </ListeningTestLayout>
  );
}
