'use client';

import type { WritingAnswers } from '../types';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from '@/src/routes/hooks';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PracticePageState,
  PracticeCountdownOverlay,
} from '@/src/sections/practice/components';
import {
  startWritingSectionAttempt,
  submitWritingSectionAttempt,
} from '@/src/sections/practice/writing/api/writing-attempt-api';

import { WritingTestView } from '../components/writing-test-view';
import { useWritingSectionDetailQuery } from '../hooks/use-writing-section-detail-query';
import { useWritingSectionResultQuery } from '../hooks/use-writing-section-result-query';

type WritingDetailsViewProps = {
  sectionId: string;
};

export function WritingDetailsView({ sectionId }: WritingDetailsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const view = searchParams.get('view');
  const shouldRestoreResult = view === 'result';
  const { isAuthenticated, isHydrated } = useAuthSession();
  const canLoad = isHydrated && isAuthenticated;
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null);

  const { data, error, isLoading } = useWritingSectionDetailQuery(sectionId, canLoad);
  const {
    data: attemptResult,
    error: attemptResultError,
    isLoading: isAttemptResultLoading,
  } = useWritingSectionResultQuery(
    sectionId,
    attemptId,
    canLoad && shouldRestoreResult
  );

  const startAttemptMutation = useMutation({
    mutationFn: startWritingSectionAttempt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: (answers: WritingAnswers) =>
      submitWritingSectionAttempt({
        answers,
        attemptId: attemptId ?? '',
        sectionId,
        test: data!,
      }),
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(buildLoginHref(paths.practice.writing.details(sectionId)));
    }
  }, [isAuthenticated, isHydrated, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId || countdownValue === null) return undefined;

    if (countdownValue === 1) {
      const startTimer = window.setTimeout(() => {
        router.replace(
          `${paths.practice.writing.details(sectionId)}?attemptId=${encodeURIComponent(pendingAttemptId)}`
        );
      }, 1000);
      return () => window.clearTimeout(startTimer);
    }

    const timer = window.setTimeout(() => {
      setCountdownValue((v) => (typeof v === 'number' ? Math.max(1, v - 1) : v));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdownValue, pendingAttemptId, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId) return undefined;
    if (attemptId !== pendingAttemptId || shouldRestoreResult) return undefined;

    const t = window.setTimeout(() => {
      setPendingAttemptId(null);
      setCountdownValue(null);
    }, 0);
    return () => window.clearTimeout(t);
  }, [attemptId, pendingAttemptId, shouldRestoreResult]);

  const beginAttempt = async () => {
    if (startAttemptMutation.isPending) return;
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
        <PracticePageState icon="spinner" label="Loading writing test..." />
        {countdownOverlay}
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to writing"
          description={error.message}
          label="We couldn't load this writing test."
          onAction={() => router.push(paths.practice.writing.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to writing"
          description="This writing practice could not be loaded."
          label="Writing test unavailable"
          onAction={() => router.push(paths.practice.writing.root)}
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
        <PracticePageState icon="spinner" label="Restoring your writing attempt..." />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && attemptResultError instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to writing"
          description={attemptResultError.message}
          label="We couldn't restore this writing attempt."
          onAction={() => router.push(paths.practice.writing.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  return (
    <>
      <WritingTestView
        key={attemptId}
        attemptId={attemptId}
        initialResult={shouldRestoreResult ? attemptResult?.result : undefined}
        isRetrying={startAttemptMutation.isPending}
        onBack={() => router.push(paths.practice.writing.root)}
        onRetryAttempt={beginAttempt}
        onShowSubmittedResult={() => {
          if (!attemptId) return;
          window.history.replaceState(
            window.history.state,
            '',
            `${paths.practice.writing.details(sectionId)}?attemptId=${encodeURIComponent(attemptId)}&view=result`
          );
        }}
        onSubmitAttempt={(answers) => submitAttemptMutation.mutateAsync(answers)}
        test={data}
      />
      {countdownOverlay}
    </>
  );
}
