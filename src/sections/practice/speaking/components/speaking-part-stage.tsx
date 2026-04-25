'use client';

import type { SpeakingPart, SpeakingQuestion } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useState, useEffect, useCallback } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Squircle } from '@/src/components/squircle/squircle';

import { PRACTICE_FOOTER_CARD_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import { PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';
import { Persona } from '@/src/components/ai-elements/persona';

import { SpeakingAvatarRoom } from './speaking-avatar-room';

const SPEAKING_EXAMINER_PHOTO_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D';
const MIC_BAND_COUNT = 11;

type SendDataRef = { current: ((data: object) => Promise<void>) | null };

type SpeakingPartStageProps = {
  avatarError?: string | null;
  avatarRoomName?: string | null;
  avatarToken?: string | null;
  avatarUrl?: string | null;
  canAdvanceQuestion: boolean;
  examinerName: string;
  examinerRole: string;
  isAvatarLoading?: boolean;
  onDataMessage?: (event: Record<string, unknown>) => void;
  onNextQuestion: () => void;
  part: SpeakingPart;
  partNumber: number;
  question: SpeakingQuestion;
  sendDataRef?: SendDataRef;
};

// ---------------------------------------------------------------------------
// Waveform bars + Orb in one component — bars left/right, orb in center.
// No z-index layering needed: DOM order keeps them side by side.
// ---------------------------------------------------------------------------
const WAVEFORM_BAR_COUNT = 11; // must be odd so center slot goes to orb (5+orb+5)
const WAVEFORM_H = 22;         // max bar height in px
const WAVEFORM_W = 5;          // bar width in px; idle bar = 5×5 circle

function VoiceWaveformWithOrb({ active = true }: { active?: boolean }) {
  const rawRef = useRef<number[]>(Array(MIC_BAND_COUNT).fill(0));
  const barSmoothRef = useRef<number[]>(Array(WAVEFORM_BAR_COUNT).fill(0));
  const activeRef = useRef(active);
  const [levels, setLevels] = useState<number[]>(() => Array(WAVEFORM_BAR_COUNT).fill(0));

  useEffect(() => { activeRef.current = active; }, [active]);

  const handleSpectrum = useCallback((bands: number[]) => { rawRef.current = bands; }, []);
  useDirectMicrophoneSpectrum(handleSpectrum);

  useEffect(() => {
    let frameId: number;
    let prevLevels = Array(WAVEFORM_BAR_COUNT).fill(0) as number[];

    const tick = () => {
      const raw = rawRef.current;
      const t = performance.now() / 1000;

      const peak = raw.reduce((p, b) => Math.max(p, b), 0);
      const avg  = raw.reduce((s, b) => s + b, 0) / Math.max(raw.length, 1);
      const rawAudio = Math.min(1, avg * 5.2 + peak * 1.8);
      // When agent is speaking (active=false) force silence → bars decay to idle
      const activeAudio = !activeRef.current ? 0 : Math.pow(rawAudio, 2.2) < 0.04 ? 0 : Math.pow(rawAudio, 2.2);

      // Waveform bars
      let changed = false;
      const nextLevels = barSmoothRef.current.map((cur, i) => {
        const distFromCenter = Math.abs(i - (WAVEFORM_BAR_COUNT - 1) / 2);
        const normDist = distFromCenter / ((WAVEFORM_BAR_COUNT - 1) / 2);
        const unitWave = (Math.sin(t * 7 - distFromCenter * 0.95) + 1) / 2;
        const target = activeAudio * (0.08 + 0.92 * unitWave);
        const alpha = target > cur ? 0.30 : 0.22 + normDist * 0.06;
        const val = cur + (target - cur) * alpha;
        if (Math.abs(val - (prevLevels[i] ?? 0)) > 0.003) changed = true;
        return val;
      });
      barSmoothRef.current = nextLevels;
      if (changed) { prevLevels = nextLevels; setLevels([...nextLevels]); }

      // Orb smooth level — slow rise/decay for fluid feel

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const sideCount   = Math.floor(WAVEFORM_BAR_COUNT / 2); // 5
  const leftLevels  = levels.slice(0, sideCount);
  const rightLevels = levels.slice(sideCount + 1, sideCount + 1 + sideCount);

  const renderBar = (level: number, i: number) => (
    <div
      key={i}
      className="shrink-0 rounded-full bg-stone-500 dark:bg-stone-400"
      style={{
        height: WAVEFORM_W + level * (WAVEFORM_H - WAVEFORM_W),
        opacity: 0.45 + level * 0.50,
        width: WAVEFORM_W,
      }}
    />
  );

  return (
    <div className="flex items-center justify-center gap-[8px]" style={{ height: 100 }}>
      {leftLevels.map(renderBar)}
      <MicOrb active={active} />
      {rightLevels.map(renderBar)}
    </div>
  );
}

// AI persona orb — Rive-powered animated persona
function MicOrb({ active }: { active: boolean }) {
  return (
    <div className="relative size-19 shrink-0 overflow-hidden rounded-full">
      <Persona
        variant="mana"
        state={active ? 'listening' : 'speaking'}
        className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function getDisplayQuestionText(question: SpeakingQuestion) {
  return question.text;
}

function getDisplayPartTitle(part: SpeakingPart) {
  return part.title.replace(/^part\s*\d+\s*:?\s*/i, '').trim();
}

function getPartActionLabel(
  part: SpeakingPart,
  question: SpeakingQuestion,
  canAdvanceQuestion: boolean
) {
  if (part.partKey === 'part2' && question.metadata.preparationSeconds) {
    return `Time to think ${question.metadata.preparationSeconds}s`;
  }

  return canAdvanceQuestion ? 'Next question' : 'Completed';
}

function isPartTwo(part: SpeakingPart) {
  return part.partKey.toLowerCase() === 'part2';
}

function createSilentVoiceSpectrum() {
  return Array.from({ length: MIC_BAND_COUNT }, () => 0);
}

/**
 * Directly captures browser microphone and emits a normalised spectrum array.
 * Works independently of LiveKit — persona always reacts to the user's voice.
 */
function useDirectMicrophoneSpectrum(onSpectrum: (bands: number[]) => void) {
  const callbackRef = useRef(onSpectrum);
  useEffect(() => {
    callbackRef.current = onSpectrum;
  });

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let frameId: number | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioCtxClass = (
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        ) as typeof AudioContext;

        audioCtx = new AudioCtxClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.76;
        audioCtx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const bucketSize = data.length / MIC_BAND_COUNT;

        const tick = () => {
          if (!active) return;
          analyser.getByteFrequencyData(data);
          const spectrum = Array.from({ length: MIC_BAND_COUNT }, (_, i) => {
            const s = Math.floor(i * bucketSize);
            const e = Math.max(s + 1, Math.floor((i + 1) * bucketSize));
            let sum = 0;
            for (let j = s; j < e; j += 1) sum += data[j] ?? 0;
            return Math.min(1, Math.pow(sum / Math.max(e - s, 1) / 255, 0.8));
          });
          callbackRef.current(spectrum);
          frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      } catch {
        // Mic permission denied or unavailable — persona stays in idle state
      }
    };

    void start();

    return () => {
      active = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((t) => t.stop());
      void audioCtx?.close().catch(() => {});
    };
  }, []); // runs once on mount — no deps needed
}

export function SpeakingPartStage({
  avatarError,
  avatarRoomName,
  avatarToken,
  avatarUrl,
  canAdvanceQuestion,
  examinerName,
  examinerRole,
  isAvatarLoading = false,
  onDataMessage,
  onNextQuestion,
  part,
  partNumber,
  question,
  sendDataRef,
}: SpeakingPartStageProps) {
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
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
  const actionLabel = getPartActionLabel(part, question, canAdvanceQuestion);
  const isActionDisabled = partTwo || !canAdvanceQuestion;
  const showActionButton = partTwo || canAdvanceQuestion;

  return (
    <section className="space-y-6">
      {!partTwo && partTitle ? (
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-stone-500 sm:text-base">{partTitle}</p>
        </div>
      ) : null}

      {partTwo ? (
        <div className="mx-auto grid max-w-5xl items-start gap-5 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-6">
          <SpeakingStagePoster
            avatarError={avatarError}
            avatarRoomName={avatarRoomName}
            avatarToken={avatarToken}
            avatarUrl={avatarUrl}
            examinerName={examinerName}
            examinerRole={examinerRole}
            isAvatarLoading={isAvatarLoading}
            onDataMessage={onDataMessage}
            onExaminerSpeakingChange={setIsExaminerSpeaking}
            sendDataRef={sendDataRef}
          />

          <div className={cn('rounded-[24px] p-5 text-left shadow-[0_4px_24px_rgba(15,23,42,0.05)] sm:p-6', PRACTICE_FOOTER_CARD_RING_CLASS)}>
            <h2 className="text-xl font-semibold leading-8 tracking-[-0.02em] text-[#2c466e] sm:text-[1.7rem] sm:leading-10">
              {cueCardTitle}
            </h2>

            <div className="mt-4 space-y-3">
              {cleanedCueCardPoints.length ? (
                cleanedCueCardPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-xl bg-stone-50 px-4 py-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ff9f2f]" />
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
          examinerName={examinerName}
          examinerRole={examinerRole}
          isAvatarLoading={isAvatarLoading}
          onDataMessage={onDataMessage}
          sendDataRef={sendDataRef}
        />
      )}

      <div className="mx-auto max-w-3xl space-y-4">
        <VoiceWaveformWithOrb active={!isExaminerSpeaking} />

        {/* Orange button at the bottom */}
        {showActionButton ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onNextQuestion}
              disabled={isActionDisabled}
              className={cn(
                'inline-flex h-11 items-center gap-1 rounded-full px-5 text-sm font-semibold transition-colors',
                isActionDisabled
                  ? 'cursor-not-allowed bg-[#ffe8bf] text-[#d19a37]'
                  : cn(
                      'shadow-[0_14px_28px_rgba(255,120,75,0.20)] hover:opacity-95',
                      PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS
                    )
              )}
            >
              <span>{actionLabel}</span>
              {!isActionDisabled ? <ChevronRight className="size-4" strokeWidth={2.2} /> : null}
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
  examinerName,
  examinerRole,
  isAvatarLoading = false,
  onDataMessage,
  onExaminerSpeakingChange,
  sendDataRef,
}: {
  avatarError?: string | null;
  avatarRoomName?: string | null;
  avatarToken?: string | null;
  avatarUrl?: string | null;
  examinerName: string;
  examinerRole: string;
  isAvatarLoading?: boolean;
  onDataMessage?: (event: Record<string, unknown>) => void;
  onExaminerSpeakingChange?: (isSpeaking: boolean) => void;
  sendDataRef?: SendDataRef;
}) {
  const [examinerAudioSpectrum, setExaminerAudioSpectrum] = useState<number[]>(() =>
    createSilentVoiceSpectrum()
  );
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const examinerStatusTimeoutRef = useRef<number | null>(null);

  const handleExaminerAudioSpectrumChange = (nextSpectrum: number[]) => {
    setExaminerAudioSpectrum(nextSpectrum);

    const hasSpeech = nextSpectrum.some((band) => band > 0.12);

    if (examinerStatusTimeoutRef.current) {
      window.clearTimeout(examinerStatusTimeoutRef.current);
      examinerStatusTimeoutRef.current = null;
    }

    if (hasSpeech) {
      setIsExaminerSpeaking(true);
      onExaminerSpeakingChange?.(true);
      return;
    }

    examinerStatusTimeoutRef.current = window.setTimeout(() => {
      setIsExaminerSpeaking(false);
      onExaminerSpeakingChange?.(false);
      examinerStatusTimeoutRef.current = null;
    }, 520);
  };

  useEffect(
    () => () => {
      if (examinerStatusTimeoutRef.current) {
        window.clearTimeout(examinerStatusTimeoutRef.current);
      }
    },
    []
  );

  const examinerStatusLabel =
    !avatarToken || !avatarUrl || isAvatarLoading
      ? 'Live'
      : isExaminerSpeaking
        ? 'Speaking...'
        : 'Listening...';

  return (
    <div className="relative mx-auto w-[360px] max-w-full">
      <PaperSurface
        n={4}
        radius={48}
        className="relative z-10 p-2 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:shadow-none"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-[-20%] animate-[spin_18s_linear_infinite] opacity-85">
            <div className="absolute left-[-6%] top-[10%] h-36 w-36 rounded-full bg-[#ff9b42]/68 blur-3xl" />
            <div className="absolute right-[4%] top-[2%] h-32 w-32 rounded-full bg-[#ff5a3d]/52 blur-3xl" />
            <div className="absolute bottom-[-4%] left-[28%] h-44 w-44 rounded-full bg-[#ff2e63]/40 blur-3xl" />
          </div>
          <div className="absolute inset-[-24%] opacity-80 [animation-direction:reverse] animate-[spin_24s_linear_infinite]">
            <div className="absolute right-[-2%] bottom-[12%] h-40 w-40 rounded-full bg-[#ff8748]/42 blur-3xl" />
            <div className="absolute left-[16%] top-[24%] h-28 w-28 rounded-full bg-[#ff4b68]/36 blur-3xl" />
          </div>
        </div>
        <Squircle
          n={4}
          radius={44}
          className="relative isolate aspect-square overflow-hidden bg-[#141414]"
        >
          <div
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url("${SPEAKING_EXAMINER_PHOTO_URL}")`,
              backgroundPosition: 'center 18%',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,155,66,0.22),transparent_24%),radial-gradient(circle_at_84%_10%,rgba(255,90,61,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,46,99,0.18),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.08)_0%,rgba(8,8,8,0.18)_36%,rgba(8,8,8,0.06)_62%,rgba(8,8,8,0.24)_100%)]" />

          {avatarToken && avatarUrl ? (
            <div className="absolute inset-0 z-[1]">
              <SpeakingAvatarRoom
                onAudioSpectrumChange={handleExaminerAudioSpectrumChange}
                onMicrophoneSpectrumChange={() => {}}
                onDataMessage={onDataMessage}
                sendDataRef={sendDataRef}
                token={avatarToken}
                url={avatarUrl}
              />
            </div>
          ) : avatarError ? (
            <div className="absolute inset-x-4 bottom-5 z-20 rounded-2xl border border-white/18 bg-black/20 px-4 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-[#ffd37a]" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Avatar session failed</p>
                  <p className="mt-1 text-xs leading-5 text-white/78">{avatarError}</p>
                  {avatarRoomName ? (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/58">
                      Room: {avatarRoomName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : isAvatarLoading ? (
            <div className="absolute inset-0 bg-white/6 backdrop-blur-[2px]" />
          ) : null}

          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 text-white">
              <p className="truncate text-[1.12rem] font-medium leading-none tracking-[-0.035em] text-shadow-sm">
                {examinerName}
              </p>
              <p className="mt-0.5 truncate text-[0.82rem] leading-none text-white/82 text-shadow-sm">
                {examinerRole}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 pt-0.5 text-white">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.72)]" />
              <span className="text-sm font-medium tracking-[-0.03em] text-shadow-sm">
                {examinerStatusLabel}
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 overflow-hidden rounded-b-3xl">
            <div className="absolute inset-x-6 bottom-1 h-10 rounded-full bg-black/18 blur-2xl" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,20,24,0)_0%,rgba(17,20,24,0.05)_28%,rgba(17,20,24,0.16)_58%,rgba(17,20,24,0.60)_100%)] dark:bg-[linear-gradient(180deg,rgba(17,18,20,0)_0%,rgba(17,18,20,0.06)_28%,rgba(17,18,20,0.18)_58%,rgba(17,18,20,0.68)_100%)]" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(270deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_100%)]" />
        </Squircle>
      </PaperSurface>
    </div>
  );
}


