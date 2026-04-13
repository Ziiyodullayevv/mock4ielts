'use client';

import type { SpeakingTest } from '../types';

import { useState, useEffect } from 'react';
import { SpeakingTestLayout } from '@/src/layouts/speaking';

import { SpeakingPartStage } from './speaking-part-stage';
import { startSpeakingLiveSession } from '../api/speaking-session-api';

type SpeakingTestViewProps = {
  attemptId: string;
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

const SHOULD_USE_LOCAL_TOKEN_ROUTE =
  process.env.NEXT_PUBLIC_SPEAKING_USE_LOCAL_TOKEN_ROUTE === 'true';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Could not load speaking avatar session.';

export function SpeakingTestView({ attemptId, test }: SpeakingTestViewProps) {
  const [activePartKey, setActivePartKey] = useState<string | null>(test.parts[0]?.partKey ?? null);
  const [avatarSession, setAvatarSession] = useState<AvatarSession | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [questionIndexesByPart, setQuestionIndexesByPart] = useState<Record<string, number>>(() =>
    buildInitialQuestionIndexes(test)
  );
  const activePart = test.parts.find((part) => part.partKey === activePartKey) ?? test.parts[0];
  const activePartIndex = test.parts.findIndex((part) => part.partKey === activePart.partKey);
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

  useEffect(() => {
    setActivePartKey(test.parts[0]?.partKey ?? null);
    setQuestionIndexesByPart(buildInitialQuestionIndexes(test));
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

    const shouldTryLocalFallback =
      SHOULD_USE_LOCAL_TOKEN_ROUTE ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost');

    const loadAvatarSession = async () => {
      try {
        setIsAvatarLoading(true);
        setAvatarError(null);
        if (SHOULD_USE_LOCAL_TOKEN_ROUTE) {
          setAvatarSession(await loadLocalAvatarSession());

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
          if (!shouldTryLocalFallback || abortController.signal.aborted) {
            throw remoteError;
          }

          try {
            setAvatarSession(await loadLocalAvatarSession());
            return;
          } catch (localError) {
            throw new Error(
              `Backend start-session failed: ${getErrorMessage(remoteError)}. Local fallback failed: ${getErrorMessage(localError)}.`
            );
          }
        }
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

  const handlePrevPart = () => {
    if (activePartIndex <= 0) {
      return;
    }

    const previousPart = test.parts[activePartIndex - 1];

    if (!previousPart) {
      return;
    }

    handlePartChange(previousPart.partKey);
  };

  const handleNextPart = () => {
    if (activePartIndex >= test.parts.length - 1) {
      return;
    }

    const nextPart = test.parts[activePartIndex + 1];

    if (!nextPart) {
      return;
    }

    handlePartChange(nextPart.partKey);
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
  };

  return (
    <SpeakingTestLayout
      activePartKey={activePartKey}
      isPrimaryActionDisabled={activePartIndex >= test.parts.length - 1}
      isPrevDisabled={activePartIndex <= 0}
      onPartChange={handlePartChange}
      onPrevPart={handlePrevPart}
      onPrimaryAction={handleNextPart}
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
          isAvatarLoading={isAvatarLoading}
          onNextQuestion={handleNextQuestion}
          part={activePart}
          partNumber={test.parts.findIndex((part) => part.partKey === activePart.partKey) + 1}
          question={activeQuestion}
        />
      ) : null}
    </SpeakingTestLayout>
  );
}
