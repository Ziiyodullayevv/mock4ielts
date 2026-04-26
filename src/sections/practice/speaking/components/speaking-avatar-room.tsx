'use client';

import { useRef, useState, useEffect } from 'react';
import { Loader2, Volume2, WifiOff, VideoOff } from 'lucide-react';

type SendDataRef = { current: ((data: object) => Promise<void>) | null };

type SpeakingAvatarRoomProps = {
  token: string;
  url: string;
  onDataMessage?: (event: Record<string, unknown>) => void;
  onAudioSpectrumChange?: (bands: number[]) => void;
  onMicrophoneSpectrumChange?: (bands: number[]) => void;
  sendDataRef?: SendDataRef;
};

type RoomStatus = 'connecting' | 'connected' | 'waiting' | 'error';

type DynamicImport = (specifier: string) => Promise<unknown>;

type AudioContextConstructor = new (
  contextOptions?: AudioContextOptions
) => AudioContext;

type LiveKitTrackLike = {
  attach: () => Element | Element[];
  detach: () => Element[];
  kind: string;
};

type LiveKitTrackPublicationLike = {
  track?: LiveKitTrackLike | null;
};

type LiveKitParticipantLike = {
  isLocal?: boolean;
  trackPublications: {
    forEach: (callback: (publication: LiveKitTrackPublicationLike) => void) => void;
  };
};

type LiveKitLocalTrackLike = {
  mediaStreamTrack?: MediaStreamTrack | null;
};

type LiveKitLocalTrackPublicationLike = {
  audioTrack?: LiveKitLocalTrackLike | null;
  source?: string;
  track?: LiveKitLocalTrackLike | null;
};

type LiveKitLocalParticipantLike = {
  getTrackPublication?: (source: string) => LiveKitLocalTrackPublicationLike | undefined;
  publishData: (data: Uint8Array, options: { reliable?: boolean }) => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  trackPublications?: {
    forEach: (callback: (publication: LiveKitLocalTrackPublicationLike) => void) => void;
  };
};

type LiveKitRoomLike = {
  canPlaybackAudio?: boolean;
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => Promise<void> | void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  startAudio: () => Promise<void>;
  remoteParticipants: {
    forEach: (callback: (participant: LiveKitParticipantLike) => void) => void;
  };
  localParticipant: LiveKitLocalParticipantLike;
};

type LiveKitModuleLike = {
  Room: new () => LiveKitRoomLike;
  RoomEvent: {
    AudioPlaybackStatusChanged: string;
    DataReceived: string;
    Disconnected: string;
    ParticipantDisconnected: string;
    Reconnected: string;
    Reconnecting: string;
    TrackSubscribed: string;
    TrackUnsubscribed: string;
  };
  Track: {
    Kind: {
      Audio: string;
      Video: string;
    };
    Source?: {
      Microphone?: string;
    };
  };
};

const LIVEKIT_CLIENT_CDN_URL = 'https://esm.sh/livekit-client@2?bundle';
const AUDIO_SPECTRUM_BAND_COUNT = 11;
const AUDIO_SPECTRUM_FRAME_MS = 48;

function createSilentAudioSpectrum() {
  return Array.from({ length: AUDIO_SPECTRUM_BAND_COUNT }, () => 0);
}

