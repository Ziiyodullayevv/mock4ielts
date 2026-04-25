'use client';

import type { SavedNoteItem, AnnotationColor } from './writing-task-panel.shared';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useRef, useMemo, useState, useEffect } from 'react';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import {
  X,
  Search,
  Trash2,
  PencilLine,
  EllipsisVertical,
} from 'lucide-react';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/src/components/ui/sheet';

type NotesSheetPanelProps = {
  draft: string;
  savedNotes: SavedNoteItem[];
  selectionNoteId?: string | null;
  selectionText?: string;
  selectionUnavailable?: boolean;
  onCancelComposer: () => void;
  onClose: () => void;
  onDeleteSavedNote: (noteId: string) => void;
  onDraftChange: (value: string) => void;
  onEditSavedNote: (noteId: string) => void;
  onOpenSavedNote: (noteId: string) => void;
  onSave: () => void;
};

function getAnnotationColorDotClass(color: AnnotationColor) {
  if (color === 'red') return 'bg-[#ff5d5d]';
  if (color === 'green') return 'bg-[#18dd78]';
  if (color === 'blue') return 'bg-[#1ea7fd]';
  return 'bg-[#ffc62b]';
}

function getSavedNoteTitle(savedNote: SavedNoteItem) {
  const title = savedNote.selection.text.trim();

  return title || `${savedNote.blockLabel} note`;
}

