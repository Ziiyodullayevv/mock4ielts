'use client';

import { cn } from '@/src/lib/utils';
import { getAssetUrl } from '@/src/global-config';
import { useRef, useState, useEffect } from 'react';
import {
  Mic,
  Play,
  Check,
  Pause,
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
            deviceId: device.deviceId,
            label: device.label || `Speaker ${index + 1}`,
          }));
        const nextMicrophoneDevices = devices
          .filter((device) => device.kind === 'audioinput')
          .map((device, index) => ({
            deviceId: device.deviceId,
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_30%),linear-gradient(180deg,#fffdfd_0%,#fff7f9_100%)] px-4 py-6 text-stone-950 sm:px-6 lg:px-8">
      <audio ref={sampleAudioRef} preload="metadata" src={HEADPHONE_SAMPLE_AUDIO_URL} />
      <audio ref={recordingAudioRef} preload="metadata" src={recordedAudioUrl ?? undefined} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isStarting}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft className="size-4.5" strokeWidth={2} />
            <span>Back</span>
          </button>

          <div className="rounded-full border border-rose-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500 shadow-sm">
            Speaking pre-check
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_30px_80px_rgba(188,31,78,0.08)] backdrop-blur sm:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#243b63] sm:text-4xl">
              Check your audio before the speaking test
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
              Run a quick headphone and microphone check first. After both steps are complete, you
              can enter the speaking test without guessing whether your setup works.
            </p>
          </div>

          <div className="relative mt-10">
            <div className="absolute bottom-16 left-[27px] top-8 hidden border-l border-dashed border-rose-300 md:block" />

            <div className="space-y-8">
              <section className="grid gap-4 md:grid-cols-[56px_minmax(0,1fr)] md:gap-6">
                <StepMarker isDone={hasCompletedHeadphoneCheck} isLoading={false} step={1} />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#243b63]">
                      Headphone check
                    </h2>
                    <p className="mt-3 max-w-4xl text-base leading-8 text-stone-700">
                      Play the sample audio and confirm the sound is clear enough before you begin
                      the speaking section.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => void handleSampleToggle()}
                          className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-rose-400 to-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.22)] transition-transform hover:scale-[1.02]"
                        >
                          {isSamplePlaying ? (
                            <Pause className="size-5" strokeWidth={2.2} />
                          ) : (
                            <Play className="ml-0.5 size-5 fill-current" strokeWidth={2.2} />
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
                            className="h-2 w-full cursor-pointer accent-rose-500"
                          />
                        </div>

                        <div className="w-16 text-right text-xl font-medium tabular-nums text-stone-700">
                          {formatClock(Math.max(sampleDuration - sampleCurrentTime, 0))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
                      <label className="flex items-center gap-3">
                        <Headphones className="size-5 text-[#38557f]" strokeWidth={1.9} />
                        <select
                          value={selectedSpeakerId}
                          onChange={(event) => setSelectedSpeakerId(event.target.value)}
                          className="h-11 w-full rounded-2xl border border-transparent bg-transparent text-lg text-stone-800 outline-none"
                        >
                          {speakerDevices.length ? (
                            speakerDevices.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </option>
                            ))
                          ) : (
                            <option value="">System default speaker</option>
                          )}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-[56px_minmax(0,1fr)] md:gap-6">
                <StepMarker isDone={hasCompletedMicrophoneCheck} isLoading={false} step={2} />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#243b63]">
                      Microphone check
                    </h2>
                    <p className="mt-3 max-w-4xl text-base leading-8 text-stone-700">
                      Record yourself once and replay it. If the playback sounds clear, your
                      microphone is ready for the speaking session.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-stone-200 bg-white px-5 py-6 shadow-sm">
                    <p className="text-center text-lg leading-8 text-stone-700">
                      Please read out loud:
                    </p>
                    <p className="mt-2 text-center text-2xl font-semibold tracking-[-0.02em] text-stone-950">
                      {MICROPHONE_READOUT_TEXT}
                    </p>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={isRecording ? stopRecording : () => void startRecording()}
                            disabled={isStarting}
                            className={cn(
                              'inline-flex h-14 min-w-[112px] items-center justify-center gap-2 rounded-2xl px-4 text-base font-semibold shadow-sm transition-colors',
                              isRecording
                                ? 'bg-rose-600 text-white hover:bg-rose-500'
                                : 'bg-white text-rose-600 hover:bg-rose-50'
                            )}
                          >
                            <Circle
                              className={cn(
                                'size-4.5',
                                isRecording ? 'fill-current text-white' : 'fill-current'
                              )}
                              strokeWidth={2.2}
                            />
                            <span>{isRecording ? 'Stop' : 'REC'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleRecordingPlaybackToggle()}
                            disabled={!recordedAudioUrl}
                            className="inline-flex size-14 items-center justify-center rounded-full bg-linear-to-r from-rose-400 to-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.18)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isRecordedAudioPlaying ? (
                              <Pause className="size-5" strokeWidth={2.2} />
                            ) : (
                              <Play className="ml-0.5 size-5 fill-current" strokeWidth={2.2} />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <input
                              type="range"
                              min={0}
                              max={recordedAudioDuration || Math.max(recordingDuration, 1)}
                              step="0.01"
                              value={isRecording ? recordingDuration : recordedAudioCurrentTime}
                              onChange={(event) => handleRecordedAudioSeek(event.target.value)}
                              disabled={!recordedAudioUrl || isRecording}
                              className="h-2 w-full cursor-pointer accent-rose-500 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div className="w-16 text-right text-xl font-medium tabular-nums text-stone-700">
                            {formatClock(
                              isRecording ? recordingDuration : recordedAudioCurrentTime
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
                        <label className="flex items-center gap-3">
                          <Mic className="size-5 text-[#38557f]" strokeWidth={1.9} />
                          <select
                            value={selectedMicrophoneId}
                            onChange={(event) => setSelectedMicrophoneId(event.target.value)}
                            disabled={isRecording}
                            className="h-11 w-full rounded-2xl border border-transparent bg-transparent text-lg text-stone-800 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {microphoneDevices.length ? (
                              microphoneDevices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                  {device.label}
                                </option>
                              ))
                            ) : (
                              <option value="">System default microphone</option>
                            )}
                          </select>
                        </label>
                      </div>
                    </div>

                    {microphoneError ? (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {microphoneError}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-[56px_minmax(0,1fr)] md:gap-6">
                <StepMarker isDone={canContinue && !isStarting} isLoading={isStarting} step={3} />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#243b63]">
                      Waiting room
                    </h2>
                    <p
                      className={cn(
                        'mt-3 text-lg leading-8',
                        isStarting ? 'text-rose-500' : 'text-stone-600'
                      )}
                    >
                      {waitingMessage}
                    </p>
                  </div>

                  {startError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {startError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void onContinue()}
                      disabled={!canContinue}
                      className="inline-flex h-14 items-center gap-2 rounded-full bg-linear-to-r from-rose-500 to-rose-700 px-6 text-base font-semibold text-white shadow-[0_18px_35px_rgba(190,24,93,0.24)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isStarting ? (
                        <>
                          <LoaderCircle className="size-5 animate-spin" strokeWidth={2.2} />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>I&apos;m ready, go now!</span>
                          <ChevronRight className="size-5" strokeWidth={2.2} />
                        </>
                      )}
                    </button>

                    {!canContinue ? (
                      <p className="text-sm text-stone-500">
                        Play the sample audio and complete one microphone recording first.
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMarker({
  isDone,
  isLoading,
  step,
}: {
  isDone: boolean;
  isLoading: boolean;
  step: number;
}) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-300 bg-rose-50 text-rose-500 shadow-sm">
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin" strokeWidth={2.1} />
      ) : isDone ? (
        <Check className="size-6" strokeWidth={2.2} />
      ) : (
        <span className="text-lg font-semibold">{step}</span>
      )}
    </div>
  );
}
