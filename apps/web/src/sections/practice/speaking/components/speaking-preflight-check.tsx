'use client';

import { cn } from '@/src/lib/utils';
import { getAssetUrl } from '@/src/global-config';
import { useRef, useState, useEffect } from 'react';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/src/components/ui/select';
import {
  Mic,
  Play,
  Check,
  Pause,
  Radio,
  Circle,
  ArrowLeft,
  Headphones,
  LoaderCircle,
  ChevronRight,
} from 'lucide-react';

const HEADPHONE_SAMPLE_AUDIO_URL = getAssetUrl('/listening/c57cfedc33f14f49870e978fbe231211.mp3');
const MICROPHONE_READOUT_TEXT = 'I love English. My English is great and I practice it every day!';

type SpeakingPreflightCheckProps = {
  isStarting?: boolean;
  onBack: () => void;
  onContinue: () => void | Promise<void>;
  startError?: string | null;
};

type AudioDeviceInfo = {
  deviceId: string;
  label: string;
};

type SinkAudioElement = HTMLAudioElement & {
  setSinkId?: (deviceId: string) => Promise<void>;
};

function formatClock(totalSeconds: number) {
  const safeTotalSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeTotalSeconds / 60);
  const seconds = safeTotalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getPreferredRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

async function applySinkId(audio: HTMLAudioElement | null, deviceId: string) {
  if (!audio || !deviceId) {
    return;
  }

  const sinkAudio = audio as SinkAudioElement;

  if (typeof sinkAudio.setSinkId !== 'function') {
    return;
  }

  try {
    await sinkAudio.setSinkId(deviceId);
  } catch {
    // Some browsers expose the API but reject it outside secure supported contexts.
  }
}

