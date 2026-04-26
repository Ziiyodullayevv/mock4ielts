'use client';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useRouter, useSearchParams } from '@/src/routes/hooks';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import {
  PracticePageState,
  PracticeCountdownOverlay,
} from '@/src/sections/practice/components';

import { SpeakingTestView } from '../components/speaking-test-view';
import { SpeakingPreflightCheck } from '../components/speaking-preflight-check';
import { useSpeakingSectionDetailQuery } from '../hooks/use-speaking-section-detail-query';

type SpeakingDetailsViewProps = {
  sectionId: string;
};

export function SpeakingDetailsView({ sectionId }: SpeakingDetailsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const { isAuthenticated, isHydrated } = useAuthSession();
  const canLoad = isHydrated && isAuthenticated;
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null);

  const { data, error, isLoading } = useSpeakingSectionDetailQuery(sectionId, canLoad);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(buildLoginHref(paths.practice.speaking.details(sectionId)));
    }
  }, [isAuthenticated, isHydrated, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId || countdownValue === null) {
      return undefined;
    }

    if (countdownValue === 1) {
      const startTimer = window.setTimeout(() => {
        router.replace(
          `${paths.practice.speaking.details(sectionId)}?attemptId=${encodeURIComponent(pendingAttemptId)}`
        );
      }, 1000);

      return () => window.clearTimeout(startTimer);
    }

    const timer = window.setTimeout(() => {
      setCountdownValue((value) => (typeof value === 'number' ? Math.max(1, value - 1) : value));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdownValue, pendingAttemptId, router, sectionId]);

  useEffect(() => {
    if (!pendingAttemptId || attemptId !== pendingAttemptId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPendingAttemptId(null);
      setCountdownValue(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [attemptId, pendingAttemptId]);

  const beginAttempt = async () => {
    // LOCAL TEST MODE — backend o'rniga local attemptId
    const localAttemptId = `local-test-${Date.now()}`;
    setPendingAttemptId(localAttemptId);
    setCountdownValue(3);
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
        <PracticePageState icon="spinner" label="Loading speaking test..." />
        {countdownOverlay}
      </>
    );
  }

  if (error instanceof Error) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to speaking"
          description={error.message}
          label="We couldn't load this speaking test."
          onAction={() => router.push(paths.practice.speaking.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PracticePageState
          actionLabel="Back to speaking"
          description="This speaking practice could not be loaded."
          label="Speaking test unavailable"
          onAction={() => router.push(paths.practice.speaking.root)}
        />
        {countdownOverlay}
      </>
    );
  }

  if (!attemptId) {
    return (
      <>
        <SpeakingPreflightCheck
          isStarting={false}
          onBack={() => router.push(paths.practice.speaking.root)}
          onContinue={beginAttempt}
          startError={null}
        />
        {countdownOverlay}
      </>
    );
  }

  return (
    <>
      <SpeakingTestView attemptId={attemptId} test={data} />
      {countdownOverlay}
    </>
  );
}
