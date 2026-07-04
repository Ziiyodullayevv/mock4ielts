'use client';

import type { TextAnnotation } from '@/src/sections/practice/writing/components/writing-task-panel.shared';
import type { Part } from '../types';

import { useMemo, useState } from 'react';
import { LISTENING_OPEN_NOTES_EVENT } from '@/src/layouts/practice';
import { usePracticeTextAnnotations } from '@/src/sections/practice/shared/use-practice-text-annotations';
import {
  usePracticeTextSize,
  getPracticeTextStyle,
} from '@/src/sections/practice/shared/practice-text-size';
import {
  INLINE_BOLD_END,
  INLINE_BOLD_START,
  splitInlineFormattedText,
  stripHtmlPreservingInlineFormatting,
} from '@/src/sections/practice/shared/inline-html-formatting';

import { getPartQuestions } from '../utils';
import { QuestionGroupRenderer } from './question-types/index';
import { AudioQuestionNumberProvider } from './question-types/paper-shell';
import { buildQuestionGroupAnnotationBlocks } from './question-types/annotation-blocks';

function formatScenarioText(scenario: string) {
  return stripHtmlPreservingInlineFormatting(scenario).replace(
    /^(Questions\s+\d+\s*(?:[-–]\s*\d+)?\.)/i,
    `${INLINE_BOLD_START}$1${INLINE_BOLD_END}`
  );
}

function renderScenarioText(scenario: string) {
  return splitInlineFormattedText(formatScenarioText(scenario)).map((segment, index) => (
    <span
      key={`${index}-${segment.text}`}
      className={[
        segment.bold ? 'font-semibold text-stone-800 dark:text-white' : '',
        segment.italic ? 'italic' : '',
        segment.underline ? 'underline underline-offset-2' : '',
        segment.code
          ? 'rounded bg-black/5 px-1 py-0.5 font-mono text-[0.92em] dark:bg-white/10'
          : '',
        segment.sup ? 'align-super text-[0.72em]' : '',
        segment.sub ? 'align-sub text-[0.72em]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {segment.text}
    </span>
  ));
}

interface Props {
  activeQuestionId?: string | null;
  audioCurrentTime?: number | null;
  part: Part;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

function getAudioQuestionNumber(part: Part, audioCurrentTime?: number | null) {
  const questions = getPartQuestions(part);
  const partStart = part.audioStartTime;
  const partEnd = part.audioEndTime;

  if (
    !questions.length ||
    typeof audioCurrentTime !== 'number' ||
    typeof partStart !== 'number' ||
    typeof partEnd !== 'number' ||
    partEnd <= partStart ||
    audioCurrentTime < partStart ||
    audioCurrentTime > partEnd
  ) {
    return null;
  }

  const segmentLength = (partEnd - partStart) / questions.length;
  const questionIndex = Math.min(
    questions.length - 1,
    Math.max(0, Math.floor((audioCurrentTime - partStart) / segmentLength))
  );

  return questions[questionIndex]?.number ?? null;
}

export function PartPanel({
  activeQuestionId,
  audioCurrentTime,
  part,
  answers,
  onChange,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();
  const [annotationsByPartId, setAnnotationsByPartId] = useState<Record<string, TextAnnotation[]>>(
    {}
  );
  const currentAnnotations = annotationsByPartId[part.number] ?? [];
  const annotationBlocks = useMemo(
    () =>
      Object.fromEntries([
        [
          `listening-part-${part.number}-title`,
          {
            label: 'Part Title',
            text: part.title,
          },
        ],
        [
          `listening-part-${part.number}-scenario`,
          {
            label: 'Part Overview',
            text: part.scenario,
          },
        ],
        ...part.groups.map((group, groupIndex) => [
          `listening-part-${part.number}-group-${groupIndex}-instructions`,
          {
            label: `Instructions ${groupIndex + 1}`,
            text: group.instructions,
          },
        ]),
        ...part.groups.flatMap((group, groupIndex) =>
          buildQuestionGroupAnnotationBlocks(
            `listening-part-${part.number}-group-${groupIndex}`,
            group
          )
        ),
      ]),
    [part.groups, part.number, part.scenario, part.title]
  );
  const annotations = usePracticeTextAnnotations({
    annotations: currentAnnotations,
    blocks: annotationBlocks,
    onAnnotationsChange: (nextAnnotations) =>
      setAnnotationsByPartId((previousState) => ({
        ...previousState,
        [part.number]: nextAnnotations,
      })),
    openNotesEventName: LISTENING_OPEN_NOTES_EVENT,
  });
  const { floatingUi, renderAnnotatedTextBlock, rootRef } = annotations;
  const audioQuestionNumber = useMemo(
    () => getAudioQuestionNumber(part, audioCurrentTime),
    [audioCurrentTime, part]
  );

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="border-b border-stone-200 pb-6 dark:border-white/10">
        <div className="mb-2 h-1 w-14 rounded-full bg-[#ffb347]" />
        <h2
          style={getPracticeTextStyle(textSize + 4, 'heading')}
          className="font-bold tracking-[-0.02em] text-stone-950 dark:text-white"
        >
          {renderAnnotatedTextBlock({
            as: 'span',
            blockId: `listening-part-${part.number}-title`,
            text: part.title,
          })}
        </h2>
        <p
          data-writing-block-id={`listening-part-${part.number}-scenario`}
          style={getPracticeTextStyle(textSize, 'body-compact')}
          className="mt-3 inline-flex max-w-full items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/68 [&_strong]:font-semibold [&_strong]:text-stone-900 dark:[&_strong]:text-white"
        >
          {renderScenarioText(part.scenario)}
        </p>
      </div>

      <AudioQuestionNumberProvider value={audioQuestionNumber}>
        <div className="space-y-8">
          {part.groups.map((group, gi) => (
            <div key={gi} className="space-y-4">
              <QuestionGroupRenderer
                activeQuestionId={activeQuestionId}
                group={group}
                answers={answers}
                onChange={onChange}
                annotationBlockIdPrefix={`listening-part-${part.number}-group-${gi}`}
                renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                showAnswer={showAnswer}
              />
            </div>
          ))}
        </div>
      </AudioQuestionNumberProvider>
      {floatingUi}
    </div>
  );
}
