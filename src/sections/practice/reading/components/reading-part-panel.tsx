'use client';

import type { ReactNode } from 'react';
import type { TextAnnotation } from '@/src/sections/practice/writing/components/writing-task-panel.shared';
import type { Answers, ReadingPart } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useMemo, useState, useCallback } from 'react';
import { READING_OPEN_NOTES_EVENT } from '@/src/layouts/practice';
import { QuestionGroupRenderer } from '@/src/sections/practice/listening/components/question-types';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';
import { usePracticeTextAnnotations } from '@/src/sections/practice/shared/use-practice-text-annotations';
import { ANNOTATION_STYLES } from '@/src/sections/practice/writing/components/writing-annotated-text-block';
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

function ReadingPanelHeader({
  description,
  title,
}: {
  description: ReactNode;
  title: ReactNode;
}) {
  const textSize = usePracticeTextSize();

  return (
    <div className="shrink-0 border-b border-[#dfdfdf] px-3 py-2.5 dark:border-white/10 sm:px-4">
      <div className="grid min-h-16 content-center gap-1.5">
        <h2
          style={getPracticeTextStyle(textSize, 'heading')}
          className="truncate font-semibold tracking-[-0.03em] text-stone-900 dark:text-white"
        >
          {title}
        </h2>
        <div
          style={getPracticeTextStyle(textSize, 'body-compact')}
          className="truncate text-stone-600 dark:text-white/62"
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function getPassageParagraphs(passageText: string) {
  return passageText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitPassageParagraph(paragraph: string) {
  const match = paragraph.match(/^([A-Z])(?:[.)])?\s+([\s\S]+)$/);

  if (!match) {
    return {
      label: null,
      text: paragraph,
    };
  }

  return {
    label: match[1],
    text: match[2].trim(),
  };
}

function hasHtmlMarkup(value?: string) {
  return Boolean(value && /<\/?[a-z][\s\S]*>/i.test(value));
}

function sanitizePassageHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/\s+on\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)=(["'])\s*javascript:[\s\S]*?\2/gi, '');
}

function renderAnnotatedHtml({
  annotations,
  blockId,
  focusedAnnotationId,
  html,
}: {
  annotations: TextAnnotation[];
  blockId: string;
  focusedAnnotationId: string | null;
  html: string;
}) {
  if (typeof window === 'undefined' || !annotations.length) {
    return html;
  }

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = documentFragment.body.firstElementChild;

  if (!root) {
    return html;
  }

  const sortedAnnotations = annotations
    .filter((annotation) => annotation.blockId === blockId && annotation.end > annotation.start)
    .sort((left, right) => left.start - right.start);

  if (!sortedAnnotations.length) {
    return html;
  }

  const textNodes: Text[] = [];
  const walker = documentFragment.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  let cursor = 0;

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? '';
    const nodeStart = cursor;
    const nodeEnd = cursor + text.length;
    const relevantAnnotations = sortedAnnotations.filter(
      (annotation) => annotation.start < nodeEnd && annotation.end > nodeStart
    );

    cursor = nodeEnd;

    if (!relevantAnnotations.length) {
      return;
    }

    const fragment = documentFragment.createDocumentFragment();
    let localCursor = 0;

    relevantAnnotations.forEach((annotation) => {
      const localStart = Math.max(0, annotation.start - nodeStart);
      const localEnd = Math.min(text.length, annotation.end - nodeStart);

      if (localStart > localCursor) {
        fragment.append(documentFragment.createTextNode(text.slice(localCursor, localStart)));
      }

      const markedText = text.slice(localStart, localEnd);

      if (markedText) {
        const span = documentFragment.createElement('span');
        span.dataset.writingAnnotationId = annotation.id;
        span.className = cn(
          'rounded-[0.45rem] px-0.5 py-0.5 text-inherit transition-[color,box-shadow,background-color] duration-200',
          ANNOTATION_STYLES[annotation.color],
          annotation.note && 'underline decoration-dotted decoration-2 underline-offset-[0.28em]',
          focusedAnnotationId === annotation.id &&
            'shadow-[0_0_0_2px_rgba(255,179,71,0.6)] dark:shadow-[0_0_0_2px_rgba(255,200,90,0.45)]'
        );
        if (annotation.note) {
          span.title = 'This highlight has a note';
        }
        span.textContent = markedText;
        fragment.append(span);
      }

      localCursor = localEnd;
    });

    if (localCursor < text.length) {
      fragment.append(documentFragment.createTextNode(text.slice(localCursor)));
    }

    textNode.replaceWith(fragment);
  });

  return root.innerHTML;
}

