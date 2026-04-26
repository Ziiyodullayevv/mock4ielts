'use client';

import type { DiagramData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

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
  answers: Record<string, string>;
  data: DiagramData;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function DiagramCompletion({
  activeQuestionId,
  annotationBlockIdPrefix,
  answers,
  data,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  return (
    <div className="space-y-6">
      <PaperPanel
        title={data.title ?? 'Diagram'}
        titleContent={renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
          renderAnnotatedTextBlock,
          text: data.title ?? 'Diagram',
        })}
      >
        {data.imageUrl ? (
          <div className="border-b border-[#dfdfdf] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#131313] sm:px-8 sm:py-8">
            <img
              src={data.imageUrl}
              alt={data.title ?? 'Diagram completion'}
              className="mx-auto max-h-[28rem] w-auto max-w-full object-contain"
            />
          </div>
        ) : null}

        <div className={PAPER_DIVIDER_CLASS_NAME}>
          {data.questions.map((question) => (
            <div
              key={question.id}
              id={getListeningQuestionAnchorId(question.id)}
              className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-wrap items-center gap-3`}
            >
              <QuestionNumberBadge
                isActive={question.id === activeQuestionId}
                number={question.number}
                size="sm"
              />
              <CompletionInput
                annotationBlockIdPrefix={annotationBlockIdPrefix}
                field={question}
                value={answers[question.id] ?? ''}
                onChange={onChange}
                renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                showAnswer={showAnswer}
              />
            </div>
          ))}
        </div>
      </PaperPanel>
    </div>
  );
}
