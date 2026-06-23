import type { Part, ListeningTest } from '../listening/types';

export type {
  Answers,
  MCOption,
  TableCell,
  TableData,
  TestResult,
  BlankField,
  MCQuestion,
  NoteSection,
  MatchingData,
  MatchingPair,
  CorrectAnswer,
  QuestionGroup,
  MatchingOption,
  SummarySegment,
  SummaryParagraph,
  TableCellSegment,
} from '../listening/types';

export type ReadingPart = Part & {
  passageHtml?: string;
  passageText: string;
};

export type ReadingTest = Omit<ListeningTest, 'parts'> & {
  parts: ReadingPart[];
};
