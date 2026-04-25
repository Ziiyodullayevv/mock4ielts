'use client';

import type { BlankField } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  questions: BlankField[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function SentenceCompletion({
  activeQuestionId,
  annotationBlockIdPrefix,
  questions,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel>
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {questions.map((q) => (
          <div
            key={q.id}
            id={getListeningQuestionAnchorId(q.id)}
            style={getPracticeTextStyle(textSize, 'body')}
            className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-wrap items-start gap-2`}
          >
            <QuestionNumberBadge
              isActive={q.id === activeQuestionId}
              number={q.number}
              className="mt-0.5"
            />
            <span className="flex flex-wrap items-center gap-1.5 text-stone-800 dark:text-white/84">
              {renderQuestionText({
                as: 'span',
                blockId: getQuestionAnnotationBlockId(
                  annotationBlockIdPrefix,
                  'question',
                  q.id,
                  'text'
                ),
                renderAnnotatedTextBlock,
                text: q.label,
              })}
              <CompletionInput
                annotationBlockIdPrefix={annotationBlockIdPrefix}
                field={{ ...q, label: '' }}
                value={answers[q.id] ?? ''}
                onChange={onChange}
                renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                showAnswer={showAnswer}
              />
            </span>
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
