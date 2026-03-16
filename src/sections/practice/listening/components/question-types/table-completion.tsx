'use client';

import type { TableData } from '../../types';

import { CompletionInput } from './completion-input';
import { PAPER_PANEL_CLASS_NAME } from './paper-shell';
import { getListeningQuestionAnchorId } from '../../utils';

interface Props {
  activeQuestionId?: string | null;
  tableTitle?: string;
  data: TableData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function TableCompletion({
  activeQuestionId,
  tableTitle,
  data,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <div className={PAPER_PANEL_CLASS_NAME}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[1.03rem] text-stone-800">
          <thead>
            {tableTitle ? (
              <tr className="bg-[#414042]">
                <th
                  colSpan={data.headers.length}
                  className="border-b border-white/80 px-8 py-5 text-left text-[1.05rem] font-semibold tracking-[-0.02em] text-white"
                >
                  {tableTitle}
                </th>
              </tr>
            ) : null}

            <tr className="bg-[#414042]">
              {data.headers.map((h, i) => (
                <th
                  key={i}
                  className={`border-b border-white/80 px-8 py-5 text-left text-[0.98rem] font-semibold leading-8 text-white ${
                    i < data.headers.length - 1 ? 'border-r border-white/80' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="bg-[#f5f5f7] align-top">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border-b border-white/80 px-8 py-6 leading-9 text-stone-800 ${
                      ci < row.length - 1 ? 'border-r border-white/80' : ''
                    }`}
                  >
                    {cell.isBlank ? (
                      <div
                        id={getListeningQuestionAnchorId(cell.id!)}
                        className="inline-flex scroll-mt-28 flex-wrap items-center gap-2"
                      >
                        <span
                          className={`font-semibold ${
                            cell.id === activeQuestionId ? 'text-blue-600' : 'text-stone-800'
                          }`}
                        >
                          ({cell.number})
                        </span>
                        <CompletionInput
                          field={{
                            id: cell.id!,
                            number: cell.number!,
                            label: '',
                            answerLength: cell.answerLength!,
                            answer: cell.answer!,
                          }}
                          value={answers[cell.id!] ?? ''}
                          onChange={onChange}
                          showAnswer={showAnswer}
                        />
                      </div>
                    ) : (
                      cell.content
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
