'use client';

import type { ReactNode, ElementType, CSSProperties } from 'react';
import type { BlankField, QuestionGroup } from '../../types';

import { cn } from '@/src/lib/utils';

import { getGroupQuestions } from '../../utils';

type AnnotationBlockConfig = {
  label: string;
  text: string;
};

type AnnotationBlockEntry = [string, AnnotationBlockConfig];

export type QuestionTextAnnotationRenderer = (args: {
  as?: ElementType;
  blockId: string;
  className?: string;
  style?: CSSProperties;
  text: string;
}) => ReactNode;

export type QuestionTypeAnnotationProps = {
  annotationBlockIdPrefix?: string;
  renderAnnotatedTextBlock?: QuestionTextAnnotationRenderer;
};

export function getQuestionAnnotationBlockId(
  prefix: string | undefined,
  ...parts: Array<string | number | null | undefined>
) {
  if (!prefix) {
    return undefined;
  }

  return [prefix, ...parts.filter((part) => part !== null && part !== undefined && `${part}`.length > 0)]
    .map(String)
    .join('-');
}

export function renderQuestionText({
  as: Component = 'span',
  blockId,
  className,
  renderAnnotatedTextBlock,
  style,
  text,
}: {
  as?: ElementType;
  blockId?: string;
  className?: string;
  renderAnnotatedTextBlock?: QuestionTextAnnotationRenderer;
  style?: CSSProperties;
  text: string;
}) {
  if (blockId && renderAnnotatedTextBlock) {
    return renderAnnotatedTextBlock({ as: Component, blockId, className, style, text });
  }

  return (
    <Component className={cn('break-words whitespace-pre-wrap select-text', className)} style={style}>
      {text}
    </Component>
  );
}

export function getQuestionGroupTitle(group: QuestionGroup) {
  const questions = getGroupQuestions(group);
  const firstQuestion = questions[0];
  const lastQuestion = questions.at(-1);

  if (!firstQuestion || !lastQuestion) {
    return 'Questions';
  }

  return firstQuestion.number === lastQuestion.number
    ? `Question ${firstQuestion.number}`
    : `Questions ${firstQuestion.number}-${lastQuestion.number}`;
}

function pushAnnotationBlock(
  entries: AnnotationBlockEntry[],
  blockId: string | undefined,
  label: string,
  text?: string | null
) {
  if (!blockId || !text?.trim()) {
    return;
  }

  entries.push([blockId, { label, text }]);
}

function pushBlankFieldAnnotationBlocks(
  entries: AnnotationBlockEntry[],
  prefix: string,
  field: BlankField,
  labelPrefix: string
) {
  pushAnnotationBlock(
    entries,
    getQuestionAnnotationBlockId(prefix, 'field', field.id, 'label'),
    `${labelPrefix} Prefix`,
    field.label
  );
  pushAnnotationBlock(
    entries,
    getQuestionAnnotationBlockId(prefix, 'field', field.id, 'suffix'),
    `${labelPrefix} Suffix`,
    field.suffix
  );
}

