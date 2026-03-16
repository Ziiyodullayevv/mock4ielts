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
  | 'summary-completion';

// ─── Multiple Choice ──────────────────────────────────────────────────────────

export interface MCOption {
  value: string; // 'A' | 'B' | 'C'
  text: string;
}

export interface MCQuestion {
  id: string;
  number: number;
  text: string;
  options: MCOption[];
  answer: string;
  multiSelect?: boolean; // true = pick 2+
  selectCount?: number; // how many to pick
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export interface MatchingOption {
  value: string; // e.g. 'A'
  label: string; // e.g. 'A  Biology'
}

export interface MatchingPair {
  id: string;
  number: number;
  text: string;
  answer: string; // correct option value
}

export interface MatchingData {
  options: MatchingOption[];
  pairs: MatchingPair[];
}

// ─── Completion (Form / Note / Sentence / Short Answer) ───────────────────────

export interface BlankField {
  id: string;
  number: number;
  label: string; // text before blank
  suffix?: string; // text after blank
  answerLength: number;
  answer: string;
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
  isBlank: boolean;
  content?: string;
  answerLength?: number;
  answer?: string;
}

export interface TableData {
  headers: string[];
  rows: TableCell[][];
}

// ─── Flow Chart ───────────────────────────────────────────────────────────────

export interface FlowStep {
  id?: string;
  number?: number;
  isBlank: boolean;
  content?: string;
  answerLength?: number;
  answer?: string;
}

// ─── Map Labelling ────────────────────────────────────────────────────────────

export interface MapPin {
  id: string;
  number: number;
  x: number; // percentage 0–100
  y: number; // percentage 0–100
  answer: string;
  answerLength: number;
  hideBadge?: boolean;
}

export interface MapData {
  panelTitle?: string | null;
  showBadges?: boolean;
  wordBank: string[];
  pins: MapPin[];
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
    | {
        type: 'summary-completion';
        summaryTitle?: string;
        wordBank?: string[];
        paragraphs: SummaryParagraph[];
      }
  );

// ─── Part & Test ──────────────────────────────────────────────────────────────

export interface Part {
  number: 1 | 2 | 3 | 4;
  title: string;
  scenario: string;
  audioUrl?: string;
  groups: QuestionGroup[];
}

export interface ListeningTest {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  parts: Part[];
}

// ─── Answer State ─────────────────────────────────────────────────────────────

export type Answers = Record<string, string>;

export interface TestResult {
  answers: Answers;
  score: number;
  total: number;
  partScores: Record<number, { score: number; total: number }>;
}
