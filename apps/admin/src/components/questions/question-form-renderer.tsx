'use client';

import type { QuestionType } from 'src/types/section';

import Typography from '@mui/material/Typography';

import { WritingFields } from './writing-fields';
import { MatchingFields } from './matching-fields';
import { SpeakingFields } from './speaking-fields';
import { FillBlankFields } from './fill-blank-fields';
import { SummaryListFields } from './summary-list-fields';
import {
  SingleChoiceFields,
  YesNoNotGivenFields,
  MultipleChoiceFields,
  TrueFalseNotGivenFields,
} from './selection-fields';

type Props = {
  questionType: QuestionType;
  prefix: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SELECTION_TYPES: QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'true_false_not_given',
  'yes_no_not_given',
];

const FILL_BLANK_TYPES: QuestionType[] = [
  'form_completion',
  'note_completion',
  'table_completion',
  'sentence_completion',
  'flow_chart_completion',
  'diagram_completion',
  'summary_completion_free',
  'short_answer',
];

const MATCHING_TYPES: QuestionType[] = [
  'matching',
  'matching_headings',
  'matching_information',
  'matching_features',
  'matching_sentence_endings',
  'map_labeling',
];

const WRITING_TYPES: QuestionType[] = ['essay', 'letter_writing', 'graph_description'];
const SPEAKING_TYPES: QuestionType[] = [
  'speaking_short',
  'speaking_cue_card',
  'speaking_discussion',
];

export function QuestionFormRenderer({ questionType, prefix }: Props) {
  if (!questionType) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
        Select a question type to configure
      </Typography>
    );
  }

  // Selection-based
  if (questionType === 'single_choice') return <SingleChoiceFields prefix={prefix} />;
  if (questionType === 'multiple_choice') return <MultipleChoiceFields prefix={prefix} />;
  if (questionType === 'true_false_not_given') return <TrueFalseNotGivenFields prefix={prefix} />;
  if (questionType === 'yes_no_not_given') return <YesNoNotGivenFields prefix={prefix} />;

  // Fill-blank
  if (FILL_BLANK_TYPES.includes(questionType))
    return <FillBlankFields prefix={prefix} questionType={questionType} />;

  // Matching
  if (MATCHING_TYPES.includes(questionType))
    return <MatchingFields prefix={prefix} questionType={questionType} />;

  // Summary completion from list
  if (questionType === 'summary_completion_list') return <SummaryListFields prefix={prefix} />;

  // Writing
  if (WRITING_TYPES.includes(questionType))
    return <WritingFields prefix={prefix} questionType={questionType} />;

  // Speaking
  if (SPEAKING_TYPES.includes(questionType))
    return <SpeakingFields prefix={prefix} questionType={questionType} />;

  return (
    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
      Unknown question type: {questionType}
    </Typography>
  );
}