function AnnotatedPassageContent({
  annotations,
  focusedAnnotationId,
  part,
  renderAnnotatedTextBlock,
}: {
  annotations: TextAnnotation[];
  focusedAnnotationId: string | null;
  part: ReadingPart;
  renderAnnotatedTextBlock: ReturnType<typeof usePracticeTextAnnotations>['renderAnnotatedTextBlock'];
}) {
  const textSize = usePracticeTextSize();
  const paragraphs = getPassageParagraphs(part.passageText);
  const passageHtml = useMemo(
    () => (hasHtmlMarkup(part.passageHtml) ? sanitizePassageHtml(part.passageHtml ?? '') : ''),
    [part.passageHtml]
  );
  const htmlBlockId = `reading-part-${part.number}-passage-html`;
  const annotatedPassageHtml = useMemo(
    () =>
      renderAnnotatedHtml({
        annotations,
        blockId: htmlBlockId,
        focusedAnnotationId,
        html: passageHtml,
      }),
    [annotations, focusedAnnotationId, htmlBlockId, passageHtml]
  );

  if (passageHtml) {
    return (
      <div
        data-writing-block-id={htmlBlockId}
        style={getPracticeTextStyle(textSize, 'body')}
        className={cn(
          'max-w-4xl text-stone-800 dark:text-white/84',
          '[&_a]:font-medium [&_a]:text-sky-700 [&_a]:underline dark:[&_a]:text-sky-300',
          '[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-stone-300 [&_blockquote]:pl-4 [&_blockquote]:text-stone-700 dark:[&_blockquote]:border-white/20 dark:[&_blockquote]:text-white/72',
          '[&_em]:italic [&_strong]:font-semibold',
          '[&_h1]:mb-5 [&_h1]:font-semibold [&_h1]:tracking-[-0.03em] [&_h1]:text-stone-900 dark:[&_h1]:text-white',
          '[&_h2]:mb-4 [&_h2]:mt-7 [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-stone-900 dark:[&_h2]:text-white',
          '[&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-stone-900 dark:[&_h3]:text-white',
          '[&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6'
        )}
        dangerouslySetInnerHTML={{ __html: annotatedPassageHtml }}
      />
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {paragraphs.length ? (
        paragraphs.map((paragraph, index) => {
          const { label, text } = splitPassageParagraph(paragraph);

          if (label) {
            return (
              <div key={`${part.number}-${index}`} className="flex items-start gap-3">
                <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700 dark:bg-white/10 dark:text-white/78">
                  {label}
                </span>
                {renderAnnotatedTextBlock({
                  as: 'p',
                  blockId: `reading-part-${part.number}-passage-${index}`,
                  className: 'min-w-0 flex-1 text-stone-800 dark:text-white/84',
                  style: getPracticeTextStyle(textSize, 'body'),
                  text,
                })}
              </div>
            );
          }

          return renderAnnotatedTextBlock({
            as: 'p',
            blockId: `reading-part-${part.number}-passage-${index}`,
            className: 'text-stone-800 dark:text-white/84',
            style: getPracticeTextStyle(textSize, 'body'),
            text,
          });
        })
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
  const [mobileTab, setMobileTab] = useState<MobileTab>('passage');
  const [annotationsByPartId, setAnnotationsByPartId] = useState<Record<string, TextAnnotation[]>>(
    {}
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_PERCENT);
  const [isDragging, setIsDragging] = useState(false);
  const currentAnnotations = annotationsByPartId[part.number] ?? [];
  const passageParagraphs = useMemo(() => getPassageParagraphs(part.passageText), [part.passageText]);
  const hasPassageHtml = hasHtmlMarkup(part.passageHtml);
  const annotationBlocks = useMemo(
    () =>
      Object.fromEntries([
        [
          `reading-part-${part.number}-scenario`,
          {
            label: 'Passage Overview',
            text: part.scenario,
          },
        ],
        ...(hasPassageHtml
          ? [
              [
                `reading-part-${part.number}-passage-html`,
                {
                  label: 'Reading Passage',
                  text: part.passageText,
                },
              ],
            ]
          : []),
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
    [
      hasPassageHtml,
      part.groups,
      part.number,
      part.passageText,
      part.scenario,
      passageParagraphs,
    ]
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
  const { floatingUi, focusedAnnotationId, renderAnnotatedTextBlock, rootRef } = annotations;
  const questionsHeaderDescription = renderAnnotatedTextBlock({
    as: 'span',
    blockId: `reading-part-${part.number}-scenario`,
    text: part.scenario,
  });

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

  const questionsBody = (
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
  );

  return (
    <div ref={rootRef} className="h-full min-h-0">
      {/* ── Mobile / tablet: tab switcher ── */}
      <div className="flex flex-col gap-0 lg:hidden">
        {/* Tab bar */}
        <div className="sticky top-16 z-30 flex border-b border-stone-200 bg-white dark:border-white/10 dark:bg-background">
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
        <div className="pt-2">
          {mobileTab === 'passage' ? (
            <article className="space-y-4 py-4">
              <ReadingPanelHeader description={`Passage ${part.number}`} title="Reading passage" />
              <AnnotatedPassageContent
                annotations={currentAnnotations}
                focusedAnnotationId={focusedAnnotationId}
                part={part}
                renderAnnotatedTextBlock={renderAnnotatedTextBlock}
              />
            </article>
          ) : (
            <article className="space-y-4 py-4">
              <ReadingPanelHeader description={questionsHeaderDescription} title="Questions" />
              {questionsBody}
            </article>
          )}
        </div>
      </div>

      {/* ── Desktop (xl+): side-by-side with draggable resizer ── */}
      <div
        ref={containerRef}
        className={cn(
          'relative hidden h-full overflow-hidden lg:flex lg:items-stretch',
          isDragging && 'select-none'
        )}
      >
        <div
          className="min-h-0 shrink-0"
          style={{ width: `calc(${splitPercent}% - 6px)` }}
        >
          <PaperSurface radius={8} className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-none dark:border-white/10 dark:bg-[#1f1f1f]">
            <ReadingPanelHeader description={`Passage ${part.number}`} title="Reading passage" />
            <article className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <AnnotatedPassageContent
                annotations={currentAnnotations}
                focusedAnnotationId={focusedAnnotationId}
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
          className="group relative flex w-3 shrink-0 cursor-col-resize items-center justify-center"
        >
          <div
            className={cn(
              'w-[3px] rounded-full group-hover:h-full group-hover:rounded-none',
              isDragging
                ? 'h-full rounded-none bg-[#0a84ff]'
                : 'h-10 bg-stone-300 group-hover:bg-stone-400 dark:bg-[#3f3f3f] dark:group-hover:bg-[#5a5a5a]'
            )}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-none dark:border-white/10 dark:bg-[#1f1f1f]">
          <ReadingPanelHeader description={questionsHeaderDescription} title="Questions" />
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
            {questionsBody}
          </div>
        </div>
      </div>
      {floatingUi}
    </div>
  );
}