export function NotesSheetPanel({
  draft,
  savedNotes,
  selectionNoteId = null,
  selectionText,
  selectionUnavailable = false,
  onCancelComposer,
  onClose,
  onDeleteSavedNote,
  onDraftChange,
  onEditSavedNote,
  onOpenSavedNote,
  onSave,
}: NotesSheetPanelProps) {
  const composerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const isEditingExistingNote = Boolean(
    selectionNoteId && savedNotes.some((savedNote) => savedNote.id === selectionNoteId)
  );
  const hasComposer = !selectionUnavailable;
  const shouldShowSavedNotes = !hasComposer;
  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedNotes;
    }

    return savedNotes.filter((savedNote) =>
      `${savedNote.blockLabel} ${savedNote.selection.text} ${savedNote.note}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [savedNotes, searchQuery]);

  useEffect(() => {
    if (selectionNoteId) {
      composerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectionNoteId]);

  useEffect(() => {
    if (!openActionMenuId) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('[data-note-actions-menu]')) {
        return;
      }

      setOpenActionMenuId(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenActionMenuId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openActionMenuId]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="z-[94] bg-black/18"
        className="z-[95] border-l border-stone-200 bg-[#fcfcfb] p-0 dark:border-white/10 dark:bg-[#0f0f10] sm:max-w-[26rem]"
      >
        <div className="flex h-full flex-col" data-writing-notes-sheet>
          <SheetHeader className="gap-3 border-b border-stone-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),transparent_28%),#ffffff] px-5 pb-4 pt-5 text-left dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),transparent_28%),#111111]">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <SheetTitle className="text-[18px] font-semibold leading-6 tracking-[-0.02em] text-stone-900 dark:text-white">
                  Notes
                </SheetTitle>
              </div>

              <div className="flex items-center">
                <div className={cn('rounded-full p-1 shadow-lg dark:shadow-none', PRACTICE_HEADER_RING_CLASS)}>
                  <button
                    type="button"
                    aria-label="Close notes"
                    onClick={onClose}
                    className="inline-flex size-8.5 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white"
                  >
                    <X className="size-3" strokeWidth={2.1} />
                  </button>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="border-b border-stone-200/80 bg-stone-50/90 px-5 py-4 dark:border-white/10 dark:bg-white/4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 dark:text-white/35"
                strokeWidth={2}
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search your notes..."
                className="h-12 w-full rounded-full border border-stone-200 bg-white pl-4 pr-12 text-[15px] text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/28 dark:focus:border-white/18 dark:focus:ring-white/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {hasComposer ? (
              <section
                ref={composerRef}
                className="border-b border-dashed border-stone-200 px-5 py-5 dark:border-white/10"
              >
                <div className="rounded-[1rem] bg-stone-100 px-4 py-3 dark:bg-white/6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/42">
                    {isEditingExistingNote ? 'Editing note' : 'Selected text'}
                  </p>

                  {selectionNoteId ? (
                    <button
                      type="button"
                      onClick={() => onOpenSavedNote(selectionNoteId)}
                      className="mt-2 line-clamp-3 text-left text-[15px] font-semibold text-stone-900 underline decoration-stone-400 decoration-1 underline-offset-4 transition-colors hover:text-stone-600 dark:text-white dark:decoration-white/35 dark:hover:text-[#ffc85a]"
                    >
                      {selectionText}
                    </button>
                  ) : (
                    <p className="mt-2 text-[15px] leading-7 text-stone-700 dark:text-white/72">
                      {selectionText}
                    </p>
                  )}
                </div>

                <textarea
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  placeholder="Write a quick reminder, idea, or structure note..."
                  rows={5}
                  className="mt-3 w-full resize-none rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-[14px] leading-7 text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/28 dark:focus:border-white/20 dark:focus:ring-white/10"
                />

                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="black"
                    className="h-9 rounded-md px-3.5 text-[15px]"
                    onClick={onSave}
                    disabled={!draft.trim()}
                  >
                    {isEditingExistingNote ? 'Save changes' : 'Save note'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-md border-stone-300 bg-white px-3.5 text-[15px] text-stone-700 hover:bg-stone-50 dark:border-white/12 dark:bg-white/6 dark:text-white/75 dark:hover:bg-white/10"
                    onClick={onCancelComposer}
                  >
                    Cancel
                  </Button>
                </div>
              </section>
            ) : null}

            {shouldShowSavedNotes ? (
              <section className="px-5 py-5">
                {filteredNotes.length ? (
                  <div className="space-y-3">
                    {filteredNotes.map((savedNote) => (
                      <article
                        key={savedNote.id}
                        className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111111]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onOpenSavedNote(savedNote.id)}
                              className="flex min-w-0 items-center gap-2 text-left text-[15px] font-semibold text-stone-900 underline decoration-stone-400 decoration-1 underline-offset-4 transition-colors hover:text-stone-600 dark:text-white dark:decoration-white/35 dark:hover:text-[#ffc85a]"
                            >
                              <span
                                className={cn(
                                  'size-2 shrink-0 rounded-full',
                                  getAnnotationColorDotClass(savedNote.color)
                                )}
                              />
                              <span className="line-clamp-2 min-w-0">
                                {getSavedNoteTitle(savedNote)}
                              </span>
                            </button>
                          </div>

                          <div className="relative" data-note-actions-menu>
                            <button
                              type="button"
                              aria-label="Open note actions"
                              aria-expanded={openActionMenuId === savedNote.id}
                              onClick={() =>
                                setOpenActionMenuId((currentId) =>
                                  currentId === savedNote.id ? null : savedNote.id
                                )
                              }
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white"
                            >
                              <EllipsisVertical className="size-4" strokeWidth={2} />
                            </button>

                            {openActionMenuId === savedNote.id ? (
                              <div className="absolute right-0 top-10 z-[110] w-36 rounded-xl border border-stone-200 bg-white p-1.5 text-stone-900 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#141414] dark:text-white dark:shadow-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    onEditSavedNote(savedNote.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:text-white dark:hover:bg-white/8"
                                >
                                  <PencilLine className="size-4" strokeWidth={2} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    onDeleteSavedNote(savedNote.id);
                                  }}
                                  className="mt-1 flex w-full items-center gap-2 rounded-lg bg-[#5a2a28] px-2.5 py-2 text-left text-sm font-medium text-[#ff6e6e] transition-colors hover:bg-[#69302d] dark:bg-[#5a2a28] dark:text-[#ff6e6e] dark:hover:bg-[#69302d]"
                                >
                                  <Trash2 className="size-4" strokeWidth={2} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-6 text-stone-700 dark:text-white/72">
                          {savedNote.note}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-stone-200 bg-white px-5 py-6 text-center dark:border-white/10 dark:bg-[#111111]">
                    <p className="text-[16px] font-semibold leading-6 text-stone-900 dark:text-white">
                      {savedNotes.length ? 'No matching notes' : 'No saved notes yet'}
                    </p>
                    <p className="mt-2 text-[14px] leading-7 text-stone-400 dark:text-white/35">
                      {savedNotes.length
                        ? 'Try another search term or clear the current search.'
                        : 'Select some text and save a note. It will appear here.'}
                    </p>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
