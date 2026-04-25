'use client';

import type { SpeakingTest } from '../types';

import { paths } from '@/src/routes/paths';
import { useRouter } from '@/src/routes/hooks';
import { SpeakingTestLayout } from '@/src/layouts/speaking';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PracticeConfirmDialog } from '@/src/sections/practice/components';

import { SpeakingPartStage } from './speaking-part-stage';
import { startSpeakingLiveSession } from '../api/speaking-session-api';
import { SpeakingResultDialog, type SpeakingGradingResult } from './speaking-result-dialog';

type ExitIntent = 'button' | 'browser-back';

type SpeakingTestViewProps = {
  attemptId: string;
  onExamComplete?: (grading: SpeakingGradingResult | null) => void;
  onExit?: () => void;
  showResultDialog?: boolean;
  test: SpeakingTest;
};

function buildInitialQuestionIndexes(test: SpeakingTest) {
  return Object.fromEntries(test.parts.map((part) => [part.partKey, 0]));
}

type AvatarSession = {
  room: string;
  token: string;
  url: string;
};

type SendDataRef = { current: ((data: object) => Promise<void>) | null };

const SHOULD_USE_LOCAL_TOKEN_ROUTE =
  process.env.NEXT_PUBLIC_SPEAKING_USE_LOCAL_TOKEN_ROUTE === 'true';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Could not load speaking avatar session.';

function extractExaminerName(test: SpeakingTest) {
  const openingScript = test.agentConfig.openingScript ?? '';
  const systemPrompt = test.agentConfig.systemPrompt ?? '';
  const normalizeName = (value: string) =>
    value
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

  const openingMatch = openingScript.match(
    /my name is\s+([a-z]+(?:\s+[a-z]+){0,2})(?=\s+and\b|[,.!?]|$)/i
  );
  if (openingMatch?.[1]) {
    return normalizeName(openingMatch[1]);
  }

  const promptMatch = systemPrompt.match(/named\s+([a-z]+(?:\s+[a-z]+){0,2})(?=[,.!?]|$)/i);
  if (promptMatch?.[1]) {
    return normalizeName(promptMatch[1]);
  }

  return 'James';
}

