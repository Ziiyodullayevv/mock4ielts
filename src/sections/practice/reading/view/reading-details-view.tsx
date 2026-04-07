'use client';

import type { Answers } from '../types';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PracticePageState,
  PracticeCountdownOverlay,
} from '@/src/sections/practice/components';
import {
  startReadingSectionAttempt,
  submitReadingSectionAttempt,
} from '@/src/sections/practice/reading/api/reading-attempt-api';

import { ReadingTestView } from '../components/reading-test-view';
import { useReadingSectionDetailQuery } from '../hooks/use-reading-section-detail-query';
import { useReadingSectionResultQuery } from '../hooks/use-reading-section-result-query';

type ReadingDetailsViewProps = {
  sectionId: string;
};

export function ReadingDetailsView({ sectionId }: ReadingDetailsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const view = searchParams.get('view');
  const shouldRestoreResult = view === 'result';
  const { isAuthenticated, isHydrated } = useAuthSession();
  const canLoadReadingSection = isHydrated && isAuthenticated;
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null);
  const { data, error, isLoading } = useReadingSectionDetailQuery(sectionId, canLoadReadingSection);
  const {
    data: attemptResult,
    error: attemptResultError,
    isLoading: isAttemptResultLoading,
  } = useReadingSectionResultQuery(
    sectionId,
    attemptId,
    data,
    canLoadReadingSection && Boolean(data) && shouldRestoreResult
  );

  const startAttemptMutation = useMutation({
    mutationFn: startReadingSectionAttempt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: (answers: Answers) =>
      submitReadingSectionAttempt({
        answers,
        attemptId: attemptId ?? '',
        sectionId,
        test: data!,
      }),
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(buildLoginHref(paths.practice.reading.details(sectionId)));
    }
  }, [isAuthenticated, isHydrated, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId || countdownValue === null) {
      return undefined;
    }

    if (countdownValue === 1) {
      const startTimer = window.setTimeout(() => {
        router.replace(
          `${paths.practice.reading.details(sectionId)}?attemptId=${encodeURIComponent(pendingAttemptId)}`
        );
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
  }, [countdownValue, pendingAttemptId, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId) {
      return undefined;
    }

    if (attemptId !== pendingAttemptId || shouldRestoreResult) {
      return undefined;
    }

    const clearOverlayTimer = window.setTimeout(() => {
      setPendingAttemptId(null);
      setCountdownValue(null);
    }, 0);

    return () => window.clearTimeout(clearOverlayTimer);
  }, [attemptId, pendingAttemptId, shouldRestoreResult]);

  const beginAttempt = async () => {
    if (startAttemptMutation.isPending) {
      return;
    }

    try {
      const response = await startAttemptMutation.mutateAsync(sectionId);
      setPendingAttemptId(response.attemptId);
      setCountdownValue(3);
    } catch {
      // handled by mutation state
    }
  };

  const countdownOverlay =
    countdownValue !== null ? <PracticeCountdownOverlay value={countdownValue} /> : null;

  if (!isHydrated) {
    return (
      <>
        <PracticePageState icon="spinner" label="Restoring session..." />
        {countdownOverlay}
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PracticePageState icon="spinner" label="Redirecting to login..." />
        {countdownOverlay}
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PracticePageState icon="spinner" label="Loading reading test..." />
        {countdownOverlay}
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to reading"
          description={error.message}
          label="We couldn't load this reading test."
          onAction={() => router.push(paths.practice.reading.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to reading"
          description="This reading practice could not be loaded."
          label="Reading test unavailable"
          onAction={() => router.push(paths.practice.reading.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!attemptId) {
    return (
      <>
        <PracticePageState
          actionLabel={startAttemptMutation.isPending ? 'Starting...' : 'Start Practice'}
          description={
            startAttemptMutation.error instanceof Error
              ? startAttemptMutation.error.message
              : data.description
          }
          icon="play"
          label={data.title}
          onAction={startAttemptMutation.isPending ? undefined : beginAttempt}
        />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && isAttemptResultLoading) {
    return (
      <>
        <PracticePageState icon="spinner" label="Restoring your reading attempt..." />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && attemptResultError instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to reading"
          description={attemptResultError.message}
          label="We couldn't restore this reading attempt."
          onAction={() => router.push(paths.practice.reading.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  return (
    <>
      <ReadingTestView
        key={attemptId}
        attemptId={attemptId}
        initialResult={shouldRestoreResult ? attemptResult?.result : undefined}
        initialReviewTest={shouldRestoreResult ? attemptResult?.reviewTest : undefined}
        isRetrying={startAttemptMutation.isPending}
        onBack={() => {
          router.push(paths.practice.reading.root);
        }}
        onRetryAttempt={beginAttempt}
        onShowSubmittedResult={() => {
          if (!attemptId) {
            return;
          }

          window.history.replaceState(
            window.history.state,
            '',
            `${paths.practice.reading.details(sectionId)}?attemptId=${encodeURIComponent(attemptId)}&view=result`
          );
        }}
        onSubmitAttempt={(answers) => submitAttemptMutation.mutateAsync(answers)}
        test={data}
      />
      {countdownOverlay}
    </>
  );
}
