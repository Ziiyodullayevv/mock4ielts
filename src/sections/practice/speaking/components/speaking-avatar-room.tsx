'use client';

import { Loader2, VideoOff } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type SpeakingAvatarRoomProps = {
  token: string;
  url: string;
};

type RoomStatus = 'connecting' | 'connected' | 'waiting' | 'error';

type DynamicImport = (specifier: string) => Promise<unknown>;

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

type LiveKitRoomLike = {
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => Promise<void> | void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  remoteParticipants: {
    forEach: (callback: (participant: LiveKitParticipantLike) => void) => void;
  };
};

type LiveKitModuleLike = {
  Room: new () => LiveKitRoomLike;
  RoomEvent: {
    Disconnected: string;
    ParticipantDisconnected: string;
    TrackSubscribed: string;
    TrackUnsubscribed: string;
  };
  Track: {
    Kind: {
      Audio: string;
      Video: string;
    };
  };
};

const LIVEKIT_CLIENT_CDN_URL = 'https://esm.sh/livekit-client@2?bundle';

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

export function SpeakingAvatarRoom({ token, url }: SpeakingAvatarRoomProps) {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let roomInstance: LiveKitRoomLike | null = null;
    const videoContainer = videoContainerRef.current;
    const audioContainer = audioContainerRef.current;

    const connectToRoom = async () => {
      try {
        const liveKit = await loadLiveKitModule();

        if (!isActive) {
          return;
        }

        const room = new liveKit.Room();
        roomInstance = room;

        const detachTrack = (track: LiveKitTrackLike) => {
          track.detach().forEach((element) => element.remove());
        };

        const attachExistingTracks = () => {
          let hasRemoteVideo = false;

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
                const mediaElement = toElements(remoteTrack.attach())[0];

                if (mediaElement instanceof HTMLMediaElement) {
                  mediaElement.autoplay = true;
                  audioContainer?.appendChild(mediaElement);
                }
              }
            });
          });

          if (isActive) {
            setStatus(hasRemoteVideo ? 'connected' : 'waiting');
          }
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
            }
          }
        });

        room.on(liveKit.RoomEvent.TrackUnsubscribed, (...args: unknown[]) => {
          const [track] = args as [LiveKitTrackLike];
          detachTrack(track);
          attachExistingTracks();
        });

        room.on(liveKit.RoomEvent.ParticipantDisconnected, () => {
          attachExistingTracks();
        });

        room.on(liveKit.RoomEvent.Disconnected, () => {
          clearContainer(videoContainer);
          clearContainer(audioContainer);
        });

        await room.connect(url, token);
        attachExistingTracks();
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Could not connect to avatar room.');
      }
    };

    void connectToRoom();

    return () => {
      isActive = false;
      clearContainer(videoContainer);
      clearContainer(audioContainer);
      void roomInstance?.disconnect();
    };
  }, [token, url]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-100">
      <div ref={videoContainerRef} className="h-full w-full" />
      <div ref={audioContainerRef} className="hidden" />

      {status !== 'connected' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-6 text-center">
          {status === 'error' ? (
            <VideoOff className="size-8 text-rose-400" strokeWidth={2} />
          ) : (
            <Loader2 className="size-8 animate-spin text-rose-400" strokeWidth={2} />
          )}

          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-800">
              {status === 'connecting'
                ? 'Connecting to examiner...'
                : status === 'waiting'
                  ? 'Waiting for examiner video...'
                  : 'Avatar connection failed'}
            </p>
            {errorMessage ? <p className="text-xs text-stone-500">{errorMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
