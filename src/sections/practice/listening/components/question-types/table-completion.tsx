'use client';

import type { TableCell, TableData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { PaperSurface, QuestionNumberBadge } from './paper-shell';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  tableTitle?: string;
  data: TableData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function TableCompletion({
  activeQuestionId,
  annotationBlockIdPrefix,
  tableTitle,
  data,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();
  const rows = data.rows ?? [];
  const sections = data.sections ?? [];

  return (
    <PaperSurface>
      <div className="overflow-x-auto">
        <table
          style={getPracticeTextStyle(textSize, 'body-soft')}
          className="w-full border-collapse text-stone-800 dark:text-white/84"
        >
          <thead>
            {tableTitle ? (
              <tr className="bg-[#414042]">
                <th
                  colSpan={data.headers.length}
                  className="border-b border-white/80 px-4 py-3 text-left text-base font-semibold tracking-[-0.02em] text-white sm:px-6 sm:py-4"
                >
                  {tableTitle
                    ? renderQuestionText({
                        as: 'span',
                        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
                        renderAnnotatedTextBlock,
                        text: tableTitle,
                      })
                    : null}
                </th>
              </tr>
            ) : null}

            <tr className="bg-[#414042]">
              {data.headers.map((h, i) => (
                <th
                  key={i}
                  className={`border-b border-white/80 px-4 py-3 text-left text-sm font-semibold leading-7 text-white sm:px-6 sm:py-4 ${
                    i < data.headers.length - 1 ? 'border-r border-white/80' : ''
                  }`}
                >
                  {renderQuestionText({
                    as: 'span',
                    blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'header', i),
                    renderAnnotatedTextBlock,
                    text: h,
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="bg-[#f7f7f7] align-top dark:bg-[#131313]">
                {row.map((cell, cellIndex) => (
                    <TableContentCell
                      key={`row-${rowIndex}-cell-${cellIndex}`}
                      activeQuestionId={activeQuestionId}
                      answers={answers}
                      annotationBlockIdPrefix={annotationBlockIdPrefix}
                      cell={cell}
                      cellIndex={cellIndex}
                      isLastCell={cellIndex === row.length - 1}
                      onChange={onChange}
                      renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                      rowIndex={rowIndex}
                      showAnswer={showAnswer}
                    />
                ))}
              </tr>
            ))}

            {sections.map((section, sectionIndex) =>
              section.rows.map((row, rowIndex) => (
                <tr
                  key={`section-${section.title}-${sectionIndex}-row-${rowIndex}`}
                  className="bg-[#f7f7f7] align-top dark:bg-[#131313]"
                >
                  {rowIndex === 0 ? (
                    <td
                      rowSpan={section.rows.length}
                      className="border-b border-r border-white/80 px-4 py-3 align-middle text-[0.96rem] font-semibold text-stone-900 dark:border-white/10 dark:text-white sm:px-6 sm:py-4"
                    >
                      {renderQuestionText({
                        as: 'span',
                        blockId: getQuestionAnnotationBlockId(
                          annotationBlockIdPrefix,
                          'section',
                          sectionIndex,
                          'title'
                        ),
                        renderAnnotatedTextBlock,
                        text: section.title,
                      })}
                    </td>
                  ) : null}

                  {row.map((cell, cellIndex) => (
                    <TableContentCell
                      key={`section-${section.title}-${sectionIndex}-row-${rowIndex}-cell-${cellIndex}`}
                      activeQuestionId={activeQuestionId}
                      answers={answers}
                      annotationBlockIdPrefix={annotationBlockIdPrefix}
                      cell={cell}
                      cellIndex={cellIndex}
                      isLastCell={cellIndex === row.length - 1}
                      onChange={onChange}
                      renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                      rowIndex={rowIndex}
                      sectionIndex={sectionIndex}
                      showAnswer={showAnswer}
                    />
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PaperSurface>
  );
}

type TableContentCellProps = {
  activeQuestionId?: string | null;
  answers: Record<string, string>;
  annotationBlockIdPrefix?: string;
  cell: TableCell;
  cellIndex: number;
  isLastCell: boolean;
  onChange: (id: string, value: string) => void;
  renderAnnotatedTextBlock?: QuestionTypeAnnotationProps['renderAnnotatedTextBlock'];
  rowIndex: number;
  sectionIndex?: number;
  showAnswer?: boolean;
};

function TableContentCell({
  activeQuestionId,
  answers,
  annotationBlockIdPrefix,
  cell,
  cellIndex,
  isLastCell,
  onChange,
  renderAnnotatedTextBlock,
  rowIndex,
  sectionIndex,
  showAnswer,
}: TableContentCellProps) {
  return (
    <td
      className={`border-b border-white/80 px-4 py-3 leading-8 text-stone-800 dark:border-white/10 dark:text-white/84 sm:px-6 sm:py-4 ${
        isLastCell ? '' : 'border-r border-white/80 dark:border-white/10'
      }`}
    >
      {cell.segments?.length ? (
        <div className="inline-flex flex-wrap items-center gap-1">
          {cell.segments.map((segment, segmentIndex) =>
            segment.type === 'text' ? (
              <span key={`text-${segmentIndex}`}>
                {renderQuestionText({
                  as: 'span',
                  blockId: getQuestionAnnotationBlockId(
                    annotationBlockIdPrefix,
                    ...(typeof sectionIndex === 'number'
                      ? ['section', sectionIndex, 'row', rowIndex, 'cell', cellIndex]
                      : ['row', rowIndex, 'cell', cellIndex]),
                    'segment',
                    segmentIndex
                  ),
                  renderAnnotatedTextBlock,
                  text: segment.content,
                })}
              </span>
            ) : (
              <span
                key={segment.field.id}
                id={getListeningQuestionAnchorId(segment.field.id)}
                className="inline-flex scroll-mt-28 items-center gap-2"
              >
                <QuestionNumberBadge
                  isActive={segment.field.id === activeQuestionId}
                  number={segment.field.number}
                  size="xs"
                />
                <CompletionInput
                  annotationBlockIdPrefix={annotationBlockIdPrefix}
                  field={segment.field}
                  value={answers[segment.field.id] ?? ''}
                  onChange={onChange}
                  renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                  showAnswer={showAnswer}
                />
              </span>
            )
          )}
        </div>
      ) : cell.isBlank ? (
        <div
          id={getListeningQuestionAnchorId(cell.id!)}
          className="inline-flex scroll-mt-28 flex-wrap items-center gap-2"
        >
          <QuestionNumberBadge
            isActive={cell.id === activeQuestionId}
            number={cell.number!}
            size="xs"
          />
          <CompletionInput
            annotationBlockIdPrefix={annotationBlockIdPrefix}
            field={{
              id: cell.id!,
              number: cell.number!,
              label: '',
              answerLength: cell.answerLength!,
              answer: cell.answer!,
            }}
            value={answers[cell.id!] ?? ''}
            onChange={onChange}
            renderAnnotatedTextBlock={renderAnnotatedTextBlock}
            showAnswer={showAnswer}
          />
        </div>
      ) : (
        renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(
            annotationBlockIdPrefix,
            ...(typeof sectionIndex === 'number'
              ? ['section', sectionIndex, 'row', rowIndex, 'cell', cellIndex]
              : ['row', rowIndex, 'cell', cellIndex]),
            'text'
          ),
          renderAnnotatedTextBlock,
          text: cell.content ?? '',
        })
      )}
    </td>
  );
}
