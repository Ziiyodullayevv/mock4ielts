'use client';

import type { TextAnnotation } from '@/src/sections/practice/writing/components/writing-task-panel.shared';
import type { Part } from '../types';

import { useMemo, useState } from 'react';
import { LISTENING_OPEN_NOTES_EVENT } from '@/src/layouts/practice';
import { usePracticeTextAnnotations } from '@/src/sections/practice/shared/use-practice-text-annotations';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { QuestionGroupRenderer } from './question-types/index';
import { buildQuestionGroupAnnotationBlocks } from './question-types/annotation-blocks';

interface Props {
  activeQuestionId?: string | null;
  part: Part;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function PartPanel({ activeQuestionId, part, answers, onChange, showAnswer }: Props) {
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
          buildQuestionGroupAnnotationBlocks(`listening-part-${part.number}-group-${groupIndex}`, group)
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

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="space-y-2.5 border-b border-stone-200 pb-4 dark:border-white/10">
        <h2
          style={getPracticeTextStyle(textSize, 'heading')}
          className="font-semibold tracking-[-0.03em] text-stone-800 dark:text-white"
        >
          {renderAnnotatedTextBlock({
            as: 'span',
            blockId: `listening-part-${part.number}-title`,
            text: part.title,
          })}
        </h2>
        {renderAnnotatedTextBlock({
          as: 'p',
          blockId: `listening-part-${part.number}-scenario`,
          className: 'max-w-5xl text-stone-600 dark:text-white/62',
          style: getPracticeTextStyle(textSize, 'body-compact'),
          text: part.scenario,
        })}
      </div>

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
      {floatingUi}
    </div>
  );
}
