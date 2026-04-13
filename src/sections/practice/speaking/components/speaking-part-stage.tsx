'use client';

import type { SpeakingPart, SpeakingQuestion } from '../types';

import Image from 'next/image';
import { cn } from '@/src/lib/utils';
import { getAssetUrl } from '@/src/global-config';
import { Mic, AlertCircle, ChevronRight } from 'lucide-react';

import { SpeakingAvatarRoom } from './speaking-avatar-room';

const SPEAKING_STAGE_POSTER_URL = getAssetUrl('/assets/home/carusel/posters/speaking-1.png');

type SpeakingPartStageProps = {
  avatarError?: string | null;
  avatarRoomName?: string | null;
  avatarToken?: string | null;
  avatarUrl?: string | null;
  canAdvanceQuestion: boolean;
  isAvatarLoading?: boolean;
  onNextQuestion: () => void;
  part: SpeakingPart;
  partNumber: number;
  question: SpeakingQuestion;
};

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getDisplayQuestionText(question: SpeakingQuestion) {
  return question.text;
}

function getDisplayPartTitle(part: SpeakingPart) {
  return part.title.replace(/^part\s*\d+\s*:?\s*/i, '').trim();
}

function getStageTimerLabel(part: SpeakingPart, question: SpeakingQuestion) {
  if (part.partKey === 'part2' && question.metadata.preparationSeconds) {
    return '00:00';
  }

  return formatSeconds(
    question.metadata.suggestedTimeSeconds ??
      question.metadata.speakingMinSeconds ??
      question.metadata.speakingMaxSeconds ??
      0
  );
}

function getPartActionLabel(
  part: SpeakingPart,
  question: SpeakingQuestion,
  canAdvanceQuestion: boolean
) {
  if (part.partKey === 'part2' && question.metadata.preparationSeconds) {
    return `Time to think ${question.metadata.preparationSeconds}s`;
  }

  return canAdvanceQuestion ? 'Next' : 'Completed';
}

function isPartTwo(part: SpeakingPart) {
  return part.partKey.toLowerCase() === 'part2';
}

export function SpeakingPartStage({
  avatarError,
  avatarRoomName,
  avatarToken,
  avatarUrl,
  canAdvanceQuestion,
  isAvatarLoading = false,
  onNextQuestion,
  part,
  partNumber,
  question,
}: SpeakingPartStageProps) {
  const questionText = getDisplayQuestionText(question);
  const partTitle = getDisplayPartTitle(part);
  const partTwo = isPartTwo(part);
  const cueCardPoints =
    question.metadata.cueCardDisplay?.points.length
      ? question.metadata.cueCardDisplay.points
      : question.metadata.bulletPoints;
  const cleanedCueCardPoints = cueCardPoints
    .map((point) => point.replace(/^[-•]\s*/, '').trim())
    .filter((point) => point.length && !/^you should say:?$/i.test(point));
  const cueCardTitle = question.metadata.cueCardDisplay?.title ?? questionText;
  const stageTimerLabel = getStageTimerLabel(part, question);
  const actionLabel = getPartActionLabel(part, question, canAdvanceQuestion);
  const isActionDisabled = partTwo || !canAdvanceQuestion;
  const showActionButton = partTwo || canAdvanceQuestion;

  return (
    <section className="space-y-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xl font-semibold uppercase tracking-[-0.03em] text-[#2c466e] sm:text-3xl">
          Part {partNumber}
        </p>

        {!partTwo && partTitle ? (
          <p className="mt-1 text-sm text-stone-500 sm:text-base">{partTitle}</p>
        ) : null}

        {!partTwo ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
            {questionText}
          </p>
        ) : null}
      </div>

      {partTwo ? (
        <div className="mx-auto grid max-w-5xl items-start gap-5 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-6">
          <SpeakingStagePoster
            avatarError={avatarError}
            avatarRoomName={avatarRoomName}
            avatarToken={avatarToken}
            avatarUrl={avatarUrl}
            isAvatarLoading={isAvatarLoading}
          />

          <div className="rounded-[24px] border border-stone-200 bg-white p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.06)] sm:p-6">
            <h2 className="text-xl font-semibold leading-8 tracking-[-0.02em] text-[#2c466e] sm:text-[1.7rem] sm:leading-10">
              {cueCardTitle}
            </h2>

            <div className="mt-4 space-y-3">
              {cleanedCueCardPoints.length ? (
                cleanedCueCardPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-xl bg-stone-50 px-4 py-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    <p className="text-sm leading-7 text-stone-700 sm:text-base">{point}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-stone-700 sm:text-base">{questionText}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <SpeakingStagePoster
          avatarError={avatarError}
          avatarRoomName={avatarRoomName}
          avatarToken={avatarToken}
          avatarUrl={avatarUrl}
          isAvatarLoading={isAvatarLoading}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <div className="relative px-4 pt-3">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-rose-200" />

          <div className="relative flex justify-center">
            <div className="grid size-[72px] place-items-center rounded-full bg-white text-rose-500 shadow-[0_16px_30px_rgba(15,23,42,0.12)] ring-4 ring-white">
              <Mic className="size-7" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-2xl font-semibold tracking-[-0.03em] text-rose-500 sm:text-3xl">
          {stageTimerLabel}
        </div>

        {showActionButton ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onNextQuestion}
              disabled={isActionDisabled}
              className={cn(
                'inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-semibold transition-colors',
                isActionDisabled
                  ? 'cursor-not-allowed bg-rose-100 text-rose-300'
                  : 'bg-linear-to-r from-[#d36a84] to-[#ab4e68] text-white shadow-[0_14px_28px_rgba(171,78,104,0.18)] hover:opacity-95'
              )}
            >
              <span>{actionLabel}</span>
              {!isActionDisabled ? <ChevronRight className="size-4.5" strokeWidth={2.2} /> : null}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SpeakingStagePoster({
  avatarError,
  avatarRoomName,
  avatarToken,
  avatarUrl,
  isAvatarLoading = false,
}: {
  avatarError?: string | null;
  avatarRoomName?: string | null;
  avatarToken?: string | null;
  avatarUrl?: string | null;
  isAvatarLoading?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
        <div className="relative aspect-[1.77/1]">
          {avatarToken && avatarUrl ? (
            <SpeakingAvatarRoom token={avatarToken} url={avatarUrl} />
          ) : avatarError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-6 text-center">
              <AlertCircle className="size-8 text-rose-400" strokeWidth={2} />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-800">Avatar session failed</p>
                <p className="text-xs text-stone-500">{avatarError}</p>
                {avatarRoomName ? (
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">
                    Room: {avatarRoomName}
                  </p>
                ) : null}
              </div>
            </div>
          ) : isAvatarLoading ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
              <Image
                fill
                priority
                alt="Speaking examiner stage"
                className="object-cover opacity-20 blur-[1px]"
                sizes="(max-width: 1280px) 100vw, 560px"
                src={SPEAKING_STAGE_POSTER_URL}
              />
            </div>
          ) : (
            <Image
              fill
              priority
              alt="Speaking examiner stage"
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 560px"
              src={SPEAKING_STAGE_POSTER_URL}
            />
          )}
        </div>
      </div>
    </div>
  );
}
