// ----------------------------------------------------------------------
// Question Types (25 ta — IELTS spec bo'yicha)
// ----------------------------------------------------------------------

export type QuestionType =
  // Listening + Reading (umumiy)
  | 'single_choice'
  | 'multiple_choice'
  | 'matching'
  | 'map_labeling'
  | 'sentence_completion'
  | 'short_answer'
  | 'note_completion'
  | 'table_completion'
  | 'diagram_completion'
  // Faqat Listening
  | 'form_completion'
  | 'flow_chart_completion'
  // Faqat Reading
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'matching_sentence_endings'
  | 'summary_completion_list'
  | 'summary_completion_free'
  // Writing
  | 'graph_description'
  | 'letter_writing'
  | 'essay'
  // Speaking
  | 'speaking_short'
  | 'speaking_cue_card'
  | 'speaking_discussion';

export type SectionType = 'listening' | 'reading' | 'writing' | 'speaking';
export type ExamType = 'academic' | 'general_training';
export type ExamMode = 'practice' | 'mock' | 'contest';
export type ExamStatus = 'draft' | 'published' | 'archived';
export type ContestStatus = 'scheduled' | 'live' | 'grading' | 'finished';

// ----------------------------------------------------------------------
// Models
// ----------------------------------------------------------------------

export interface IQuestion {
  id?: string;
  question_type: QuestionType;
  text: string;
  options?: { label: string; text: string }[] | null;
  correct_answer: any;
  explanation?: string | null;
  points: number;
  order: number;
  metadata?: Record<string, any> | null;
  image_url?: string | null;
}

export interface IPart {
  id?: string;
  title: string;
  passage_text?: string | null;
  passage_source?: string | null;
  audio_url?: string | null;
  audio_start_time?: number | null;
  audio_end_time?: number | null;
  image_url?: string | null;
  instructions?: string | null;
  order: number;
  questions: IQuestion[];
}

export interface ISection {
  id: string;
  section_type: SectionType;
  exam_type: ExamType;
  title: string;
  instructions?: string | null;
  audio_url?: string | null;
  duration_minutes?: number | null;
  is_published: boolean;
  difficulty?: string | null;
  tags?: string[] | null;
  order?: number;
  total_questions: number;
  parts: IPart[];
  created_at: string;
  updated_at?: string;
}

export interface IExamSection {
  order: number;
  section_type: SectionType | `SectionType.${Uppercase<SectionType>}` | string;
  section_id: string;
  title: string;
  question_count: number;
}

export interface IExam {
  id: string;
  title: string;
  exam_type: ExamType;
  mode?: ExamMode | null;
  description?: string | null;
  status: ExamStatus;
  duration_minutes: number;
  scheduled_at?: string | null;
  ends_at?: string | null;
  registration_deadline?: string | null;
  max_participants?: number | null;
  contest_status?: ContestStatus | null;
  // List endpoint returns sections_count; detail endpoint returns sections array
  sections_count?: number | null;
  sections?: IExamSection[] | null;
  total_questions?: number | null;
  created_at: string;
}

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------

export const SECTION_TYPES: Record<SectionType, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};

export const QUESTION_TYPES: Record<QuestionType, string> = {
  // Listening + Reading
  single_choice: 'Single Choice (MCQ)',
  multiple_choice: 'Multiple Choice',
  matching: 'Matching',
  map_labeling: 'Map / Plan Labeling',
  sentence_completion: 'Sentence Completion',
  short_answer: 'Short Answer',
  note_completion: 'Note Completion',
  table_completion: 'Table Completion',
  diagram_completion: 'Diagram Completion',
  // Listening only
  form_completion: 'Form Completion',
  flow_chart_completion: 'Flow Chart Completion',
  // Reading only
  true_false_not_given: 'True / False / Not Given',
  yes_no_not_given: 'Yes / No / Not Given',
  matching_headings: 'Matching Headings',
  matching_information: 'Matching Information',
  matching_features: 'Matching Features',
  matching_sentence_endings: 'Matching Sentence Endings',
  summary_completion_list: 'Summary Completion (from list)',
  summary_completion_free: 'Summary Completion (free text)',
  // Writing
  graph_description: 'Graph Description (Task 1)',
  letter_writing: 'Letter Writing (Task 1 GT)',
  essay: 'Essay (Task 2)',
  // Speaking
  speaking_short: 'Speaking Part 1 (Short)',
  speaking_cue_card: 'Speaking Part 2 (Cue Card)',
  speaking_discussion: 'Speaking Part 3 (Discussion)',
};

export const SECTION_ALLOWED_TYPES: Record<SectionType, QuestionType[]> = {
  listening: [
    'single_choice', 'multiple_choice', 'form_completion', 'note_completion',
    'table_completion', 'sentence_completion', 'short_answer', 'map_labeling',
    'matching', 'flow_chart_completion', 'diagram_completion',
  ],
  reading: [
    'single_choice', 'multiple_choice', 'true_false_not_given', 'yes_no_not_given',
    'matching_headings', 'matching_information', 'matching_features',
    'matching_sentence_endings', 'sentence_completion', 'summary_completion_list',
    'summary_completion_free', 'note_completion', 'table_completion',
    'diagram_completion', 'map_labeling', 'matching', 'short_answer',
  ],
  writing: ['graph_description', 'letter_writing', 'essay'],
  speaking: ['speaking_short', 'speaking_cue_card', 'speaking_discussion'],
};

export const SECTION_COLORS: Record<SectionType, 'info' | 'success' | 'warning' | 'error'> = {
  listening: 'info',
  reading: 'success',
  writing: 'warning',
  speaking: 'error',
};

export const SECTION_PART_COUNTS: Record<SectionType, { min: number; max: number; labels: string[] }> = {
  listening: { min: 4, max: 4, labels: ['Part 1', 'Part 2', 'Part 3', 'Part 4'] },
  reading: { min: 3, max: 3, labels: ['Passage 1', 'Passage 2', 'Passage 3'] },
  writing: { min: 2, max: 2, labels: ['Task 1', 'Task 2'] },
  speaking: { min: 3, max: 3, labels: ['Part 1: Introduction', 'Part 2: Cue Card', 'Part 3: Discussion'] },
};

export const SECTION_DURATIONS: Record<SectionType, number> = {
  listening: 32,
  reading: 60,
  writing: 60,
  speaking: 15,
};
