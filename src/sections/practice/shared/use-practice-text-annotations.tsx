'use client';

import type {
  ReactNode,
  RefObject,
  ElementType,
  CSSProperties,
} from 'react';
import type {
  ToolbarState,
  NoteSheetState,
} from '@/src/sections/practice/writing/components/writing-task-panel.annotation-utils';
import type {
  SavedNoteItem,
  TextAnnotation,
  AnnotationColor,
} from '@/src/sections/practice/writing/components/writing-task-panel.shared';

import { createPortal } from 'react-dom';
import { toast } from '@/src/components/ui/sonner';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { NotesSheetPanel } from '@/src/sections/practice/writing/components/writing-notes-sheet-panel';
import { SelectionToolbar } from '@/src/sections/practice/writing/components/writing-selection-toolbar';
import { AnnotatedTextBlock } from '@/src/sections/practice/writing/components/writing-annotated-text-block';
import {
  TOOLBAR_WIDTH,
  TOOLBAR_HEIGHT,
  isSameSelection,
  upsertAnnotation,
  beginFloatingDrag,
  updateAnnotationNote,
  clampFloatingPosition,
  createToolbarPosition,
  DEFAULT_HIGHLIGHT_COLOR,
  resolveSelectionFromDOM,
  removeAnnotationsForSelection,
} from '@/src/sections/practice/writing/components/writing-task-panel.annotation-utils';

type AnnotationBlockConfig = {
  label: string;
  text: string;
};

type RenderAnnotatedTextBlockArgs = {
  as?: ElementType;
  blockId: string;
  className?: string;
  style?: CSSProperties;
  text: string;
};

type UsePracticeTextAnnotationsArgs = {
  annotations: TextAnnotation[];
  blocks: Record<string, AnnotationBlockConfig>;
  onAnnotationsChange: (annotations: TextAnnotation[]) => void;
  openNotesEventName: string;
};

type UsePracticeTextAnnotationsResult = {
  floatingUi: ReactNode;
  renderAnnotatedTextBlock: (args: RenderAnnotatedTextBlockArgs) => ReactNode;
  rootRef: RefObject<HTMLDivElement | null>;
};

