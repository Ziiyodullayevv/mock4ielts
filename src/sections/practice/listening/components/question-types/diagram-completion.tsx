'use client';

import type { DiagramData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { useMemo, useState } from 'react';

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

const BLANK_PROMPT_REGEX = /_{2,}\s*(\d+)\s*_{2,}/;

function buildDiagramQuestionFields(data: DiagramData) {
  const title = data.title?.trim();

  if (!title || !BLANK_PROMPT_REGEX.test(title)) {
    return data.questions;
  }

  return data.questions.map((question) => {
    const markerRegex = new RegExp(`_{2,}\\s*${question.number}\\s*_{2,}`);
    const match = markerRegex.exec(title);

    if (!match) {
      return question;
    }

    return {
      ...question,
      label: question.label || title.slice(0, match.index).trimEnd(),
      suffix: question.suffix || title.slice(match.index + match[0].length).trimStart(),
    };
  });
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
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = data.imageUrl?.trim();
  const hasPromptBlank = BLANK_PROMPT_REGEX.test(data.title ?? '');
  const questions = useMemo(() => buildDiagramQuestionFields(data), [data]);
  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);
  const panelTitle = showImage && !hasPromptBlank ? (data.title ?? 'Diagram') : undefined;

  return (
    <div className="space-y-6">
      <PaperPanel
        title={panelTitle}
        titleContent={
          panelTitle
            ? renderQuestionText({
                as: 'span',
                blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
                renderAnnotatedTextBlock,
                text: panelTitle,
              })
            : undefined
        }
      >
        {showImage ? (
          <div className="border-b border-[#dfdfdf] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#131313] sm:px-6 sm:py-4">
            <img
              src={imageUrl}
              alt=""
              onError={() => {
                if (imageUrl) {
                  setFailedImageUrl(imageUrl);
                }
              }}
              className="mx-auto max-h-[28rem] w-auto max-w-full object-contain"
            />
          </div>
        ) : null}

        <div className={PAPER_DIVIDER_CLASS_NAME}>
          {questions.map((question) => (
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
