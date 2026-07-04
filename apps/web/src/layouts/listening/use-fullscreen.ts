'use client';

import { useSyncExternalStore } from 'react';

type FullscreenCapableDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(doc: FullscreenCapableDocument) {
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function canToggleFullscreen(doc: FullscreenCapableDocument) {
  const root = doc.documentElement as FullscreenCapableElement;

  return Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
}

function subscribeToFullscreenChange(onStoreChange: () => void) {
  document.addEventListener('fullscreenchange', onStoreChange);
  document.addEventListener('webkitfullscreenchange', onStoreChange as EventListener);

  return () => {
    document.removeEventListener('fullscreenchange', onStoreChange);
    document.removeEventListener('webkitfullscreenchange', onStoreChange as EventListener);
  };
}

function subscribeNoop() {
  return () => undefined;
}

function getFullscreenSnapshot() {
  return Boolean(getFullscreenElement(document as FullscreenCapableDocument));
}

function getFullscreenSupportSnapshot() {
  return canToggleFullscreen(document as FullscreenCapableDocument);
}

export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreenChange,
    getFullscreenSnapshot,
    () => false
  );
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    getFullscreenSupportSnapshot,
    () => false
  );

  const toggleFullscreen = async () => {
    const doc = document as FullscreenCapableDocument;
    const root = doc.documentElement as FullscreenCapableElement;

    try {
      if (getFullscreenElement(doc)) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
          return;
        }

        if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }

        return;
      }

      if (root.requestFullscreen) {
        await root.requestFullscreen();
        return;
      }

      if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }
    } catch {
      return;
    }
  };

  return {
    isFullscreen,
    isSupported,
    toggleFullscreen,
  };
}