export function usePracticeTextAnnotations({
  annotations,
  blocks,
  onAnnotationsChange,
  openNotesEventName,
}: UsePracticeTextAnnotationsArgs): UsePracticeTextAnnotationsResult {
  const rootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const focusResetTimerRef = useRef<number | null>(null);
  const [toolbarState, setToolbarState] = useState<ToolbarState | null>(null);
  const [noteSheetState, setNoteSheetState] = useState<NoteSheetState | null>(null);
  const [lastHighlightColor, setLastHighlightColor] = useState<AnnotationColor>(DEFAULT_HIGHLIGHT_COLOR);
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const textByBlock = useMemo(
    () =>
      Object.fromEntries(Object.entries(blocks).map(([blockId, config]) => [blockId, config.text])),
    [blocks]
  );

  const dismissFloatingUi = useCallback((clearDomSelection = false) => {
    setToolbarState(null);
    setNoteSheetState(null);
    setFocusedAnnotationId(null);

    if (clearDomSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const isSurfaceVisible = useCallback(() => {
    const root = rootRef.current;

    if (!root) {
      return false;
    }

    return root.offsetParent !== null || root.getClientRects().length > 0;
  }, []);

  const savedNotes = useMemo<SavedNoteItem[]>(
    () =>
      annotations
        .filter((annotation) => annotation.note?.trim() && blocks[annotation.blockId])
        .map((annotation) => ({
          blockLabel: blocks[annotation.blockId]?.label ?? 'Note',
          color: annotation.color,
          id: annotation.id,
          note: annotation.note!.trim(),
          selection: {
            annotationId: annotation.id,
            blockId: annotation.blockId,
            end: annotation.end,
            start: annotation.start,
            text: textByBlock[annotation.blockId]?.slice(annotation.start, annotation.end) ?? '',
          },
        })),
    [annotations, blocks, textByBlock]
  );

  const openToolbarForAnnotation = useCallback(
    (annotation: TextAnnotation, rect: DOMRect) => {
      const blockText = textByBlock[annotation.blockId];

      if (typeof blockText !== 'string') {
        return;
      }

      setLastHighlightColor(annotation.color);
      setToolbarState({
        position: createToolbarPosition(rect),
        selection: {
          annotationId: annotation.id,
          blockId: annotation.blockId,
          end: annotation.end,
          start: annotation.start,
          text: blockText.slice(annotation.start, annotation.end),
        },
      });
    },
    [textByBlock]
  );

  const applyAnnotationColor = useCallback(
    (color: AnnotationColor) => {
      if (!toolbarState) return;

      setLastHighlightColor(color);

      const existingAnnotation = toolbarState.selection.annotationId
        ? annotations.find((annotation) => annotation.id === toolbarState.selection.annotationId)
        : undefined;

      const nextResult = upsertAnnotation(
        annotations,
        toolbarState.selection,
        color,
        existingAnnotation?.note
      );

      onAnnotationsChange(nextResult.annotations);
      setToolbarState((currentState) =>
        currentState
          ? {
              ...currentState,
              selection: {
                ...currentState.selection,
                annotationId: nextResult.annotation.id,
              },
            }
          : currentState
      );
      window.getSelection()?.removeAllRanges();
    },
    [annotations, onAnnotationsChange, toolbarState]
  );

  const clearSelectionAnnotations = useCallback(() => {
    if (!toolbarState) return;

    onAnnotationsChange(removeAnnotationsForSelection(annotations, toolbarState.selection));
    dismissFloatingUi(true);
  }, [annotations, dismissFloatingUi, onAnnotationsChange, toolbarState]);

  const openNoteSheet = useCallback(() => {
    if (!isSurfaceVisible()) {
      return;
    }

    setNoteSheetState((currentState) => {
      const nextSelection = toolbarState?.selection ?? currentState?.selection ?? null;
      const existingAnnotation = nextSelection?.annotationId
        ? annotations.find((annotation) => annotation.id === nextSelection.annotationId)
        : undefined;

      return {
        draft: isSameSelection(currentState?.selection, nextSelection)
          ? (currentState?.draft ?? existingAnnotation?.note ?? '')
          : (existingAnnotation?.note ?? ''),
        selection: nextSelection,
      };
    });
  }, [annotations, isSurfaceVisible, toolbarState]);

  const clearComposer = useCallback(() => {
    setNoteSheetState((currentState) =>
      currentState
        ? {
            ...currentState,
            draft: '',
            selection: null,
          }
        : currentState
    );
  }, []);

  const navigateToSavedNote = useCallback((noteId: string) => {
    const targetElement =
      rootRef.current?.querySelector<HTMLElement>(
        `[data-writing-annotation-id="${noteId}"]`
      ) ?? null;

    if (!targetElement) {
      return;
    }

    setFocusedAnnotationId(noteId);
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    if (focusResetTimerRef.current) {
      window.clearTimeout(focusResetTimerRef.current);
    }

    focusResetTimerRef.current = window.setTimeout(() => {
      setFocusedAnnotationId((currentValue) => (currentValue === noteId ? null : currentValue));
      focusResetTimerRef.current = null;
    }, 1800);
  }, []);

  const saveNote = useCallback(() => {
    const currentSelection = noteSheetState?.selection;

    if (!noteSheetState || !currentSelection) {
      return;
    }

    const note = noteSheetState.draft.trim();
    const existingAnnotation = currentSelection.annotationId
      ? annotations.find((annotation) => annotation.id === currentSelection.annotationId)
      : undefined;
    const isUpdatingExistingNote = Boolean(existingAnnotation?.note?.trim());

    if (!note) {
      return;
    }

    const nextResult = upsertAnnotation(
      annotations,
      currentSelection,
      existingAnnotation?.color ?? lastHighlightColor,
      note || undefined
    );

    onAnnotationsChange(nextResult.annotations);
    setToolbarState((currentState) =>
      currentState
        ? {
            ...currentState,
            selection: {
              ...currentState.selection,
              annotationId: nextResult.annotation.id,
            },
          }
        : currentState
    );
    setNoteSheetState((currentState) =>
      currentState
        ? {
            ...currentState,
            draft: '',
            selection: null,
          }
        : currentState
    );
    window.getSelection()?.removeAllRanges();
    window.requestAnimationFrame(() => {
      navigateToSavedNote(nextResult.annotation.id);
    });
    toast.success(isUpdatingExistingNote ? 'Note updated.' : 'Note saved.');
  }, [annotations, lastHighlightColor, navigateToSavedNote, noteSheetState, onAnnotationsChange]);

  const editSavedNote = useCallback(
    (noteId: string) => {
      const targetNote = savedNotes.find((savedNote) => savedNote.id === noteId);

      if (!targetNote) {
        return;
      }

      setNoteSheetState({
        draft: targetNote.note,
        selection: targetNote.selection,
      });
      navigateToSavedNote(noteId);
    },
    [navigateToSavedNote, savedNotes]
  );

  const deleteSavedNote = useCallback(
    (noteId: string) => {
      onAnnotationsChange(updateAnnotationNote(annotations, noteId));
      setNoteSheetState((currentState) =>
        currentState?.selection?.annotationId === noteId
          ? {
              ...currentState,
              draft: '',
              selection: null,
            }
          : currentState
      );
      setFocusedAnnotationId((currentValue) => (currentValue === noteId ? null : currentValue));
      toast.success('Note deleted.');
    },
    [annotations, onAnnotationsChange]
  );

  const handleTextInteractionEnd = useCallback(
    (target: HTMLElement | null) => {
      window.requestAnimationFrame(() => {
        const selection = window.getSelection();
        const nextSelection = selection ? resolveSelectionFromDOM(selection, textByBlock) : null;

        if (nextSelection && blocks[nextSelection.blockId]) {
          setFocusedAnnotationId(null);
          setNoteSheetState(null);
          setToolbarState({
            position: createToolbarPosition(nextSelection.rect),
            selection: {
              annotationId: undefined,
              blockId: nextSelection.blockId,
              end: nextSelection.end,
              start: nextSelection.start,
              text: nextSelection.text,
            },
          });
          return;
        }

        if (!target || !rootRef.current?.contains(target)) {
          return;
        }

        const annotationElement = target.closest<HTMLElement>('[data-writing-annotation-id]');
        const annotationId = annotationElement?.dataset.writingAnnotationId;
        const annotation = annotationId
          ? annotations.find((item) => item.id === annotationId)
          : undefined;

        if (annotation && annotationElement) {
          openToolbarForAnnotation(annotation, annotationElement.getBoundingClientRect());
          return;
        }

        dismissFloatingUi();
      });
    },
    [annotations, blocks, dismissFloatingUi, openToolbarForAnnotation, textByBlock]
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (toolbarRef.current?.contains(target)) return;
      if (target?.closest('[data-writing-notes-sheet]')) return;
      if (target?.closest('[data-writing-notes-trigger]')) return;

      dismissFloatingUi(true);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [dismissFloatingUi]);

  useEffect(() => {
    const handleWindowMouseUp = (event: MouseEvent) => {
      handleTextInteractionEnd(event.target as HTMLElement | null);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [handleTextInteractionEnd]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 't' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      openNoteSheet();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openNoteSheet]);

  useEffect(
    () => () => {
      if (focusResetTimerRef.current) {
        window.clearTimeout(focusResetTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const handleResize = () => {
      setToolbarState((currentState) =>
        currentState
          ? {
              ...currentState,
              position: clampFloatingPosition(currentState.position, TOOLBAR_WIDTH, TOOLBAR_HEIGHT),
            }
          : currentState
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNotesRequest = () => openNoteSheet();
    window.addEventListener(openNotesEventName, handleNotesRequest);
    return () => window.removeEventListener(openNotesEventName, handleNotesRequest);
  }, [openNoteSheet, openNotesEventName]);

  const activeColor = useMemo(() => {
    const annotationId = toolbarState?.selection.annotationId;

    if (!annotationId) {
      return lastHighlightColor;
    }

    return (
      annotations.find((annotation) => annotation.id === annotationId)?.color ?? lastHighlightColor
    );
  }, [annotations, lastHighlightColor, toolbarState?.selection.annotationId]);

  const renderAnnotatedTextBlock = useCallback(
    ({ as, blockId, className, style, text }: RenderAnnotatedTextBlockArgs) => (
      <AnnotatedTextBlock
        as={as}
        annotations={annotations.filter((annotation) => annotation.blockId === blockId)}
        blockId={blockId}
        className={className}
        focusedAnnotationId={focusedAnnotationId}
        style={style}
        text={text}
      />
    ),
    [annotations, focusedAnnotationId]
  );

  const floatingUi =
    portalTarget && toolbarState
      ? createPortal(
          <div ref={toolbarRef}>
            <SelectionToolbar
              activeColor={activeColor}
              position={toolbarState.position}
              onApplyColor={applyAnnotationColor}
              onClear={clearSelectionAnnotations}
              onOpenNotes={openNoteSheet}
              onDragStart={(event) =>
                beginFloatingDrag(
                  event,
                  toolbarState.position,
                  TOOLBAR_WIDTH,
                  TOOLBAR_HEIGHT,
                  (position) =>
                    setToolbarState((currentState) =>
                      currentState ? { ...currentState, position } : currentState
                    )
                )
              }
            />
          </div>,
          portalTarget
        )
      : null;

  return {
    floatingUi: (
      <>
        {floatingUi}
        {noteSheetState ? (
          <NotesSheetPanel
            draft={noteSheetState.draft}
            selectionNoteId={noteSheetState.selection?.annotationId ?? null}
            selectionText={noteSheetState.selection?.text}
            selectionUnavailable={!noteSheetState.selection}
            savedNotes={savedNotes}
            onCancelComposer={clearComposer}
            onClose={() => setNoteSheetState(null)}
            onDeleteSavedNote={deleteSavedNote}
            onDraftChange={(value) =>
              setNoteSheetState((currentState) =>
                currentState ? { ...currentState, draft: value } : currentState
              )
            }
            onEditSavedNote={editSavedNote}
            onOpenSavedNote={navigateToSavedNote}
            onSave={saveNote}
          />
        ) : null}
      </>
    ),
    renderAnnotatedTextBlock,
    rootRef,
  };
}