export function buildQuestionGroupAnnotationBlocks(prefix: string, group: QuestionGroup) {
  const entries: AnnotationBlockEntry[] = [];

  pushAnnotationBlock(
    entries,
    getQuestionAnnotationBlockId(prefix, 'intro-title'),
    'Questions Heading',
    getQuestionGroupTitle(group)
  );

  switch (group.type) {
    case 'multiple-choice':
      pushAnnotationBlock(entries, getQuestionAnnotationBlockId(prefix, 'title'), 'Questions Title', 'Questions');

      group.questions.forEach((question) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'question', question.id, 'text'),
          `Question ${question.number}`,
          question.text
        );

        if (question.multiSelect && question.selectCount) {
          pushAnnotationBlock(
            entries,
            getQuestionAnnotationBlockId(prefix, 'question', question.id, 'select-label'),
            `Question ${question.number} Helper`,
            `Select ${question.selectCount}`
          );
        }

        question.options.forEach((option) => {
          pushAnnotationBlock(
            entries,
            getQuestionAnnotationBlockId(prefix, 'question', question.id, 'option', option.value),
            `Question ${question.number} Option ${option.value}`,
            option.text
          );
        });
      });
      break;
    case 'matching':
      pushAnnotationBlock(entries, getQuestionAnnotationBlockId(prefix, 'title'), 'Questions Title', 'Questions');

      group.data.options.forEach((option) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'option', option.value, 'label'),
          `Matching Option ${option.value}`,
          option.label.split(/\s+/).slice(1).join(' ') || option.label
        );
      });

      group.data.pairs.forEach((pair) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'pair', pair.id, 'text'),
          `Question ${pair.number}`,
          pair.text
        );
      });
      break;
    case 'form-completion':
      pushAnnotationBlock(entries, getQuestionAnnotationBlockId(prefix, 'title'), 'Form Title', group.formTitle);

      group.sections.forEach((section, sectionIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'section', sectionIndex, 'heading'),
          `Section ${sectionIndex + 1}`,
          section.heading
        );

        section.fields.forEach((field) => {
          pushBlankFieldAnnotationBlocks(
            entries,
            prefix,
            field,
            `Question ${field.number}`
          );
        });
      });
      break;
    case 'note-completion':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Notes Title',
        group.noteTitle ?? 'Notes'
      );

      group.sections.forEach((section, sectionIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'section', sectionIndex, 'heading'),
          `Section ${sectionIndex + 1}`,
          section.heading
        );

        section.bullets.forEach((bullet, bulletIndex) => {
          pushAnnotationBlock(
            entries,
            getQuestionAnnotationBlockId(prefix, 'section', sectionIndex, 'bullet', bulletIndex, 'text'),
            `Bullet ${bulletIndex + 1}`,
            bullet.text
          );

          if (bullet.field) {
            pushBlankFieldAnnotationBlocks(
              entries,
              prefix,
              bullet.field,
              `Question ${bullet.field.number}`
            );
          }
        });
      });
      break;
    case 'table-completion':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Table Title',
        group.tableTitle
      );

      group.data.headers.forEach((header, headerIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'header', headerIndex),
          `Header ${headerIndex + 1}`,
          header
        );
      });

      group.data.rows?.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          pushAnnotationBlock(
            entries,
            getQuestionAnnotationBlockId(prefix, 'row', rowIndex, 'cell', cellIndex, 'text'),
            `Row ${rowIndex + 1} Cell ${cellIndex + 1}`,
            cell.content
          );

          cell.segments?.forEach((segment, segmentIndex) => {
            if (segment.type === 'text') {
              pushAnnotationBlock(
                entries,
                getQuestionAnnotationBlockId(
                  prefix,
                  'row',
                  rowIndex,
                  'cell',
                  cellIndex,
                  'segment',
                  segmentIndex
                ),
                `Row ${rowIndex + 1} Cell ${cellIndex + 1} Segment ${segmentIndex + 1}`,
                segment.content
              );
            } else {
              pushBlankFieldAnnotationBlocks(
                entries,
                prefix,
                segment.field,
                `Question ${segment.field.number}`
              );
            }
          });
        });
      });

      group.data.sections?.forEach((section, sectionIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'section', sectionIndex, 'title'),
          `Section ${sectionIndex + 1} Title`,
          section.title
        );

        section.rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            pushAnnotationBlock(
              entries,
              getQuestionAnnotationBlockId(
                prefix,
                'section',
                sectionIndex,
                'row',
                rowIndex,
                'cell',
                cellIndex,
                'text'
              ),
              `Section ${sectionIndex + 1} Row ${rowIndex + 1} Cell ${cellIndex + 1}`,
              cell.content
            );

            cell.segments?.forEach((segment, segmentIndex) => {
              if (segment.type === 'text') {
                pushAnnotationBlock(
                  entries,
                  getQuestionAnnotationBlockId(
                    prefix,
                    'section',
                    sectionIndex,
                    'row',
                    rowIndex,
                    'cell',
                    cellIndex,
                    'segment',
                    segmentIndex
                  ),
                  `Section ${sectionIndex + 1} Row ${rowIndex + 1} Cell ${cellIndex + 1} Segment ${segmentIndex + 1}`,
                  segment.content
                );
              } else {
                pushBlankFieldAnnotationBlocks(
                  entries,
                  prefix,
                  segment.field,
                  `Question ${segment.field.number}`
                );
              }
            });
          });
        });
      });
      break;
    case 'flow-chart':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Flow Chart Title',
        group.chartTitle
      );

      group.steps.forEach((step, stepIndex) => {
        if (!step.content?.trim() || step.content === '↓') {
          return;
        }

        if (step.isBlank) {
          step.content.split('_______').forEach((segment, segmentIndex) => {
            pushAnnotationBlock(
              entries,
              getQuestionAnnotationBlockId(prefix, 'step', stepIndex, 'segment', segmentIndex),
              `Step ${stepIndex + 1} Segment ${segmentIndex + 1}`,
              segment
            );
          });
        } else {
          pushAnnotationBlock(
            entries,
            getQuestionAnnotationBlockId(prefix, 'step', stepIndex, 'text'),
            `Step ${stepIndex + 1}`,
            step.content
          );
        }
      });
      break;
    case 'sentence-completion':
      group.questions.forEach((question) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'question', question.id, 'text'),
          `Question ${question.number}`,
          question.label
        );
        pushBlankFieldAnnotationBlocks(entries, prefix, question, `Question ${question.number}`);
      });
      break;
    case 'short-answer':
      group.questions.forEach((question) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'question', question.id, 'text'),
          `Question ${question.number}`,
          question.label
        );
        pushBlankFieldAnnotationBlocks(entries, prefix, question, `Question ${question.number}`);
      });
      break;
    case 'map-labelling':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Map Title',
        group.data.panelTitle === undefined ? 'Map' : group.data.panelTitle
      );

      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'legend-title'),
        'Location Key Title',
        group.data.legendOptions?.length ? 'Location key' : undefined
      );

      group.data.legendOptions?.forEach((option) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'legend-option', option.value),
          `Legend Option ${option.value}`,
          option.text
        );
      });

      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'word-bank-title'),
        'Word Bank Title',
        group.data.wordBank.length ? 'Word bank' : undefined
      );

      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'word-bank-inline-title'),
        'Word Bank Inline Title',
        group.data.wordBank.length ? 'Word bank — drag labels onto the map' : undefined
      );

      group.data.wordBank.forEach((word, wordIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'word-bank-word', wordIndex),
          `Word Bank ${wordIndex + 1}`,
          word
        );
      });
      break;
    case 'diagram-completion':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Diagram Title',
        group.data.title ?? 'Diagram'
      );

      group.data.questions.forEach((question) => {
        pushBlankFieldAnnotationBlocks(entries, prefix, question, `Question ${question.number}`);
      });
      break;
    case 'summary-completion':
      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'title'),
        'Summary Title',
        group.summaryTitle ?? 'Summary'
      );

      pushAnnotationBlock(
        entries,
        getQuestionAnnotationBlockId(prefix, 'word-bank-title'),
        'Word Bank Title',
        group.wordBank?.length ? 'Word bank' : undefined
      );

      group.wordBank?.forEach((word, wordIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'word-bank-word', wordIndex),
          `Word Bank ${wordIndex + 1}`,
          word
        );
      });

      group.paragraphs.forEach((paragraph, paragraphIndex) => {
        pushAnnotationBlock(
          entries,
          getQuestionAnnotationBlockId(prefix, 'paragraph', paragraphIndex, 'heading'),
          `Paragraph ${paragraphIndex + 1} Heading`,
          paragraph.heading
        );

        paragraph.segments.forEach((segment, segmentIndex) => {
          if (segment.type === 'text') {
            pushAnnotationBlock(
              entries,
              getQuestionAnnotationBlockId(prefix, 'paragraph', paragraphIndex, 'segment', segmentIndex),
              `Paragraph ${paragraphIndex + 1} Segment ${segmentIndex + 1}`,
              segment.content
            );
          } else {
            pushBlankFieldAnnotationBlocks(
              entries,
              prefix,
              segment.field,
              `Question ${segment.field.number}`
            );
          }
        });
      });
      break;
    default:
      break;
  }

  return entries;
}
