'use client';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useRef, useMemo, useState, useEffect } from 'react';
import { X, Search, Trash2, PencilLine, EllipsisVertical } from 'lucide-react';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import { Sheet, SheetTitle, SheetHeader, SheetContent } from '@/src/components/ui/sheet';

export const LISTENING_OPEN_NOTES_EVENT = 'mock4ielts:listening-open-notes';
export const READING_OPEN_NOTES_EVENT = 'mock4ielts:reading-open-notes';

type PracticeHeaderNotesButtonProps = {
  eventName: string;
  mobile?: boolean;
};

type PracticeNotesSheetProps = {
  description: string;
  openEvent: string;
  placeholder: string;
  storageKey: string;
  title: string;
};

type SavedPracticeNote = {
  id: string;
  note: string;
  updatedAt: number;
};

function dispatchNotesOpenEvent(eventName: string) {
  window.dispatchEvent(new CustomEvent(eventName));
}

function createPracticeNoteId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getSavedPracticeNotes(rawValue: string | null): SavedPracticeNote[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (item): item is Partial<SavedPracticeNote> =>
          Boolean(item) && typeof item === 'object'
      )
      .map((item, index) => ({
        id:
          typeof item.id === 'string' && item.id.trim()
            ? item.id
            : `legacy-${index}`,
        note: typeof item.note === 'string' ? item.note : '',
        updatedAt:
          typeof item.updatedAt === 'number' && Number.isFinite(item.updatedAt)
            ? item.updatedAt
            : Date.now(),
      }))
      .filter((item) => item.note.trim());
  } catch {
    const legacyNote = rawValue.trim();

    return legacyNote
      ? [
          {
            id: 'legacy-note',
            note: legacyNote,
            updatedAt: Date.now(),
          },
        ]
      : [];
  }
}

function getPracticeNoteTitle(note: SavedPracticeNote) {
  const firstLine = note.note
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return 'Untitled note';
  }

  return firstLine.length > 48 ? `${firstLine.slice(0, 48).trimEnd()}...` : firstLine;
}

function getPracticeNotePreview(note: SavedPracticeNote) {
  const compactText = note.note.replace(/\s+/g, ' ').trim();
  return compactText.length > 120 ? `${compactText.slice(0, 120).trimEnd()}...` : compactText;
}

export function PracticeHeaderNotesButton({
  eventName,
  mobile = false,
}: PracticeHeaderNotesButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open notes"
      title="Open notes"
      onClick={() => dispatchNotesOpenEvent(eventName)}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors',
        mobile
          ? cn(
              'size-10 shadow-lg hover:bg-stone-50 dark:text-white/78 dark:shadow-none dark:hover:bg-white/8 dark:hover:text-white',
              PRACTICE_HEADER_RING_CLASS
            )
          : 'h-9 w-10 hover:bg-stone-100 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
        mobile && 'dark:text-white/78 dark:hover:text-white'
      )}
    >
      <PencilLine className="size-4.5" strokeWidth={2} />
    </button>
  );
}

