'use client';

import type { SpeakingTest } from '../types';

import { cn } from '@/src/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { PRACTICE_FOOTER_CARD_RING_CLASS } from '@/src/layouts/practice-surface-theme';

import { startSpeakingLiveSession } from '../api/speaking-session-api';

type SpeakingSessionPanelProps = {
  attemptId: string;
  test: SpeakingTest;
};

export function SpeakingSessionPanel({ attemptId, test }: SpeakingSessionPanelProps) {
  const startSessionMutation = useMutation({
    mutationFn: () => startSpeakingLiveSession({ test }),
  });

  return (
    <aside className={cn('space-y-4 rounded-[24px] p-4 shadow-[0_4px_24px_rgba(15,23,42,0.05)] sm:p-5', PRACTICE_FOOTER_CARD_RING_CLASS)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#149174]">
          Live Session
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-stone-950">
          Session request
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
          {test.agentConfig.aiRole ?? 'IELTS Speaking Examiner'}
        </span>
        <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
          Attempt: {attemptId}
        </span>
        {test.agentConfig.aiVoice ? (
          <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
            Voice: {test.agentConfig.aiVoice}
          </span>
        ) : null}
        {test.agentConfig.aiModel ? (
          <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
            Model: {test.agentConfig.aiModel}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => startSessionMutation.mutate()}
        disabled={startSessionMutation.isPending}
        className="inline-flex h-10 items-center rounded-xl bg-linear-to-r from-[#58d790] to-[#149174] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(20,145,116,0.22)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {startSessionMutation.isPending ? 'Creating session...' : 'Create live session'}
      </button>

      <p className="text-sm leading-6 text-stone-600">
        Backend `POST /speaking/start-session` ga faqat `section_id` bilan request yuboriladi.
      </p>

      {startSessionMutation.error instanceof Error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          {startSessionMutation.error.message}
        </div>
      ) : null}

      {startSessionMutation.data ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          <p className="font-semibold text-emerald-900">Session ready</p>
          <p className="mt-2 break-all text-emerald-800/80">Room: {startSessionMutation.data.roomName}</p>
          <p className="break-all text-emerald-800/80">URL: {startSessionMutation.data.url}</p>
        </div>
      ) : null}
    </aside>
  );
}
