'use client';

import type {
  SavedNoteItem,
  AnnotationColor,
  AnnotationBlockId,
} from './writing-task-panel.shared';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { X, CheckCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/src/components/ui/sheet';

type NotesSheetView = 'all' | 'saved' | 'selected';

type NotesSheetPanelProps = {
  draft: string;
  selectionText?: string;
  selectionUnavailable?: boolean;
  savedNotes: SavedNoteItem[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onOpenSavedNote: (noteId: string) => void;
  onSave: () => void;
};

function getBlockAvatar(blockId: AnnotationBlockId) {
  if (blockId === 'instructions') {
    return {
      className: 'bg-amber-100 text-amber-700',
      label: 'I',
    };
  }

  if (blockId === 'model-answer') {
    return {
      className: 'bg-emerald-100 text-emerald-700',
      label: 'M',
    };
  }

  return {
    className: 'bg-sky-100 text-sky-700',
    label: 'P',
  };
}

function getAnnotationColorDotClass(color: AnnotationColor) {
  if (color === 'red') return 'bg-[#ff5d5d]';
  if (color === 'green') return 'bg-[#18dd78]';
  if (color === 'blue') return 'bg-[#1ea7fd]';
  return 'bg-[#ffc62b]';
}

export function NotesSheetPanel({
  draft,
  selectionText,
  selectionUnavailable = false,
  savedNotes,
  onClose,
  onDraftChange,
  onOpenSavedNote,
  onSave,
}: NotesSheetPanelProps) {
  const [activeView, setActiveView] = useState<NotesSheetView>(() => {
    if (selectionUnavailable && savedNotes.length) return 'saved';
    if (!selectionUnavailable && !savedNotes.length) return 'selected';
    return 'all';
  });

  const viewOptions = [
    {
      badgeClassName: 'bg-stone-900 text-white',
      count: savedNotes.length + (selectionUnavailable ? 0 : 1),
      label: 'All',
      value: 'all' as const,
    },
    {
      badgeClassName: 'bg-sky-500/14 text-sky-700',
      count: selectionUnavailable ? 0 : 1,
      label: 'Selected',
      value: 'selected' as const,
    },
    {
      badgeClassName: 'bg-emerald-500/14 text-emerald-700',
      count: savedNotes.length,
      label: 'Saved',
      value: 'saved' as const,
    },
  ];

  const showSelectionPanel = activeView !== 'saved';
  const showSavedNotes = activeView !== 'selected';

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="z-[94] bg-black/18"
        className="z-[95] w-full border-l border-stone-200 bg-[#fcfcfb] p-0 sm:max-w-[26rem]"
      >
        <div className="flex h-full flex-col" data-writing-notes-sheet>
          <SheetHeader className="gap-3 border-b border-stone-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),transparent_28%),#ffffff] px-5 pb-4 pt-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SheetTitle className="text-[16px] font-semibold leading-6 tracking-[-0.02em] text-stone-900">
                  Notes
                </SheetTitle>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/70 bg-white/85 px-2.5 text-[14px] font-semibold text-stone-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                  <CheckCheck className="size-3.5 text-emerald-500" strokeWidth={2.1} />
                  <span>{savedNotes.length}</span>
                </div>

                <button
                  type="button"
                  aria-label="Close notes"
                  onClick={onClose}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-colors hover:text-stone-900"
                >
                  <X className="size-3" strokeWidth={2.1} />
                </button>
              </div>
            </div>
          </SheetHeader>

          <div className="border-b border-stone-200/80 bg-stone-50/90 px-5 py-2.5">
            <div className="grid grid-cols-3 gap-1">
              {viewOptions.map((option) => {
                const isActive = activeView === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveView(option.value)}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-[14px] font-semibold leading-5 transition-all',
                      isActive
                        ? 'bg-white text-stone-900 shadow-[0_8px_18px_rgba(15,23,42,0.06)] ring-1 ring-stone-200/80'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    <span>{option.label}</span>
                    <span
                      className={cn(
                        'inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-[13px] leading-5',
                        isActive ? option.badgeClassName : 'bg-stone-200 text-stone-600'
                      )}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showSelectionPanel ? (
              <section className="border-b border-dashed border-stone-200 px-5 py-4">
                <div className="rounded-[1rem] bg-stone-100 px-4 py-3 text-[14px] leading-7 text-stone-600">
                  {selectionText || "Notes qo'shish uchun matndan kerakli joyni belgilang."}
                </div>

                <textarea
                  value={draft}
                  disabled={selectionUnavailable}
                  onChange={(event) => onDraftChange(event.target.value)}
                  placeholder="Write a quick reminder, idea, or structure note..."
                  rows={5}
                  className="mt-3 w-full resize-none rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-[14px] leading-7 text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
                />

                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="black"
                    className="h-9 rounded-md px-3.5 text-[15px]"
                    onClick={onSave}
                    disabled={selectionUnavailable}
                  >
                    Save note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-md border-stone-300 bg-white px-3.5 text-[15px] text-stone-700 hover:bg-stone-50"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </section>
            ) : null}

            {showSavedNotes ? (
              savedNotes.length ? (
                <div>
                  {savedNotes.map((savedNote) => {
                    const avatar = getBlockAvatar(savedNote.selection.blockId);

                    return (
                      <button
                        key={savedNote.id}
                        type="button"
                        onClick={() => {
                          setActiveView('selected');
                          onOpenSavedNote(savedNote.id);
                        }}
                        className="group block w-full border-b border-dashed border-stone-200 px-5 py-4 text-left transition-colors hover:bg-stone-50/70 last:border-b-0"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={cn(
                              'mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold',
                              avatar.className
                            )}
                          >
                            {avatar.label}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[16px] leading-6 text-stone-900">
                                  <span className="font-semibold">{savedNote.blockLabel}</span> note
                                </p>
                                <p className="mt-1 text-[14px] leading-6 text-stone-400">Saved highlight</p>
                              </div>

                              <span
                                className={cn(
                                  'mt-2 size-2.5 shrink-0 rounded-full',
                                  getAnnotationColorDotClass(savedNote.color)
                                )}
                              />
                            </div>

                            <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-stone-700">
                              {savedNote.selection.text}
                            </p>

                            <div className="mt-3 rounded-[1rem] bg-stone-100 px-4 py-3 text-[14px] leading-7 text-stone-600">
                              {savedNote.note}
                            </div>

                            <div className="mt-3">
                              <span className="inline-flex rounded-md bg-stone-900 px-3.5 py-1.5 text-[15px] font-semibold leading-6 text-white transition-colors group-hover:bg-stone-800">
                                Open note
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-8">
                  <div className="rounded-[1rem] border border-dashed border-stone-200 bg-white px-5 py-6 text-center">
                    <p className="text-[16px] font-semibold leading-6 text-stone-900">
                      No saved notes yet
                    </p>
                    <p className="mt-2 text-[14px] leading-7 text-stone-400">
                      Matnni belgilang va note qo&apos;shib saqlang, keyin shu yerda
                      ko&apos;rinadi.
                    </p>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
