'use client';

import type { Answers } from '../types';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from '@/src/routes/hooks';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PracticePageState, PracticeCountdownOverlay } from '@/src/sections/practice/components';
import {
  startListeningSectionAttempt,
  submitListeningSectionAttempt,
} from '@/src/sections/practice/listening/api/listening-attempt-api';

import { ListeningTestView } from '../components/listening-test-view';
import { useListeningSectionDetailQuery } from '../hooks/use-listening-section-detail-query';
import { useListeningSectionResultQuery } from '../hooks/use-listening-section-result-query';

type ListeningDetailsViewProps = {
  sectionId: string;
};

export function ListeningDetailsView({ sectionId }: ListeningDetailsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const view = searchParams.get('view');
  const shouldRestoreResult = view === 'result';
  const { isAuthenticated, isHydrated } = useAuthSession();
  const canLoadListeningSection = isHydrated && isAuthenticated;
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null);
  const { data, error, isLoading } = useListeningSectionDetailQuery(
    sectionId,
    canLoadListeningSection
  );
  const {
    data: attemptResult,
    error: attemptResultError,
    isLoading: isAttemptResultLoading,
  } = useListeningSectionResultQuery(
    sectionId,
    attemptId,
    data,
    canLoadListeningSection && Boolean(data) && shouldRestoreResult
  );

  const startAttemptMutation = useMutation({
    mutationFn: startListeningSectionAttempt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: (answers: Answers) =>
      submitListeningSectionAttempt({
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
      router.replace(buildLoginHref(paths.practice.listening.details(sectionId)));
    }
  }, [isAuthenticated, isHydrated, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId || countdownValue === null) {
      return undefined;
    }

    if (countdownValue === 1) {
      const startTimer = window.setTimeout(() => {
        router.replace(
          `${paths.practice.listening.details(sectionId)}?attemptId=${encodeURIComponent(pendingAttemptId)}`
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

  const handleStartAttempt = async () => {
    await beginAttempt();
  };

  const handleRetryAttempt = async () => {
    await beginAttempt();
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
        <PracticePageState icon="spinner" label="Loading listening test..." />
        {countdownOverlay}
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to listening"
          description={error.message}
          label="We couldn't load this listening test."
          onAction={() => router.push(paths.practice.listening.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to listening"
          description="This listening practice could not be loaded."
          label="Listening test unavailable"
          onAction={() => router.push(paths.practice.listening.root)}
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
          onAction={startAttemptMutation.isPending ? undefined : handleStartAttempt}
        />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && isAttemptResultLoading) {
    return (
      <>
        <PracticePageState icon="spinner" label="Restoring your listening attempt..." />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && attemptResultError instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to listening"
          description={attemptResultError.message}
          label="We couldn't restore this listening attempt."
          onAction={() => router.push(paths.practice.listening.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  return (
    <>
      <ListeningTestView
        key={attemptId}
        attemptId={attemptId}
        initialResult={shouldRestoreResult ? attemptResult?.result : undefined}
        initialReviewTest={shouldRestoreResult ? attemptResult?.reviewTest : undefined}
        isRetrying={startAttemptMutation.isPending}
        onShowSubmittedResult={() => {
          if (!attemptId) {
            return;
          }

          window.history.replaceState(
            window.history.state,
            '',
            `${paths.practice.listening.details(sectionId)}?attemptId=${encodeURIComponent(attemptId)}&view=result`
          );
        }}
        onRetryAttempt={handleRetryAttempt}
        onSubmitAttempt={(answers) => submitAttemptMutation.mutateAsync(answers)}
        test={data}
        onBack={() => {
          router.push(paths.practice.listening.root);
        }}
      />
      {countdownOverlay}
    </>
  );
}
