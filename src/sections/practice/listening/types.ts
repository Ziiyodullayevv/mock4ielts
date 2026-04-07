// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType =
  | 'multiple-choice'
  | 'matching'
  | 'form-completion'
  | 'note-completion'
  | 'table-completion'
  | 'flow-chart'
  | 'sentence-completion'
  | 'short-answer'
  | 'map-labelling'
  | 'summary-completion'
  | 'diagram-completion';

export type CorrectAnswer = string | string[];

// ─── Multiple Choice ──────────────────────────────────────────────────────────

export interface MCOption {
  value: string; // 'A' | 'B' | 'C'
  text: string;
}

export interface MCQuestion {
  backendQuestionId?: string;
  id: string;
  number: number;
  text: string;
  options: MCOption[];
  answer: CorrectAnswer;
  multiSelect?: boolean; // true = pick 2+
  selectCount?: number; // how many to pick
  scoreWeight?: number;
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export interface MatchingOption {
  value: string; // e.g. 'A'
  label: string; // e.g. 'A  Biology'
}

export interface MatchingPair {
  backendQuestionId?: string;
  id: string;
  number: number;
  text: string;
  answer: CorrectAnswer; // correct option value
}

export interface MatchingData {
  options: MatchingOption[];
  pairs: MatchingPair[];
}

// ─── Completion (Form / Note / Sentence / Short Answer) ───────────────────────

export interface BlankField {
  backendQuestionId?: string;
  id: string;
  number: number;
  label: string; // text before blank
  suffix?: string; // text after blank
  answerLength: number;
  answer: CorrectAnswer;
}

export interface FormSection {
  heading?: string;
  fields: BlankField[];
}

export interface NoteSection {
  heading?: string;
  bullets: Array<{ text: string; field?: BlankField }>;
}

// ─── Summary Completion ──────────────────────────────────────────────────────

export type SummarySegment =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'blank';
      field: BlankField;
    };

export interface SummaryParagraph {
  heading?: string;
  segments: SummarySegment[];
}

// ─── Table Completion ─────────────────────────────────────────────────────────

export interface TableCell {
  id?: string;
  number?: number;
  backendQuestionId?: string;
  isBlank: boolean;
  content?: string;
  answerLength?: number;
  answer?: CorrectAnswer;
  segments?: TableCellSegment[];
}

export type TableCellSegment =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'blank';
      field: BlankField;
    };

export interface TableSection {
  rows: TableCell[][];
  title: string;
}

export interface TableData {
  headers: string[];
  rows?: TableCell[][];
  sections?: TableSection[];
}

// ─── Flow Chart ───────────────────────────────────────────────────────────────

export interface FlowStep {
  id?: string;
  number?: number;
  backendQuestionId?: string;
  isBlank: boolean;
  content?: string;
  answerLength?: number;
  answer?: CorrectAnswer;
}

// ─── Map Labelling ────────────────────────────────────────────────────────────

export interface MapPin {
  backendQuestionId?: string;
  id: string;
  number: number;
  x: number; // percentage 0–100
  y: number; // percentage 0–100
  answer: CorrectAnswer;
  answerLength: number;
  hideBadge?: boolean;
}

export interface MapData {
  imageUrl?: string;
  legendOptions?: MCOption[];
  panelTitle?: string | null;
  showBadges?: boolean;
  wordBank: string[];
  pins: MapPin[];
}

// ─── Diagram Completion ───────────────────────────────────────────────────────

export interface DiagramData {
  imageUrl?: string;
  instructions?: string;
  title?: string;
  questions: BlankField[];
}

// ─── Question Groups ──────────────────────────────────────────────────────────

interface GroupBase {
  instructions: string;
}

export type QuestionGroup = GroupBase &
  (
    | { type: 'multiple-choice'; questions: MCQuestion[] }
    | { type: 'matching'; data: MatchingData }
    | { type: 'form-completion'; formTitle: string; sections: FormSection[] }
    | { type: 'note-completion'; noteTitle?: string; sections: NoteSection[] }
    | { type: 'table-completion'; tableTitle?: string; data: TableData }
    | { type: 'flow-chart'; chartTitle: string; steps: FlowStep[] }
    | { type: 'sentence-completion'; questions: BlankField[] }
    | { type: 'short-answer'; questions: BlankField[] }
    | { type: 'map-labelling'; data: MapData }
    | { type: 'diagram-completion'; data: DiagramData }
    | {
        type: 'summary-completion';
        summaryTitle?: string;
        wordBank?: string[];
        paragraphs: SummaryParagraph[];
      }
  );

// ─── Part & Test ──────────────────────────────────────────────────────────────

export interface Part {
  audioEndTime?: number;
  audioStartTime?: number;
  number: number;
  title: string;
  scenario: string;
  audioUrl?: string;
  groups: QuestionGroup[];
}

export interface ListeningTest {
  durationMinutes?: number;
  id: string;
  supportsLocalScoring?: boolean;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  parts: Part[];
}

// ─── Answer State ─────────────────────────────────────────────────────────────

export type Answers = Record<string, string>;

export interface TestResult {
  answers: Answers;
  attemptId?: string;
  overallBand?: number | null;
  score: number;
  source?: 'backend' | 'local';
  total: number;
  timeSpentSeconds?: number | null;
  partScores: Record<number, { score: number; total: number }>;
}