function clearContainer(container: HTMLDivElement | null) {
  if (!container) {
    return;
  }

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function toElements(result: Element | Element[]) {
  return Array.isArray(result) ? result : [result];
}

async function loadLiveKitModule() {
  const dynamicImport = new Function(
    'specifier',
    'return import(specifier);'
  ) as DynamicImport;

  const module = (await dynamicImport(LIVEKIT_CLIENT_CDN_URL)) as LiveKitModuleLike;

  if (!module?.Room || !module?.RoomEvent || !module?.Track) {
    throw new Error('LiveKit client could not be loaded.');
  }

  return module;
}

export function SpeakingAvatarRoom({
  token,
  url,
  onAudioSpectrumChange,
  onMicrophoneSpectrumChange,
  onDataMessage,
  sendDataRef,
}: SpeakingAvatarRoomProps) {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<LiveKitRoomLike | null>(null);
  const onAudioSpectrumChangeRef = useRef(onAudioSpectrumChange);
  const onMicrophoneSpectrumChangeRef = useRef(onMicrophoneSpectrumChange);
  const onDataMessageRef = useRef(onDataMessage);
  useEffect(() => {
    onAudioSpectrumChangeRef.current = onAudioSpectrumChange;
    onMicrophoneSpectrumChangeRef.current = onMicrophoneSpectrumChange;
    onDataMessageRef.current = onDataMessage;
  }, [onAudioSpectrumChange, onMicrophoneSpectrumChange, onDataMessage]);
  const activeAudioElementRef = useRef<HTMLMediaElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const spectrumFrameRef = useRef<number | null>(null);
  const lastSpectrumEmitRef = useRef(0);
  const microphoneAnalyserRef = useRef<AnalyserNode | null>(null);
  const microphoneFrequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const microphoneSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const microphoneSpectrumFrameRef = useRef<number | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const lastMicrophoneSpectrumEmitRef = useRef(0);
  const hadRemoteVideoRef = useRef(false);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAudioPlaybackBlocked, setIsAudioPlaybackBlocked] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [hasWaitedTooLong, setHasWaitedTooLong] = useState(false);

  useEffect(() => {
    let isActive = true;
    let roomInstance: LiveKitRoomLike | null = null;
    let microphoneAnalysisRetryInterval: number | null = null;
    const videoContainer = videoContainerRef.current;
    const audioContainer = audioContainerRef.current;
    hadRemoteVideoRef.current = false;

    const emitSilentAudioSpectrum = () => {
      onAudioSpectrumChangeRef.current?.(createSilentAudioSpectrum());
    };

    const emitSilentMicrophoneSpectrum = () => {
      onMicrophoneSpectrumChangeRef.current?.(createSilentAudioSpectrum());
    };

    const resolveAudioContext = () => {
      const audioWindow = window as Window & {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
      };
      const AudioContextClass = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      const audioContext = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        void audioContext.resume().catch(() => {});
      }

      return audioContext;
    };

    const buildSpectrum = (values: Uint8Array<ArrayBuffer>) => {
      const bucketSize = values.length / AUDIO_SPECTRUM_BAND_COUNT;

      return Array.from({ length: AUDIO_SPECTRUM_BAND_COUNT }, (_, index) => {
        const startIndex = Math.floor(index * bucketSize);
        const endIndex = Math.max(startIndex + 1, Math.floor((index + 1) * bucketSize));
        let total = 0;

        for (let bucketIndex = startIndex; bucketIndex < endIndex; bucketIndex += 1) {
          total += values[bucketIndex] ?? 0;
        }

        const average = total / Math.max(endIndex - startIndex, 1);
        return Math.min(1, Math.pow(average / 255, 0.8));
      });
    };

    const disposeRemoteAudioAnalysis = () => {
      if (spectrumFrameRef.current !== null) {
        window.cancelAnimationFrame(spectrumFrameRef.current);
        spectrumFrameRef.current = null;
      }

      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();

      sourceNodeRef.current = null;
      analyserRef.current = null;
      frequencyDataRef.current = null;
      activeAudioElementRef.current = null;
      lastSpectrumEmitRef.current = 0;
    };

    const disposeMicrophoneAnalysis = () => {
      if (microphoneSpectrumFrameRef.current !== null) {
        window.cancelAnimationFrame(microphoneSpectrumFrameRef.current);
        microphoneSpectrumFrameRef.current = null;
      }

      microphoneSourceNodeRef.current?.disconnect();
      microphoneAnalyserRef.current?.disconnect();
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());

      microphoneSourceNodeRef.current = null;
      microphoneAnalyserRef.current = null;
      microphoneFrequencyDataRef.current = null;
      microphoneStreamRef.current = null;
      lastMicrophoneSpectrumEmitRef.current = 0;
    };

    const disposeAudioAnalysis = (closeContext = false) => {
      disposeRemoteAudioAnalysis();
      disposeMicrophoneAnalysis();

      if (closeContext && audioContextRef.current) {
        const currentAudioContext = audioContextRef.current;
        audioContextRef.current = null;
        void currentAudioContext.close().catch(() => {});
      }
    };

    const connectAudioAnalysis = (mediaElement: HTMLMediaElement) => {
      if (typeof window === 'undefined') {
        return;
      }

      if (activeAudioElementRef.current === mediaElement && analyserRef.current) {
        return;
      }

      const audioContext = resolveAudioContext();
      if (!audioContext) {
        return;
      }

      if (activeAudioElementRef.current && activeAudioElementRef.current !== mediaElement) {
        disposeRemoteAudioAnalysis();
      }

      try {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;

        const sourceNode = audioContext.createMediaElementSource(mediaElement);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);

        analyserRef.current = analyser;
        sourceNodeRef.current = sourceNode;
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        activeAudioElementRef.current = mediaElement;

        const measureAudioSpectrum = (timestamp: number) => {
          const currentAnalyser = analyserRef.current;
          const currentFrequencyData = frequencyDataRef.current;

          if (!isActive || !currentAnalyser || !currentFrequencyData) {
            return;
          }

          currentAnalyser.getByteFrequencyData(currentFrequencyData);

          if (timestamp - lastSpectrumEmitRef.current >= AUDIO_SPECTRUM_FRAME_MS) {
            const nextSpectrum = buildSpectrum(currentFrequencyData);
            onAudioSpectrumChangeRef.current?.(nextSpectrum);
            lastSpectrumEmitRef.current = timestamp;
          }

          spectrumFrameRef.current = window.requestAnimationFrame(measureAudioSpectrum);
        };

        if (spectrumFrameRef.current !== null) {
          window.cancelAnimationFrame(spectrumFrameRef.current);
        }

        spectrumFrameRef.current = window.requestAnimationFrame(measureAudioSpectrum);
      } catch {
        emitSilentAudioSpectrum();
      }
    };

    const connectMicrophoneAnalysisFromTrack = (mediaStreamTrack: MediaStreamTrack | null) => {
      if (!mediaStreamTrack) {
        emitSilentMicrophoneSpectrum();
        return;
      }

      if (microphoneStreamRef.current && microphoneAnalyserRef.current) {
        return;
      }

      const audioContext = resolveAudioContext();
      if (!audioContext) {
        emitSilentMicrophoneSpectrum();
        return;
      }

      try {
        const clonedTrack = mediaStreamTrack.clone();
        const microphoneStream = new MediaStream([clonedTrack]);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.76;

        const sourceNode = audioContext.createMediaStreamSource(microphoneStream);
        sourceNode.connect(analyser);

        microphoneAnalyserRef.current = analyser;
        microphoneFrequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        microphoneSourceNodeRef.current = sourceNode;
        microphoneStreamRef.current = microphoneStream;

        const measureMicrophoneSpectrum = (timestamp: number) => {
          const currentAnalyser = microphoneAnalyserRef.current;
          const currentFrequencyData = microphoneFrequencyDataRef.current;

          if (!isActive || !currentAnalyser || !currentFrequencyData) {
            return;
          }

          currentAnalyser.getByteFrequencyData(currentFrequencyData);

          if (timestamp - lastMicrophoneSpectrumEmitRef.current >= AUDIO_SPECTRUM_FRAME_MS) {
            const nextSpectrum = buildSpectrum(currentFrequencyData);
            onMicrophoneSpectrumChangeRef.current?.(nextSpectrum);
            lastMicrophoneSpectrumEmitRef.current = timestamp;
          }

          microphoneSpectrumFrameRef.current = window.requestAnimationFrame(
            measureMicrophoneSpectrum
          );
        };

        if (microphoneSpectrumFrameRef.current !== null) {
          window.cancelAnimationFrame(microphoneSpectrumFrameRef.current);
        }

        microphoneSpectrumFrameRef.current = window.requestAnimationFrame(
          measureMicrophoneSpectrum
        );
      } catch {
        emitSilentMicrophoneSpectrum();
      }
    };

    const findLocalMicrophoneTrack = (
      room: LiveKitRoomLike,
      liveKit: LiveKitModuleLike
    ): MediaStreamTrack | null => {
      const localParticipant = room.localParticipant;
      const microphoneSource = liveKit.Track.Source?.Microphone ?? 'microphone';

      const directPublication =
        typeof localParticipant.getTrackPublication === 'function'
          ? localParticipant.getTrackPublication(microphoneSource)
          : undefined;

      const publicationCandidates: LiveKitLocalTrackPublicationLike[] = [];

      if (directPublication) {
        publicationCandidates.push(directPublication);
      }

      localParticipant.trackPublications?.forEach((publication) => {
        publicationCandidates.push(publication);
      });

      for (const publication of publicationCandidates) {
        if (publication.source && publication.source !== microphoneSource) {
          continue;
        }

        const maybeTrack = publication.audioTrack ?? publication.track;
        const mediaStreamTrack = maybeTrack?.mediaStreamTrack;

        if (mediaStreamTrack instanceof MediaStreamTrack) {
          return mediaStreamTrack;
        }
      }

      return null;
    };

    const connectMicrophoneAnalysis = async (
      room: LiveKitRoomLike,
      liveKit: LiveKitModuleLike
    ) => {
      for (let attempt = 0; attempt < 40 && isActive; attempt += 1) {
        const microphoneTrack = findLocalMicrophoneTrack(room, liveKit);

        if (microphoneTrack) {
          connectMicrophoneAnalysisFromTrack(microphoneTrack);
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 150));
      }

      emitSilentMicrophoneSpectrum();
    };

    const connectToRoom = async () => {
      try {
        const liveKit = await loadLiveKitModule();

        if (!isActive) {
          return;
        }

        const room = new liveKit.Room();
        roomInstance = room;
        roomRef.current = room;

        const detachTrack = (track: LiveKitTrackLike) => {
          track.detach().forEach((element) => element.remove());
        };

        const syncAudioPlaybackState = () => {
          if (!isActive) {
            return;
          }

          setIsAudioPlaybackBlocked(room.canPlaybackAudio === false);
        };

        const attachExistingTracks = (reason?: string) => {
          let hasRemoteVideo = false;
          let hasRemoteAudio = false;

          clearContainer(audioContainer);

          room.remoteParticipants.forEach((participant) => {
            participant.trackPublications.forEach((publication) => {
              const remoteTrack = publication.track;

              if (!remoteTrack || participant.isLocal) {
                return;
              }

              if (remoteTrack.kind === liveKit.Track.Kind.Video) {
                hasRemoteVideo = true;
                clearContainer(videoContainer);
                const mediaElement = toElements(remoteTrack.attach())[0];

                if (mediaElement instanceof HTMLElement) {
                  mediaElement.className = 'h-full w-full object-cover';
                  videoContainer?.appendChild(mediaElement);
                }
              }

              if (remoteTrack.kind === liveKit.Track.Kind.Audio) {
                hasRemoteAudio = true;
                const mediaElement = toElements(remoteTrack.attach())[0];

                if (mediaElement instanceof HTMLMediaElement) {
                  mediaElement.autoplay = true;
                  audioContainer?.appendChild(mediaElement);
                  connectAudioAnalysis(mediaElement);
                }
              }
            });
          });

          if (isActive) {
            setIsReconnecting(false);
            setStatus(hasRemoteVideo ? 'connected' : 'waiting');
            if (hasRemoteVideo) {
              hadRemoteVideoRef.current = true;
              setErrorMessage(null);
            } else if (hadRemoteVideoRef.current) {
              setErrorMessage(
                reason ??
                  (hasRemoteAudio
                    ? 'Examiner audio is still connected, but the video track was unpublished or dropped.'
                    : 'Examiner joined earlier, then the participant or video track left the room.')
              );
            } else {
              setErrorMessage(null);
            }

            if (!hasRemoteAudio) {
              emitSilentAudioSpectrum();
              disposeRemoteAudioAnalysis();
            }
          }

          syncAudioPlaybackState();
        };

        room.on(liveKit.RoomEvent.TrackSubscribed, (...args: unknown[]) => {
          const [track, , participant] = args as [
            LiveKitTrackLike,
            unknown,
            LiveKitParticipantLike,
          ];

          if (participant.isLocal) {
            return;
          }

          if (track.kind === liveKit.Track.Kind.Video) {
            clearContainer(videoContainer);
            const mediaElement = toElements(track.attach())[0];

            if (mediaElement instanceof HTMLElement) {
              mediaElement.className = 'h-full w-full object-cover';
              videoContainer?.appendChild(mediaElement);
            }

            if (isActive) {
              hadRemoteVideoRef.current = true;
              setIsReconnecting(false);
              setStatus('connected');
              setErrorMessage(null);
            }
            return;
          }

          if (track.kind === liveKit.Track.Kind.Audio) {
            const mediaElement = toElements(track.attach())[0];

            if (mediaElement instanceof HTMLMediaElement) {
              mediaElement.autoplay = true;
              audioContainer?.appendChild(mediaElement);
              connectAudioAnalysis(mediaElement);
            }
          }
        });

        room.on(liveKit.RoomEvent.TrackUnsubscribed, (...args: unknown[]) => {
          const [track] = args as [LiveKitTrackLike];
          detachTrack(track);
          attachExistingTracks(
            track.kind === liveKit.Track.Kind.Video
              ? 'Examiner video track was unpublished or temporarily lost.'
              : undefined
          );
        });

        room.on(liveKit.RoomEvent.ParticipantDisconnected, () => {
          attachExistingTracks('Examiner participant disconnected from the room.');
        });

        room.on(liveKit.RoomEvent.AudioPlaybackStatusChanged, () => {
          syncAudioPlaybackState();
        });

        room.on(liveKit.RoomEvent.Reconnecting, () => {
          if (!isActive) {
            return;
          }

          setIsReconnecting(true);
          setErrorMessage(null);
        });

        room.on(liveKit.RoomEvent.Reconnected, () => {
          attachExistingTracks();
        });

        room.on(liveKit.RoomEvent.Disconnected, () => {
          clearContainer(videoContainer);
          clearContainer(audioContainer);
          emitSilentAudioSpectrum();
          emitSilentMicrophoneSpectrum();
          disposeAudioAnalysis();

          if (!isActive) {
            return;
          }

          setIsReconnecting(false);
          setStatus('error');
          setErrorMessage(
            navigator.onLine
              ? 'Connection to the examiner was interrupted.'
              : 'Internet connection lost while talking to the examiner.'
          );
        });

        // Agent data messages
        room.on(liveKit.RoomEvent.DataReceived, (...args: unknown[]) => {
          const payload = args[0];
          try {
            const bytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload as ArrayBuffer);
            const event = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
            onDataMessageRef.current?.(event);
          } catch {
            return;
          }
        });

        await room.connect(url, token);

        // Mikrofon yoqish — agent user ovozini eshitishi uchun
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          await connectMicrophoneAnalysis(room, liveKit);

          microphoneAnalysisRetryInterval = window.setInterval(() => {
            if (!isActive || microphoneAnalyserRef.current) {
              return;
            }

            void connectMicrophoneAnalysis(room, liveKit);
          }, 1200);
        } catch (micError) {
          console.warn('Microphone could not be enabled:', micError);
          emitSilentMicrophoneSpectrum();
        }

        // Expose publishData to parent
        if (sendDataRef) {
          sendDataRef.current = async (data: object) => {
            await room.localParticipant.publishData(
              new TextEncoder().encode(JSON.stringify(data)),
              { reliable: true }
            );
          };
        }

        attachExistingTracks();
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Could not connect to avatar room.'
        );
      }
    };

    void connectToRoom();

    return () => {
      isActive = false;
      if (microphoneAnalysisRetryInterval !== null) {
        window.clearInterval(microphoneAnalysisRetryInterval);
      }
      roomRef.current = null;
      if (sendDataRef) sendDataRef.current = null;
      emitSilentAudioSpectrum();
      emitSilentMicrophoneSpectrum();
      disposeAudioAnalysis(true);
      clearContainer(videoContainer);
      clearContainer(audioContainer);
      void roomInstance?.disconnect();
    };
    // Callbacks accessed via refs; sendDataRef is a ref — only reconnect on token/url change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, url]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setHasWaitedTooLong(status === 'waiting');
      },
      status === 'waiting' ? 8000 : 0
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  const handleEnableAudio = async () => {
    const room = roomRef.current;

    if (!room) {
      return;
    }

    try {
      await room.startAudio();
      void audioContextRef.current?.resume().catch(() => {});
      setIsAudioPlaybackBlocked(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Audio could not be started. Try clicking again.'
      );
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-100">
      <div ref={videoContainerRef} className="h-full w-full" />
      <div ref={audioContainerRef} className="hidden" />

      {status !== 'connected' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(255,159,47,0.08),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#fef6e8_100%)] px-6 text-center">
          {status === 'error' ? (
            <VideoOff className="size-8 text-[#ff9f2f]" strokeWidth={2} />
          ) : (
            <Loader2 className="size-8 animate-spin text-[#ff9f2f]" strokeWidth={2} />
          )}

          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-800">
              {isReconnecting
                ? 'Reconnecting to examiner...'
                : status === 'connecting'
                ? 'Connecting to examiner...'
                : status === 'waiting'
                  ? 'Waiting for examiner video...'
                  : 'Avatar connection failed'}
            </p>
            {errorMessage ? <p className="text-xs text-stone-500">{errorMessage}</p> : null}
            {status === 'waiting' && hasWaitedTooLong ? (
              <p className="text-xs text-stone-500">
                Connected to LiveKit, but no examiner video track has joined this room yet.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {status === 'connected' && isReconnecting ? (
        <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/95 px-4 py-2 text-xs font-medium text-amber-700 shadow-[0_12px_24px_rgba(15,23,42,0.08)] backdrop-blur">
            <WifiOff className="size-3.5" strokeWidth={2} />
            <span>Network changed. Reconnecting to examiner...</span>
          </div>
        </div>
      ) : null}

      {isAudioPlaybackBlocked ? (
        <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center">
          <button
            type="button"
            onClick={handleEnableAudio}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition-opacity hover:opacity-95"
          >
            <Volume2 className="size-4" strokeWidth={2} />
            <span>Tap to enable examiner audio</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