export function SpeakingTestView({
  attemptId,
  onExamComplete,
  onExit,
  showResultDialog = true,
  test,
}: SpeakingTestViewProps) {
  const router = useRouter();
  const [activePartKey, setActivePartKey] = useState<string | null>(test.parts[0]?.partKey ?? null);
  const [avatarSession, setAvatarSession] = useState<AvatarSession | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [exitIntent, setExitIntent] = useState<ExitIntent>('button');
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [questionIndexesByPart, setQuestionIndexesByPart] = useState<Record<string, number>>(() =>
    buildInitialQuestionIndexes(test)
  );
  const [completedPartKeys, setCompletedPartKeys] = useState<Set<string>>(() => new Set());
  const [, setQuestionTimerSeconds] = useState<number | null>(null);
  const [, setPrepTimerSeconds] = useState<number | null>(null);
  const [grading, setGrading] = useState<SpeakingGradingResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isAwaitingResult, setIsAwaitingResult] = useState(false);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendDataRef = useRef<((data: object) => Promise<void>) | null>(null) as SendDataRef;
  const activePart = test.parts.find((part) => part.partKey === activePartKey) ?? test.parts[0];
  const examinerName = extractExaminerName(test);
  const examinerRole = 'Exmintor';
  const activeQuestionIndex = activePart
    ? Math.min(
        questionIndexesByPart[activePart.partKey] ?? 0,
        Math.max(activePart.questions.length - 1, 0)
      )
    : 0;
  const activeQuestion = activePart?.questions[activeQuestionIndex] ?? null;
  const canAdvanceQuestion = Boolean(
    activePart && activeQuestionIndex < activePart.questions.length - 1
  );
  const isCurrentPartCompleted = Boolean(
    activePart &&
      activeQuestionIndex >= activePart.questions.length - 1
  );

  // Taymer intervallarini tozalash
  useEffect(() => {
    const activeQuestionTimer = questionTimerRef.current;
    const activePrepTimer = prepTimerRef.current;

    return () => {
      if (activeQuestionTimer) clearInterval(activeQuestionTimer);
      if (activePrepTimer) clearInterval(activePrepTimer);
    };
  }, []);

  const startCountdown = useCallback(
    (
      seconds: number,
      setter: (v: number | null) => void,
      intervalRef: { current: ReturnType<typeof setInterval> | null }
    ) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      let remaining = seconds;
      setter(remaining);
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setter(0);
        } else {
          setter(remaining);
        }
      }, 1000);
    },
    []
  );

  const handleExamEvent = useCallback(
    (event: Record<string, unknown>) => {
      switch (event.type) {
        case 'part_change': {
          const partNum = event.part as number;
          const newPartKey = test.parts[partNum - 1]?.partKey;
          if (newPartKey) {
            setActivePartKey(newPartKey);
            setQuestionTimerSeconds(null);
            setPrepTimerSeconds(null);
          }
          break;
        }
        case 'question_change': {
          const qIdx = event.question_idx as number;
          const pNum = event.part as number;
          const pKey = test.parts[pNum - 1]?.partKey;
          if (pKey) {
            setQuestionIndexesByPart((prev) => ({ ...prev, [pKey]: qIdx }));
            setQuestionTimerSeconds(null);
          }
          break;
        }
        case 'start_question_timer':
          startCountdown(
            event.duration_seconds as number,
            setQuestionTimerSeconds,
            questionTimerRef
          );
          break;
        case 'start_preparation_timer':
          startCountdown(
            event.duration_seconds as number,
            setPrepTimerSeconds,
            prepTimerRef
          );
          break;
        case 'hide_cue_card':
          setPrepTimerSeconds(null);
          setQuestionTimerSeconds(null);
          break;
        case 'exam_state': {
          if (event.state === 'closing') {
            setIsAwaitingResult(true);
            setIsResultOpen(true);
          }
          break;
        }
        case 'exam_complete': {
          const gradingPayload = (event.grading as SpeakingGradingResult | null) ?? null;
          setGrading(gradingPayload);
          setIsAwaitingResult(false);
          if (showResultDialog) {
            setIsResultOpen(true);
          }
          if (Array.isArray(test.parts)) {
            setCompletedPartKeys(new Set(test.parts.map((p) => p.partKey)));
          }
          void onExamComplete?.(gradingPayload);
          break;
        }
        default:
          break;
      }
    },
    [onExamComplete, showResultDialog, test.parts, startCountdown]
  );

  // Mark current part as completed when user reaches the last question
  useEffect(() => {
    if (activePart && isCurrentPartCompleted) {
      setCompletedPartKeys((prev) => {
        if (prev.has(activePart.partKey)) return prev;
        const next = new Set(prev);
        next.add(activePart.partKey);
        return next;
      });
    }
  }, [activePart, isCurrentPartCompleted]);

  useEffect(() => {
    setActivePartKey(test.parts[0]?.partKey ?? null);
    setQuestionIndexesByPart(buildInitialQuestionIndexes(test));
    setCompletedPartKeys(new Set());
  }, [test, test.parts]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadLocalAvatarSession = async () => {
      const response = await fetch(`/api/token?attemptId=${encodeURIComponent(attemptId)}`, {
        signal: abortController.signal,
      });
      const data = (await response.json()) as {
        error?: string;
        room?: string;
        token?: string;
        url?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not create local avatar session.');
      }

      if (!data.token || !data.url || !data.room) {
        throw new Error('Token route did not return full room credentials.');
      }

      return {
        room: data.room,
        token: data.token,
        url: data.url,
      } satisfies AvatarSession;
    };

    const shouldPreferLocalTokenRoute = SHOULD_USE_LOCAL_TOKEN_ROUTE;

    const loadAvatarSession = async () => {
      try {
        setIsAvatarLoading(true);
        setAvatarError(null);
        if (shouldPreferLocalTokenRoute) {
          try {
            setAvatarSession(await loadLocalAvatarSession());
            return;
          } catch (localError) {
            if (abortController.signal.aborted) {
              return;
            }

            try {
              const session = await startSpeakingLiveSession({ test });

              if (abortController.signal.aborted) {
                return;
              }

              setAvatarSession({
                room: session.roomName,
                token: session.token,
                url: session.url,
              });

              return;
            } catch (remoteError) {
              throw new Error(
                `Local LiveKit token route failed: ${getErrorMessage(localError)}. Backend start-session failed: ${getErrorMessage(remoteError)}.`
              );
            }
          }
        }

        const session = await startSpeakingLiveSession({ test });

        if (abortController.signal.aborted) {
          return;
        }

        setAvatarSession({
          room: session.roomName,
          token: session.token,
          url: session.url,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setAvatarSession(null);
        setAvatarError(getErrorMessage(error));
      } finally {
        if (!abortController.signal.aborted) {
          setIsAvatarLoading(false);
        }
      }
    };

    void loadAvatarSession();

    return () => {
      abortController.abort();
    };
  }, [attemptId, test]);

  const handlePartChange = (partKey: string) => {
    setActivePartKey(partKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextQuestion = () => {
    if (!activePart || !canAdvanceQuestion) {
      return;
    }

    setQuestionIndexesByPart((currentValue) => ({
      ...currentValue,
      [activePart.partKey]: Math.min(
        (currentValue[activePart.partKey] ?? 0) + 1,
        activePart.questions.length - 1
      ),
    }));

    // Agent ga ham keyingi savolga o'tishni xabar qil
    void sendDataRef.current?.({ type: 'next_question' });
  };

  const openExitDialog = (intent: ExitIntent) => {
    setExitIntent(intent);
    setIsExitDialogOpen(true);
  };

  return (
    <>
      <SpeakingTestLayout
        activePartKey={activePartKey}
        completedPartKeys={completedPartKeys}
        onExit={() => openExitDialog('button')}
        onPartChange={handlePartChange}
        test={test}
        timeLeftSeconds={Math.max(0, activePart.durationMinutes * 60)}
      >
        {activePart && activeQuestion ? (
          <SpeakingPartStage
            avatarError={avatarError}
            avatarRoomName={avatarSession?.room ?? null}
            avatarToken={avatarSession?.token ?? null}
            avatarUrl={avatarSession?.url ?? null}
            canAdvanceQuestion={canAdvanceQuestion}
            examinerName={examinerName}
            examinerRole={examinerRole}
            isAvatarLoading={isAvatarLoading}
            onDataMessage={handleExamEvent}
            onNextQuestion={handleNextQuestion}
            part={activePart}
            partNumber={test.parts.findIndex((part) => part.partKey === activePart.partKey) + 1}
            question={activeQuestion}
            sendDataRef={sendDataRef}
          />
        ) : null}
      </SpeakingTestLayout>

      <PracticeConfirmDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        title="Leave this test?"
        description="If you leave now, this speaking attempt will be closed and your progress in this session will not be saved."
        cancelLabel="Stay here"
        confirmLabel="Leave test"
        onConfirm={() => {
          if (onExit) {
            onExit();
            return;
          }

          if (exitIntent === 'browser-back') {
            router.push(paths.practice.speaking.root);
            return;
          }

          router.push(paths.practice.speaking.root);
        }}
      />

      <SpeakingResultDialog
        open={isResultOpen}
        grading={isAwaitingResult ? null : grading}
        onClose={() => {
          setIsResultOpen(false);
          if (onExit) {
            onExit();
            return;
          }
          router.push(paths.practice.speaking.root);
        }}
      />
    </>
  );
}
