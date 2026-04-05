'use client';

import type { Answers } from '../types';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { PlayCircle, LoaderCircle } from 'lucide-react';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    countdownValue !== null ? <ListeningCountdownOverlay value={countdownValue} /> : null;

  if (!isHydrated) {
    return (
      <>
        <ListeningPageState icon="spinner" label="Restoring session..." />
        {countdownOverlay}
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <ListeningPageState icon="spinner" label="Redirecting to login..." />
        {countdownOverlay}
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <ListeningPageState icon="spinner" label="Loading listening test..." />
        {countdownOverlay}
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <ListeningPageState
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
        <ListeningPageState
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
        <ListeningPageState
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
        <ListeningPageState icon="spinner" label="Restoring your listening attempt..." />
        {countdownOverlay}
      </>
    );
  }

  if (shouldRestoreResult && attemptResultError instanceof Error) {
    return (
      <>
        <ListeningPageState
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

type ListeningPageStateProps = {
  actionLabel?: string;
  description?: string;
  icon?: 'play' | 'spinner';
  label: string;
  onAction?: () => void;
};

function ListeningPageState({
  actionLabel,
  description,
  icon = 'spinner',
  label,
  onAction,
}: ListeningPageStateProps) {
  const isMinimalLoadingState = icon === 'spinner' && !actionLabel && !description;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 text-white">
      <div
        className={`flex max-w-xl flex-col items-center gap-4 text-center ${
          isMinimalLoadingState
            ? 'px-2 py-4'
            : 'rounded-3xl border border-white/10 bg-white/5 px-8 py-10'
        }`}
      >
        {icon === 'spinner' ? (
          <LoaderCircle className="size-8 animate-spin text-[#ff9f2f]" />
        ) : (
          <PlayCircle className="size-8 text-[#ff9f2f]" />
        )}
        <p className="text-lg font-semibold text-white">{label}</p>
        {description ? <p className="text-sm leading-7 text-white/68">{description}</p> : null}
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            disabled={!onAction}
            className="inline-flex h-11 items-center rounded-full bg-[#ff9f2f] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#ffab44] disabled:cursor-not-allowed disabled:bg-[#ff9f2f]/60"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ListeningCountdownOverlay({ value }: { value: number }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0a0a0a]/96 px-6 text-white backdrop-blur-md">
      <h2 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">{value}</h2>
    </div>
  );
}
