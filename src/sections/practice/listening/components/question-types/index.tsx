'use client';

import type { QuestionGroup } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { Matching } from './matching';
import { FlowChart } from './flow-chart';
import { ShortAnswer } from './short-answer';
import { MapLabelling } from './map-labelling';
import { MultipleChoice } from './multiple-choice';
import { FormCompletion } from './form-completion';
import { NoteCompletion } from './note-completion';
import { QuestionGroupIntro } from './paper-shell';
import { TableCompletion } from './table-completion';
import { DiagramCompletion } from './diagram-completion';
import { SummaryCompletion } from './summary-completion';
import { SentenceCompletion } from './sentence-completion';
import { getQuestionGroupTitle } from './annotation-blocks';

interface Props extends QuestionTypeAnnotationProps {
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
  annotationBlockIdPrefix,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const groupTitle = getQuestionGroupTitle(group);

  return (
    <div className="space-y-5">
      <QuestionGroupIntro
        title={groupTitle}
        titleAnnotationBlockId={annotationBlockIdPrefix ? `${annotationBlockIdPrefix}-intro-title` : undefined}
        instruction={group.instructions}
        annotationBlockId={annotationBlockIdPrefix ? `${annotationBlockIdPrefix}-instructions` : undefined}
        renderAnnotatedTextBlock={renderAnnotatedTextBlock}
      />

      {group.type === 'multiple-choice' && (
        <MultipleChoice
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'matching' && (
        <Matching
          activeQuestionId={activeQuestionId}
          data={group.data}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'form-completion' && (
        <FormCompletion
          activeQuestionId={activeQuestionId}
          formTitle={group.formTitle}
          sections={group.sections}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'note-completion' && (
        <NoteCompletion
          activeQuestionId={activeQuestionId}
          noteTitle={group.noteTitle}
          sections={group.sections}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'table-completion' && (
        <TableCompletion
          activeQuestionId={activeQuestionId}
          tableTitle={group.tableTitle}
          data={group.data}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'flow-chart' && (
        <FlowChart
          activeQuestionId={activeQuestionId}
          chartTitle={group.chartTitle}
          steps={group.steps}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'sentence-completion' && (
        <SentenceCompletion
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'short-answer' && (
        <ShortAnswer
          activeQuestionId={activeQuestionId}
          questions={group.questions}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'map-labelling' && (
        <MapLabelling
          activeQuestionId={activeQuestionId}
          data={group.data}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}

      {group.type === 'diagram-completion' && (
        <DiagramCompletion
          activeQuestionId={activeQuestionId}
          answers={answers}
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          data={group.data}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
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
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
          showAnswer={showAnswer}
        />
      )}
    </div>
  );
}
