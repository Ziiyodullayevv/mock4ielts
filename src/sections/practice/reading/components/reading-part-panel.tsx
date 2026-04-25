'use client';

import type { TextAnnotation } from '@/src/sections/practice/writing/components/writing-task-panel.shared';
import type { Answers, ReadingPart } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useMemo, useState, useCallback } from 'react';
import { READING_OPEN_NOTES_EVENT } from '@/src/layouts/practice';
import { QuestionGroupRenderer } from '@/src/sections/practice/listening/components/question-types';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';
import { usePracticeTextAnnotations } from '@/src/sections/practice/shared/use-practice-text-annotations';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';
import { buildQuestionGroupAnnotationBlocks } from '@/src/sections/practice/listening/components/question-types/annotation-blocks';

type ReadingPartPanelProps = {
  activeQuestionId?: string | null;
  answers: Answers;
  onChange: (id: string, value: string) => void;
  part: ReadingPart;
  showAnswer?: boolean;
};

const MIN_PANEL_PERCENT = 20;
const DEFAULT_SPLIT_PERCENT = 50;

type MobileTab = 'passage' | 'questions';

function getPassageParagraphs(passageText: string) {
  return passageText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function AnnotatedPassageContent({
  part,
  renderAnnotatedTextBlock,
}: {
  part: ReadingPart;
  renderAnnotatedTextBlock: ReturnType<typeof usePracticeTextAnnotations>['renderAnnotatedTextBlock'];
}) {
  const textSize = usePracticeTextSize();
  const paragraphs = getPassageParagraphs(part.passageText);

  return (
    <div className="space-y-5">
      {paragraphs.length ? (
        paragraphs.map((paragraph, index) =>
          renderAnnotatedTextBlock({
            as: 'p',
            blockId: `reading-part-${part.number}-passage-${index}`,
            className: cn(
              'text-stone-800 dark:text-white/84',
              paragraph.match(/^[A-Z]\s+/) ? 'font-medium' : ''
            ),
            style: getPracticeTextStyle(textSize, 'body'),
            text: paragraph,
          })
        )
      ) : (
        renderAnnotatedTextBlock({
          as: 'p',
          blockId: `reading-part-${part.number}-passage-0`,
          className: 'text-stone-800 dark:text-white/84',
          style: getPracticeTextStyle(textSize, 'body'),
          text: part.passageText,
        })
      )}
    </div>
  );
}

export function ReadingPartPanel({
  activeQuestionId,
  answers,
  onChange,
  part,
  showAnswer,
}: ReadingPartPanelProps) {
  const textSize = usePracticeTextSize();
  const [mobileTab, setMobileTab] = useState<MobileTab>('passage');
  const [annotationsByPartId, setAnnotationsByPartId] = useState<Record<string, TextAnnotation[]>>(
    {}
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_PERCENT);
  const [isDragging, setIsDragging] = useState(false);
  const currentAnnotations = annotationsByPartId[part.number] ?? [];
  const passageParagraphs = useMemo(() => getPassageParagraphs(part.passageText), [part.passageText]);
  const annotationBlocks = useMemo(
    () =>
      Object.fromEntries([
        [
          `reading-part-${part.number}-title`,
          {
            label: 'Part Title',
            text: part.title,
          },
        ],
        [
          `reading-part-${part.number}-scenario`,
          {
            label: 'Passage Overview',
            text: part.scenario,
          },
        ],
        ...passageParagraphs.map((paragraph, index) => [
          `reading-part-${part.number}-passage-${index}`,
          {
            label: `Passage ${index + 1}`,
            text: paragraph,
          },
        ]),
        ...part.groups.map((group, groupIndex) => [
          `reading-part-${part.number}-group-${groupIndex}-instructions`,
          {
            label: `Instructions ${groupIndex + 1}`,
            text: group.instructions,
          },
        ]),
        ...part.groups.flatMap((group, groupIndex) =>
          buildQuestionGroupAnnotationBlocks(`reading-part-${part.number}-group-${groupIndex}`, group)
        ),
      ]),
    [part.groups, part.number, part.scenario, part.title, passageParagraphs]
  );
  const annotations = usePracticeTextAnnotations({
    annotations: currentAnnotations,
    blocks: annotationBlocks,
    onAnnotationsChange: (nextAnnotations) =>
      setAnnotationsByPartId((previousState) => ({
        ...previousState,
        [part.number]: nextAnnotations,
      })),
    openNotesEventName: READING_OPEN_NOTES_EVENT,
  });
  const { floatingUi, renderAnnotatedTextBlock, rootRef } = annotations;

  const handleResizerMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const rawPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(100 - MIN_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, rawPercent));
      setSplitPercent(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const questionsContent = (
    <div className="space-y-6">
      <div className="space-y-2.5 border-b border-stone-200 pb-4 dark:border-white/10">
        <h3
          style={getPracticeTextStyle(textSize, 'heading')}
          className="font-semibold tracking-[-0.03em] text-stone-800 dark:text-white"
        >
          {renderAnnotatedTextBlock({
            as: 'span',
            blockId: `reading-part-${part.number}-title`,
            text: part.title,
          })}
        </h3>
        {renderAnnotatedTextBlock({
          as: 'p',
          blockId: `reading-part-${part.number}-scenario`,
          className: 'max-w-5xl text-stone-600 dark:text-white/62',
          style: getPracticeTextStyle(textSize, 'body-compact'),
          text: part.scenario,
        })}
      </div>

      <div className="space-y-8">
        {part.groups.map((group, groupIndex) => (
          <div key={`${part.number}-${group.type}-${groupIndex}`} className="space-y-4">
            <QuestionGroupRenderer
              activeQuestionId={activeQuestionId}
              answers={answers}
              group={group}
              onChange={onChange}
              annotationBlockIdPrefix={`reading-part-${part.number}-group-${groupIndex}`}
              renderAnnotatedTextBlock={renderAnnotatedTextBlock}
              showAnswer={showAnswer}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={rootRef}>
      {/* ── Mobile / tablet: tab switcher ── */}
      <div className="flex flex-col gap-0 lg:hidden">
        {/* Tab bar */}
        <div className="sticky top-14 z-10 flex border-b border-stone-200 bg-white dark:border-white/10 dark:bg-background">
          <button
            type="button"
            onClick={() => setMobileTab('passage')}
            className={cn(
              'flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'passage'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:border-white dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-white/52 dark:hover:text-white/78'
            )}
          >
            Passage
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('questions')}
            className={cn(
              'flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'questions'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:border-white dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-white/52 dark:hover:text-white/78'
            )}
          >
            Questions
          </button>
        </div>

        {/* Tab content */}
        <div className="pt-4">
          {mobileTab === 'passage' ? (
            <PaperSurface className="overflow-hidden">
              <div className="border-b border-[#dfdfdf] px-5 py-4 dark:border-white/10 sm:px-6">
                <div className="space-y-2.5">
                  <p
                    style={getPracticeTextStyle(textSize, 'eyebrow')}
                    className="font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/42"
                  >
                    {part.title}
                  </p>
                  <h2
                    style={getPracticeTextStyle(textSize, 'heading-large')}
                    className="font-semibold tracking-[-0.03em] text-stone-900 dark:text-white"
                  >
                    Reading passage
                  </h2>
                  {renderAnnotatedTextBlock({
                    as: 'p',
                    blockId: `reading-part-${part.number}-scenario`,
                    className: 'text-stone-600 dark:text-white/62',
                    style: getPracticeTextStyle(textSize, 'body-compact'),
                    text: part.scenario,
                  })}
                </div>
              </div>
              <article className="px-5 py-5 sm:px-6">
                <AnnotatedPassageContent
                  part={part}
                  renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                />
              </article>
            </PaperSurface>
          ) : (
            questionsContent
          )}
        </div>
      </div>

      {/* ── Desktop (xl+): side-by-side with draggable resizer ── */}
      <div
        ref={containerRef}
        className={cn('relative hidden lg:flex lg:items-start', isDragging && 'select-none')}
      >
        {/* Full-height divider line — absolutely positioned in the container so it never
            overflows at the bottom. Extends upward behind the sticky header via negative top. */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-150',
            isDragging
              ? 'bg-[linear-gradient(180deg,rgba(255,200,90,0.95)_0%,rgba(255,159,47,0.9)_55%,rgba(255,120,75,0.85)_100%)]'
              : 'bg-stone-200 dark:bg-white/10'
          )}
          style={{
            left: `${splitPercent}%`,
            top: '-6rem',
          }}
        />

        {/* Left: sticky passage panel — subtract half of resizer width so the
            resizer's centre lands exactly on splitPercent% of the container */}
        <div
          className="sticky top-28 shrink-0"
          style={{ width: `calc(${splitPercent}% - 10px)` }}
        >
          <PaperSurface className="overflow-hidden">
            <div className="border-b border-[#dfdfdf] px-5 py-4 dark:border-white/10 sm:px-6">
              <div className="space-y-2.5">
                <p
                  style={getPracticeTextStyle(textSize, 'eyebrow')}
                  className="font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/42"
                >
                  {part.title}
                </p>
                <h2
                  style={getPracticeTextStyle(textSize, 'heading')}
                  className="font-semibold tracking-[-0.03em] text-stone-900 dark:text-white"
                >
                  Reading passage
                </h2>
                {renderAnnotatedTextBlock({
                  as: 'p',
                  blockId: `reading-part-${part.number}-scenario`,
                  className: 'text-stone-600 dark:text-white/62',
                  style: getPracticeTextStyle(textSize, 'body-compact'),
                  text: part.scenario,
                })}
              </div>
            </div>
            <article className="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-5 sm:px-6">
              <AnnotatedPassageContent
                part={part}
                renderAnnotatedTextBlock={renderAnnotatedTextBlock}
              />
            </article>
          </PaperSurface>
        </div>

        {/* Resizer handle — sticky, only the grip pill (line is handled above) */}
        <div
          role="separator"
          aria-label="Drag to resize panels"
          aria-orientation="vertical"
          onMouseDown={handleResizerMouseDown}
          className="group sticky top-[calc(50vh-22px)] w-5 shrink-0 cursor-col-resize flex items-center justify-center"
        >
          <div
            className={cn(
              'relative z-10 flex flex-col items-center gap-0.75 rounded-full border bg-white px-0.75 py-2 shadow-sm transition-all duration-150 dark:border-white/10 dark:bg-[#131313] dark:shadow-none',
              isDragging
                ? 'border-[#ffb347] shadow-[0_0_0_1px_rgba(255,179,71,0.24)] dark:border-[#ffb347] dark:shadow-none'
                : 'border-stone-200 group-hover:border-stone-300 group-hover:shadow-md dark:group-hover:border-white/20 dark:group-hover:shadow-none'
            )}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-0.75 w-0.75 rounded-full transition-colors',
                  isDragging
                    ? 'bg-[#ff9f2f] dark:bg-[#ffb347]'
                    : 'bg-stone-400 group-hover:bg-stone-600 dark:bg-white/34 dark:group-hover:bg-white/68'
                )}
              />
            ))}
          </div>
        </div>

        {/* Right: questions (scrolls with page) */}
        <div className="min-w-0 flex-1">
          {questionsContent}
        </div>
      </div>
      {floatingUi}
    </div>
  );
}