export function SpeakingPreflightCheck({
  isStarting = false,
  onBack,
  onContinue,
  startError,
}: SpeakingPreflightCheckProps) {
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const [speakerDevices, setSpeakerDevices] = useState<AudioDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('');
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState('');
  const [sampleDuration, setSampleDuration] = useState(0);
  const [sampleCurrentTime, setSampleCurrentTime] = useState(0);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const [hasCompletedHeadphoneCheck, setHasCompletedHeadphoneCheck] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioDuration, setRecordedAudioDuration] = useState(0);
  const [recordedAudioCurrentTime, setRecordedAudioCurrentTime] = useState(0);
  const [isRecordedAudioPlaying, setIsRecordedAudioPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasCompletedMicrophoneCheck, setHasCompletedMicrophoneCheck] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);

  const canContinue = hasCompletedHeadphoneCheck && hasCompletedMicrophoneCheck && !isStarting;

  useEffect(() => {
    const refreshDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const nextSpeakerDevices = devices
          .filter((device) => device.kind === 'audiooutput')
          .map((device, index) => ({
            deviceId: device.deviceId || 'default',
            label: device.label || `Speaker ${index + 1}`,
          }));
        const nextMicrophoneDevices = devices
          .filter((device) => device.kind === 'audioinput')
          .map((device, index) => ({
            deviceId: device.deviceId || 'default',
            label: device.label || `Microphone ${index + 1}`,
          }));

        setSpeakerDevices(nextSpeakerDevices);
        setMicrophoneDevices(nextMicrophoneDevices);
        setSelectedSpeakerId((currentValue) =>
          nextSpeakerDevices.some((device) => device.deviceId === currentValue)
            ? currentValue
            : (nextSpeakerDevices[0]?.deviceId ?? '')
        );
        setSelectedMicrophoneId((currentValue) =>
          nextMicrophoneDevices.some((device) => device.deviceId === currentValue)
            ? currentValue
            : (nextMicrophoneDevices[0]?.deviceId ?? '')
        );
      } catch {
        // Device discovery failure should not break the preflight UI.
      }
    };

    void refreshDevices();

    navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices);

    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices);
    };
  }, []);

  useEffect(() => {
    void applySinkId(sampleAudioRef.current, selectedSpeakerId);
    void applySinkId(recordingAudioRef.current, selectedSpeakerId);
  }, [selectedSpeakerId, recordedAudioUrl]);

  useEffect(() => {
    const sampleAudio = sampleAudioRef.current;

    if (!sampleAudio) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      setSampleDuration(Number.isFinite(sampleAudio.duration) ? sampleAudio.duration : 0);
    };

    const handleTimeUpdate = () => {
      setSampleCurrentTime(sampleAudio.currentTime);

      if (sampleAudio.currentTime >= 3) {
        setHasCompletedHeadphoneCheck(true);
      }
    };

    const handlePlay = () => {
      setIsSamplePlaying(true);
    };

    const handlePause = () => {
      setIsSamplePlaying(false);
    };

    const handleEnded = () => {
      setIsSamplePlaying(false);
      setHasCompletedHeadphoneCheck(true);
    };

    sampleAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    sampleAudio.addEventListener('timeupdate', handleTimeUpdate);
    sampleAudio.addEventListener('play', handlePlay);
    sampleAudio.addEventListener('pause', handlePause);
    sampleAudio.addEventListener('ended', handleEnded);

    return () => {
      sampleAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      sampleAudio.removeEventListener('timeupdate', handleTimeUpdate);
      sampleAudio.removeEventListener('play', handlePlay);
      sampleAudio.removeEventListener('pause', handlePause);
      sampleAudio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const recordingAudio = recordingAudioRef.current;

    if (!recordingAudio) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      setRecordedAudioDuration(
        Number.isFinite(recordingAudio.duration) ? recordingAudio.duration : 0
      );
    };

    const handleTimeUpdate = () => {
      setRecordedAudioCurrentTime(recordingAudio.currentTime);
    };

    const handlePlay = () => {
      setIsRecordedAudioPlaying(true);
    };

    const handlePause = () => {
      setIsRecordedAudioPlaying(false);
    };

    const handleEnded = () => {
      setIsRecordedAudioPlaying(false);
    };

    recordingAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    recordingAudio.addEventListener('timeupdate', handleTimeUpdate);
    recordingAudio.addEventListener('play', handlePlay);
    recordingAudio.addEventListener('pause', handlePause);
    recordingAudio.addEventListener('ended', handleEnded);

    return () => {
      recordingAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      recordingAudio.removeEventListener('timeupdate', handleTimeUpdate);
      recordingAudio.removeEventListener('play', handlePlay);
      recordingAudio.removeEventListener('pause', handlePause);
      recordingAudio.removeEventListener('ended', handleEnded);
    };
  }, [recordedAudioUrl]);

  useEffect(
    () => () => {
      sampleAudioRef.current?.pause();
      recordingAudioRef.current?.pause();

      if (recordingTimerRef.current !== null) {
        window.clearInterval(recordingTimerRef.current);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    },
    [recordedAudioUrl]
  );

  const stopActiveStream = () => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  };

  const handleSampleToggle = async () => {
    const sampleAudio = sampleAudioRef.current;

    if (!sampleAudio) {
      return;
    }

    if (isSamplePlaying) {
      sampleAudio.pause();
      return;
    }

    try {
      if (sampleDuration > 0 && sampleAudio.currentTime >= sampleDuration - 0.1) {
        sampleAudio.currentTime = 0;
      }

      await sampleAudio.play();
    } catch {
      // Browser autoplay restrictions are resolved by the user clicking again.
    }
  };

  const handleSampleSeek = (value: string) => {
    const sampleAudio = sampleAudioRef.current;
    const nextTime = Number(value);

    if (!sampleAudio || Number.isNaN(nextTime)) {
      return;
    }

    sampleAudio.currentTime = nextTime;
    setSampleCurrentTime(nextTime);
  };

  const handleRecordingPlaybackToggle = async () => {
    const recordingAudio = recordingAudioRef.current;

    if (!recordingAudio || !recordedAudioUrl) {
      return;
    }

    if (isRecordedAudioPlaying) {
      recordingAudio.pause();
      return;
    }

    try {
      if (recordedAudioDuration > 0 && recordingAudio.currentTime >= recordedAudioDuration - 0.1) {
        recordingAudio.currentTime = 0;
      }

      await recordingAudio.play();
    } catch {
      // Ignore playback failures triggered by browser policies.
    }
  };

  const handleRecordedAudioSeek = (value: string) => {
    const recordingAudio = recordingAudioRef.current;
    const nextTime = Number(value);

    if (!recordingAudio || Number.isNaN(nextTime)) {
      return;
    }

    recordingAudio.currentTime = nextTime;
    setRecordedAudioCurrentTime(nextTime);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneError('This browser does not support microphone checks.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setMicrophoneError('Recording is not supported in this browser.');
      return;
    }

    setMicrophoneError(null);

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
      setRecordedAudioDuration(0);
      setRecordedAudioCurrentTime(0);
      setHasCompletedMicrophoneCheck(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:
          selectedMicrophoneId && selectedMicrophoneId !== 'default'
            ? { deviceId: { exact: selectedMicrophoneId } }
            : true,
      });
      const mimeType = getPreferredRecorderMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];
      setRecordingDuration(0);
      setIsRecording(true);

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(recordingChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        const nextRecordedAudioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(nextRecordedAudioUrl);
        setHasCompletedMicrophoneCheck(audioBlob.size > 0);
        setIsRecording(false);
        stopActiveStream();

        if (recordingTimerRef.current !== null) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      });

      mediaRecorder.start();
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration((currentValue) => currentValue + 1);
      }, 1000);

      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMicrophoneDevices(
          devices
            .filter((device) => device.kind === 'audioinput')
            .map((device, index) => ({
              deviceId: device.deviceId,
              label: device.label || `Microphone ${index + 1}`,
            }))
        );
      }
    } catch (error) {
      setIsRecording(false);
      stopActiveStream();

      if (recordingTimerRef.current !== null) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      setMicrophoneError(
        error instanceof Error
          ? error.message
          : 'Microphone permission is required before you can continue.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const waitingMessage = isStarting
    ? 'Your speaking session is being prepared. You will enter the test in a moment.'
    : canContinue
      ? 'All checks passed. Start the test when you are ready.'
      : 'Complete the headphone and microphone checks before starting the speaking test.';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,159,47,0.10),transparent),linear-gradient(180deg,#f8f9fb_0%,#f3f5f8_100%)] px-4 py-8 text-stone-950 dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,159,47,0.07),transparent),linear-gradient(180deg,#111111_0%,#141414_100%)] dark:text-white sm:px-6 lg:px-8">
      <audio ref={sampleAudioRef} preload="metadata" src={HEADPHONE_SAMPLE_AUDIO_URL} />
      <audio ref={recordingAudioRef} preload="metadata" src={recordedAudioUrl ?? undefined} />

      <div className="mx-auto max-w-3xl">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <div
            className={cn(
              'flex items-center rounded-full p-1 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)]',
              PRACTICE_HEADER_RING_CLASS
            )}
          >
            <button
              type="button"
              onClick={onBack}
              disabled={isStarting}
              className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-white/8"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              <span>Back</span>
            </button>
          </div>

          <span className="rounded-full border border-[#ffb347]/30 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cc7a00] shadow-sm dark:border-[#ffb347]/20 dark:bg-white/6 dark:text-[#ffb347]">
            Speaking Pre-check
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[1.85rem] font-semibold leading-tight tracking-[-0.04em] text-[#1e3a5f] dark:text-white sm:text-4xl">
            Check your audio before<br className="hidden sm:block" /> the speaking test
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500 dark:text-white/50">
            Run a quick headphone and microphone check first. After both steps are complete, you can
            enter the speaking test.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 — Headphone */}
          <StepCard
            step={1}
            isDone={hasCompletedHeadphoneCheck}
            icon={<Headphones className="size-5" strokeWidth={1.8} />}
            title="Headphone check"
            description="Play the sample audio and confirm the sound is clear before you begin."
          >
            <div className="mt-5 space-y-3">
              {/* Audio player row */}
              <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => void handleSampleToggle()}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white shadow-[0_8px_20px_rgba(255,120,75,0.30)] transition-transform hover:scale-[1.04] active:scale-95"
                >
                  {isSamplePlaying ? (
                    <Pause className="size-4" strokeWidth={2.2} />
                  ) : (
                    <Play className="ml-0.5 size-4 fill-current" strokeWidth={2.2} />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <input
                    type="range"
                    min={0}
                    max={sampleDuration || 1}
                    step="0.01"
                    value={sampleCurrentTime}
                    onChange={(event) => handleSampleSeek(event.target.value)}
                    className="h-1.5 w-full cursor-pointer accent-[#ff9f2f]"
                  />
                </div>

                <span className="w-12 text-right text-sm font-medium tabular-nums text-stone-500 dark:text-white/40">
                  {formatClock(Math.max(sampleDuration - sampleCurrentTime, 0))}
                </span>
              </div>

              {/* Speaker device */}
              <Select
                value={selectedSpeakerId}
                onValueChange={setSelectedSpeakerId}
              >
                <SelectTrigger>
                  <Headphones className="size-4 shrink-0 text-[#38557f] dark:text-white/40" strokeWidth={1.8} />
                  <SelectValue placeholder="System default speaker" />
                </SelectTrigger>
                <SelectContent>
                  {speakerDevices.length ? (
                    speakerDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default">System default speaker</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </StepCard>

          {/* Step 2 — Microphone */}
          <StepCard
            step={2}
            isDone={hasCompletedMicrophoneCheck}
            icon={<Mic className="size-5" strokeWidth={1.8} />}
            title="Microphone check"
            description="Record yourself once and replay it. If the playback sounds clear, your microphone is ready."
          >
            <div className="mt-5 space-y-4">
              {/* Read-out text */}
              <div className="rounded-2xl border border-[#ffb347]/20 bg-[#fffbf5] px-5 py-4 text-center dark:border-[#ffb347]/10 dark:bg-[#ffb347]/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cc7a00] dark:text-[#ffb347]">
                  Please read out loud
                </p>
                <p className="mt-2 text-base font-semibold leading-7 tracking-[-0.01em] text-[#1e3a5f] dark:text-white">
                  {MICROPHONE_READOUT_TEXT}
                </p>
              </div>

              {/* Recorder row */}
              <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                {/* REC / Stop button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : () => void startRecording()}
                  disabled={isStarting}
                  className={cn(
                    'inline-flex h-10 min-w-[80px] items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed',
                    isRecording
                      ? 'bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white shadow-[0_4px_14px_rgba(255,120,75,0.30)]'
                      : 'border border-stone-200 bg-white text-[#cc7a00] hover:border-[#ffb347]/40 hover:bg-[#fffbf5] dark:border-white/10 dark:bg-white/8 dark:text-[#ffb347] dark:hover:bg-white/12'
                  )}
                >
                  {isRecording ? (
                    <>
                      <Radio className="size-3.5 animate-pulse fill-current" strokeWidth={0} />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Circle className="size-3 fill-[#ff9f2f] text-[#ff9f2f]" strokeWidth={0} />
                      <span>REC</span>
                    </>
                  )}
                </button>

                {/* Playback button */}
                <button
                  type="button"
                  onClick={() => void handleRecordingPlaybackToggle()}
                  disabled={!recordedAudioUrl}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white shadow-[0_6px_16px_rgba(255,120,75,0.28)] transition-transform hover:scale-[1.04] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {isRecordedAudioPlaying ? (
                    <Pause className="size-4" strokeWidth={2.2} />
                  ) : (
                    <Play className="ml-0.5 size-4 fill-current" strokeWidth={2.2} />
                  )}
                </button>

                {/* Seek bar */}
                <div className="min-w-0 flex-1">
                  <input
                    type="range"
                    min={0}
                    max={recordedAudioDuration || Math.max(recordingDuration, 1)}
                    step="0.01"
                    value={isRecording ? recordingDuration : recordedAudioCurrentTime}
                    onChange={(event) => handleRecordedAudioSeek(event.target.value)}
                    disabled={!recordedAudioUrl || isRecording}
                    className="h-1.5 w-full cursor-pointer accent-[#ff9f2f] disabled:cursor-not-allowed"
                  />
                </div>

                <span className="w-12 text-right text-sm font-medium tabular-nums text-stone-500 dark:text-white/40">
                  {formatClock(isRecording ? recordingDuration : recordedAudioCurrentTime)}
                </span>
              </div>

              {/* Mic device */}
              <Select
                value={selectedMicrophoneId}
                onValueChange={setSelectedMicrophoneId}
                disabled={isRecording}
              >
                <SelectTrigger>
                  <Mic className="size-4 shrink-0 text-[#38557f] dark:text-white/40" strokeWidth={1.8} />
                  <SelectValue placeholder="System default microphone" />
                </SelectTrigger>
                <SelectContent>
                  {microphoneDevices.length ? (
                    microphoneDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default">System default microphone</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {microphoneError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {microphoneError}
                </div>
              ) : null}
            </div>
          </StepCard>

          {/* Step 3 — Start */}
          <StepCard
            step={3}
            isDone={canContinue && !isStarting}
            isLoading={isStarting}
            icon={<ChevronRight className="size-5" strokeWidth={2} />}
            title="Ready to begin"
            description={waitingMessage}
            isActive={canContinue || isStarting}
          >
            {startError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {startError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void onContinue()}
                disabled={!canContinue}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(255,120,75,0.28)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isStarting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" strokeWidth={2.2} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>I&apos;m ready, go now!</span>
                    <ChevronRight className="size-4" strokeWidth={2.2} />
                  </>
                )}
              </button>

              {!canContinue && !isStarting ? (
                <p className="text-xs text-stone-400 dark:text-white/30">
                  Play the sample audio and complete one microphone recording first.
                </p>
              ) : null}
            </div>
          </StepCard>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  children,
  description,
  icon,
  isActive = false,
  isDone,
  isLoading = false,
  step,
  title,
}: {
  children?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isDone: boolean;
  isLoading?: boolean;
  step: number;
  title: string;
}) {
  return (
    <div
      className={cn(
        // layout & shadow
        'relative overflow-hidden rounded-[20px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-all dark:shadow-none sm:p-6',
        // gradient border pseudo-element mechanism
        "before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
        "after:absolute after:inset-[0.5px] after:rounded-[inherit] after:bg-white after:content-[''] dark:after:bg-[#141414]",
        '[&>*]:relative [&>*]:z-10',
        // gradient border color by state
        isDone
          ? 'before:bg-[linear-gradient(135deg,#a5d6a7,#c8e6c9,#a5d6a7)] dark:before:bg-[linear-gradient(135deg,rgba(74,222,128,0.28),rgba(74,222,128,0.08),rgba(74,222,128,0.28))]'
          : isActive
            ? 'before:bg-[linear-gradient(135deg,#f7deb2_0%,#f1c77d_46%,#ebb06f_100%)] dark:before:bg-[linear-gradient(135deg,rgba(255,180,50,0.32),rgba(255,180,50,0.10),rgba(255,180,50,0.32))]'
            : 'before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Step badge */}
        <div
          className={cn(
            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            isDone
              ? 'bg-[#e8f5e9] text-[#388e3c] dark:bg-green-500/15 dark:text-green-400'
              : isActive
                ? 'bg-[#fff3e0] text-[#cc7a00] dark:bg-[#ffb347]/12 dark:text-[#ffb347]'
                : 'bg-stone-100 text-stone-400 dark:bg-white/8 dark:text-white/30'
          )}
        >
          {isLoading ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={2.1} />
          ) : isDone ? (
            <Check className="size-4.5" strokeWidth={2.4} />
          ) : (
            <span>{step}</span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'transition-colors',
                isDone ? 'text-[#388e3c]' : isActive ? 'text-[#cc7a00]' : 'text-stone-400'
              )}
            >
              {icon}
            </span>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-[#1e3a5f] dark:text-white sm:text-lg">
              {title}
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-white/50">{description}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
