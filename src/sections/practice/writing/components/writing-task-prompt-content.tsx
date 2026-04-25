'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import type { WritingPart, WritingTextSize } from '../types';
import type { TextAnnotation } from './writing-task-panel.shared';
import type { ToolbarState, NoteSheetState } from './writing-task-panel.annotation-utils';

import { createPortal } from 'react-dom';
import { toast } from '@/src/components/ui/sonner';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { WRITING_OPEN_NOTES_EVENT } from '../types';
import { NotesSheetPanel } from './writing-notes-sheet-panel';
import { SelectionToolbar } from './writing-selection-toolbar';
import { AnnotatedTextBlock } from './writing-annotated-text-block';
import {
  getBlockLabel,
  getWritingTextStyle,
  getWritingUITextStyle,
  getSelectionFromAnnotation,
} from './writing-task-panel.shared';
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
} from './writing-task-panel.annotation-utils';

type PromptContentProps = {
  annotations: TextAnnotation[];
  isReview?: boolean;
  onAnnotationsChange: (annotations: TextAnnotation[]) => void;
  part: WritingPart;
  textSize: WritingTextSize;
};

export function PromptContent({
  annotations,
  isReview,
  onAnnotationsChange,
  part,
  textSize,
}: PromptContentProps) {
  const { task } = part;
  const promptRootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const focusResetTimerRef = useRef<number | null>(null);
  const [toolbarState, setToolbarState] = useState<ToolbarState | null>(null);
  const [noteSheetState, setNoteSheetState] = useState<NoteSheetState | null>(null);
  const [lastHighlightColor, setLastHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  const isPromptContentVisible = useCallback(() => {
    const promptRoot = promptRootRef.current;

    if (!promptRoot) {
      return false;
    }

    return promptRoot.offsetParent !== null || promptRoot.getClientRects().length > 0;
  }, []);

  const textByBlock = useMemo(
    () => ({
      instructions: task.instructions,
      'model-answer': task.modelAnswer ?? '',
      prompt: task.prompt,
    }),
    [task.instructions, task.modelAnswer, task.prompt]
  );

  const savedNotes = useMemo(
    () =>
      annotations
        .filter((annotation) => annotation.note?.trim())
        .map((annotation) => ({
          blockLabel: getBlockLabel(annotation.blockId),
          color: annotation.color,
          id: annotation.id,
          note: annotation.note!.trim(),
          selection: getSelectionFromAnnotation(annotation, textByBlock),
        })),
    [annotations, textByBlock]
  );

  const openToolbarForAnnotation = useCallback(
    (annotation: TextAnnotation, rect: DOMRect) => {
      setLastHighlightColor(annotation.color);
      setToolbarState({
        position: createToolbarPosition(rect),
        selection: {
          annotationId: annotation.id,
          blockId: annotation.blockId,
          end: annotation.end,
          start: annotation.start,
          text: textByBlock[annotation.blockId].slice(annotation.start, annotation.end),
        },
      });
    },
    [textByBlock]
  );

  const applyAnnotationColor = useCallback(
    (color: TextAnnotation['color']) => {
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
    setNoteSheetState(null);
    setToolbarState(null);
    window.getSelection()?.removeAllRanges();
  }, [annotations, onAnnotationsChange, toolbarState]);

  const openNoteSheet = useCallback(() => {
    if (!isPromptContentVisible()) {
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
  }, [annotations, isPromptContentVisible, toolbarState]);

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
      promptRootRef.current?.querySelector<HTMLElement>(
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

  const handleTextMouseUp = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement;

      window.requestAnimationFrame(() => {
        const selection = window.getSelection();
        const nextSelection = selection ? resolveSelectionFromDOM(selection, textByBlock) : null;

        if (nextSelection) {
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

        const annotationElement = target.closest<HTMLElement>('[data-writing-annotation-id]');
        const annotationId = annotationElement?.dataset.writingAnnotationId;
        const annotation = annotationId
          ? annotations.find((item) => item.id === annotationId)
          : undefined;

        if (annotation && annotationElement) {
          openToolbarForAnnotation(annotation, annotationElement.getBoundingClientRect());
          return;
        }

        setToolbarState(null);
        setNoteSheetState(null);
        setFocusedAnnotationId(null);
      });
    },
    [annotations, openToolbarForAnnotation, textByBlock]
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (toolbarRef.current?.contains(target)) return;
      if (target?.closest('[data-writing-notes-sheet]')) return;
      if (target?.closest('[data-writing-notes-trigger]')) return;
      if (promptRootRef.current?.contains(target)) return;

      setToolbarState(null);
      setNoteSheetState(null);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToolbarState(null);
    setNoteSheetState(null);
    setFocusedAnnotationId(null);
  }, [task.id]);

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
    window.addEventListener(WRITING_OPEN_NOTES_EVENT, handleNotesRequest);
    return () => window.removeEventListener(WRITING_OPEN_NOTES_EVENT, handleNotesRequest);
  }, [openNoteSheet]);

  const activeColor = useMemo(() => {
    const annotationId = toolbarState?.selection.annotationId;

    if (!annotationId) {
      return lastHighlightColor;
    }

    return (
      annotations.find((annotation) => annotation.id === annotationId)?.color ?? lastHighlightColor
    );
  }, [annotations, lastHighlightColor, toolbarState?.selection.annotationId]);

  return (
    <div ref={promptRootRef} className="space-y-4">
      <div className="space-y-1">
        <p
          style={getWritingUITextStyle(textSize, 'eyebrow')}
          className="font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45"
        >
          {task.questionType === 'graph_description' ? 'Graph / Chart Description' : 'Essay'}
        </p>
        <AnnotatedTextBlock
          blockId="instructions"
          text={task.instructions}
          focusedAnnotationId={focusedAnnotationId}
          onMouseUp={handleTextMouseUp}
          annotations={annotations.filter((annotation) => annotation.blockId === 'instructions')}
          className="text-stone-500 dark:text-white/55"
          style={getWritingTextStyle(textSize, 'instruction')}
        />
      </div>

      {task.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-white/10 dark:bg-white/4">
          <img src={task.imageUrl} alt="Task graphic" className="h-auto w-full object-contain" />
        </div>
      ) : null}

      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#111111]">
        <AnnotatedTextBlock
          blockId="prompt"
          text={task.prompt}
          focusedAnnotationId={focusedAnnotationId}
          onMouseUp={handleTextMouseUp}
          annotations={annotations.filter((annotation) => annotation.blockId === 'prompt')}
          className="text-stone-800 dark:text-white"
          style={getWritingTextStyle(textSize, 'prompt')}
        />
      </div>

      {isReview && task.modelAnswer ? (
        <div className="space-y-2">
          <p
            style={getWritingUITextStyle(textSize, 'eyebrow')}
            className="font-semibold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400"
          >
            Model Answer
          </p>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/8">
            <AnnotatedTextBlock
              blockId="model-answer"
              text={task.modelAnswer}
              focusedAnnotationId={focusedAnnotationId}
              onMouseUp={handleTextMouseUp}
              annotations={annotations.filter(
                (annotation) => annotation.blockId === 'model-answer'
              )}
              className="text-stone-700 dark:text-white/78"
              style={getWritingTextStyle(textSize, 'model-answer')}
            />
          </div>
        </div>
      ) : null}

      {portalTarget && toolbarState
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
        : null}

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
    </div>
  );
}