export function PracticeNotesSheet({
  description,
  openEvent,
  placeholder,
  storageKey,
  title,
}: PracticeNotesSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedPracticeNote[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      return getSavedPracticeNotes(window.localStorage.getItem(storageKey));
    } catch {
      return [];
    }
  });
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const hasPersistedRef = useRef(false);

  useEffect(() => {
    const handleOpenRequest = () => {
      setIsOpen(true);
    };

    window.addEventListener(openEvent, handleOpenRequest);
    return () => window.removeEventListener(openEvent, handleOpenRequest);
  }, [openEvent]);

  useEffect(() => {
    if (!hasPersistedRef.current) {
      hasPersistedRef.current = true;
      return;
    }

    try {
      if (savedNotes.length) {
        window.localStorage.setItem(storageKey, JSON.stringify(savedNotes));
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage access failures and keep notes in-memory.
    }
  }, [savedNotes, storageKey]);

  useEffect(() => {
    if (!openActionMenuId) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('[data-practice-note-actions-menu]')) {
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

  const draftMeta = useMemo(() => {
    const trimmedValue = draft.trim();
    const words = trimmedValue ? trimmedValue.split(/\s+/).length : 0;

    return {
      characters: draft.length,
      words,
    };
  }, [draft]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedNotes;
    }

    return savedNotes.filter((savedNote) =>
      savedNote.note.toLowerCase().includes(normalizedQuery)
    );
  }, [savedNotes, searchQuery]);

  const isEditingExistingNote = Boolean(
    editingNoteId && savedNotes.some((savedNote) => savedNote.id === editingNoteId)
  );

  const saveNote = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    setSavedNotes((currentNotes) => {
      if (editingNoteId) {
        return currentNotes.map((savedNote) =>
          savedNote.id === editingNoteId
            ? {
                ...savedNote,
                note: trimmedDraft,
                updatedAt: Date.now(),
              }
            : savedNote
        );
      }

      return [
        {
          id: createPracticeNoteId(),
          note: trimmedDraft,
          updatedAt: Date.now(),
        },
        ...currentNotes,
      ];
    });

    setDraft('');
    setEditingNoteId(null);
    setOpenActionMenuId(null);
  };

  const resetComposer = () => {
    setDraft('');
    setEditingNoteId(null);
  };

  const openNoteForEditing = (noteId: string) => {
    const targetNote = savedNotes.find((savedNote) => savedNote.id === noteId);

    if (!targetNote) {
      return;
    }

    setDraft(targetNote.note);
    setEditingNoteId(noteId);
    setOpenActionMenuId(null);
  };

  const deleteSavedNote = (noteId: string) => {
    setSavedNotes((currentNotes) => currentNotes.filter((savedNote) => savedNote.id !== noteId));
    setOpenActionMenuId(null);

    if (editingNoteId === noteId) {
      resetComposer();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="z-[94] bg-black/18"
        className="z-[95] border-l border-stone-200 bg-[#fcfcfb] p-0 dark:border-white/10 dark:bg-[#0f0f10] sm:max-w-[26rem]"
      >
        <div className="flex h-full flex-col" data-practice-notes-sheet>
          <SheetHeader className="gap-3 border-b border-stone-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),transparent_28%),#ffffff] px-5 pb-4 pt-5 text-left dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),transparent_28%),#111111]">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <SheetTitle className="text-[18px] font-semibold leading-6 tracking-[-0.02em] text-stone-900 dark:text-white">
                  {title}
                </SheetTitle>
                <p className="text-sm leading-6 text-stone-500 dark:text-white/45">{description}</p>
              </div>

              <div className="flex items-center">
                <div className={cn('rounded-full p-1 shadow-lg dark:shadow-none', PRACTICE_HEADER_RING_CLASS)}>
                  <button
                    type="button"
                    aria-label="Close notes"
                    onClick={() => setIsOpen(false)}
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
            <section className="border-b border-dashed border-stone-200 px-5 py-5 dark:border-white/10">
              <div className="rounded-[1rem] bg-stone-100 px-4 py-3 dark:bg-white/6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/42">
                  {isEditingExistingNote ? 'Editing note' : 'Quick note'}
                </p>
                <p className="mt-2 text-[14px] leading-6 text-stone-600 dark:text-white/58">
                  These notes are saved locally in this browser for this practice mode.
                </p>
              </div>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                rows={6}
                className="mt-3 w-full resize-none rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-[14px] leading-7 text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/28 dark:focus:border-white/20 dark:focus:ring-white/10"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-[12px] text-stone-500 dark:text-white/42">
                  {draftMeta.words} words · {draftMeta.characters} characters
                </div>

                <div className="flex flex-wrap justify-end gap-2.5">
                  {draft || editingNoteId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-white/12 dark:bg-white/6 dark:text-white/75 dark:hover:bg-white/10"
                      onClick={resetComposer}
                    >
                      <span>{editingNoteId ? 'Cancel' : 'Clear'}</span>
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="black"
                    size="sm"
                    className="h-9 rounded-md px-3.5 text-[15px]"
                    onClick={saveNote}
                    disabled={!draft.trim()}
                  >
                    {isEditingExistingNote ? 'Save changes' : 'Save note'}
                  </Button>
                </div>
              </div>
            </section>

            <section className="px-5 py-5">
              {filteredNotes.length ? (
                <div className="space-y-3">
                  {filteredNotes.map((savedNote) => (
                    <article
                      key={savedNote.id}
                      className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111111]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/42">
                            Saved note
                          </p>
                          <p className="mt-1 text-[15px] font-semibold leading-6 text-stone-900 dark:text-white">
                            {getPracticeNoteTitle(savedNote)}
                          </p>
                        </div>

                        <div className="relative" data-practice-note-actions-menu>
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
                                onClick={() => openNoteForEditing(savedNote.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:text-white dark:hover:bg-white/8"
                              >
                                <PencilLine className="size-4" strokeWidth={2} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteSavedNote(savedNote.id)}
                                className="mt-1 flex w-full items-center gap-2 rounded-lg bg-[#5a2a28] px-2.5 py-2 text-left text-sm font-medium text-[#ff6e6e] transition-colors hover:bg-[#69302d] dark:bg-[#5a2a28] dark:text-[#ff6e6e] dark:hover:bg-[#69302d]"
                              >
                                <Trash2 className="size-4" strokeWidth={2} />
                                <span>Delete</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-stone-700 dark:text-white/72">
                        {getPracticeNotePreview(savedNote)}
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
                      : 'Write and save a quick note. It will appear here.'}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
