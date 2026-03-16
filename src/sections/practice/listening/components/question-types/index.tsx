'use client';

import type { QuestionGroup } from '../../types';

import { Matching } from './matching';
import { FlowChart } from './flow-chart';
import { ShortAnswer } from './short-answer';
import { MapLabelling } from './map-labelling';
import { getGroupQuestions } from '../../utils';
import { MultipleChoice } from './multiple-choice';
import { FormCompletion } from './form-completion';
import { NoteCompletion } from './note-completion';
import { QuestionGroupIntro } from './paper-shell';
import { TableCompletion } from './table-completion';
import { SummaryCompletion } from './summary-completion';
import { SentenceCompletion } from './sentence-completion';

interface Props {
  activeQuestionId?: string | null;
  group: QuestionGroup;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function QuestionGroupRenderer({
  activeQuestionId,
  group,
  answers,
  onChange,
  showAnswer,
}: Props) {
  const questions = getGroupQuestions(group);
  const firstQuestion = questions[0];
  const lastQuestion = questions.at(-1);
  const groupTitle =
    firstQuestion && lastQuestion
      ? firstQuestion.number === lastQuestion.number
        ? `Question ${firstQuestion.number}`
        : `Questions ${firstQuestion.number}-${lastQuestion.number}`
      : 'Questions';

  return (
    <div className="space-y-8">
      <QuestionGroupIntro title={groupTitle} instruction={group.instructions} />

      {group.type === 'multiple-choice' && (
        <MultipleChoice
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'matching' && (
        <Matching
          activeQuestionId={activeQuestionId}
          data={group.data}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'form-completion' && (
        <FormCompletion
          activeQuestionId={activeQuestionId}
          formTitle={group.formTitle}
          sections={group.sections}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'note-completion' && (
        <NoteCompletion
          activeQuestionId={activeQuestionId}
          noteTitle={group.noteTitle}
          sections={group.sections}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'table-completion' && (
        <TableCompletion
          activeQuestionId={activeQuestionId}
          tableTitle={group.tableTitle}
          data={group.data}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'flow-chart' && (
        <FlowChart
          activeQuestionId={activeQuestionId}
          chartTitle={group.chartTitle}
          steps={group.steps}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'sentence-completion' && (
        <SentenceCompletion
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'short-answer' && (
        <ShortAnswer
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'map-labelling' && (
        <MapLabelling
          activeQuestionId={activeQuestionId}
          data={group.data}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'summary-completion' && (
        <SummaryCompletion
          activeQuestionId={activeQuestionId}
          paragraphs={group.paragraphs}
          summaryTitle={group.summaryTitle}
          wordBank={group.wordBank}
          answers={answers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      )}
    </div>
  );
}
