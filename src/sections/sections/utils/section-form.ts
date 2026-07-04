import type { IQuestion, SectionType } from 'src/types/section';

import { SECTION_DURATIONS } from 'src/types/section';

type QuestionLike = {
  id?: string;
  question_type: string;
  text: string;
  options?: any[] | null;
  correct_answer: any;
  explanation?: string | null;
  points: number | string;
  order: number | string;
  metadata?: Record<string, any> | null;
  image_url?: string | null;
};

type PartLike = {
  id?: string;
  title: string;
  instructions?: string | null;
  passage_text?: string | null;
  passage_source?: string | null;
  audio_url?: string | null;
  audio_start_time?: string | number | null;
  audio_end_time?: string | number | null;
  image_url?: string | null;
  questions?: QuestionLike[];
};

const WRITING_TASK_DEFAULTS: Record<string, { min_words: number; recommended_minutes: number; task_type: string }> = {
  graph_description: {
    min_words: 150,
    recommended_minutes: 20,
    task_type: 'task_1_academic',
  },
  letter_writing: {
    min_words: 150,
    recommended_minutes: 20,
    task_type: 'task_1_general_training',
  },
  essay: {
    min_words: 250,
    recommended_minutes: 40,
    task_type: 'task_2',
  },
};

export function emptyToNull(value: unknown) {
  return value === '' || value === undefined ? null : value;
}

export function numberOrNull(value: unknown) {
  if (value === '' || value === undefined || value === null) return null;

  const next = Number(value);
  return Number.isNaN(next) ? null : next;
}

function toBackendBlankHtml(value: unknown) {
  if (typeof value !== 'string') return value;

  return value.replace(/___(\d+)___/g, '<b>$1</b> _____');
}

function toFormBlankToken(value: unknown) {
  if (typeof value !== 'string') return value;

  return value.replace(
    /<(?:b|strong)>\s*(\d+)\s*<\/(?:b|strong)>(?:\s|&nbsp;)*_{3,}/g,
    '___$1___'
  );
}

export function normalizeQuestionForForm(question: IQuestion) {
  const metadata = normalizeMetadataForForm(question.metadata);

  return {
    id: question.id || '',
    question_type: question.question_type || '',
    text: question.text || '',
    options: question.options || [],
    correct_answer: normalizeCorrectAnswerForForm(
      question.correct_answer,
      question.question_type
    ),
    explanation: question.explanation || '',
    points: question.points ?? 1,
    order: question.order ?? 1,
    metadata,
    image_url: question.image_url || '',
  };
}

export function normalizeMetadataForForm(metadata?: Record<string, any> | null) {
  const next = metadata ? { ...metadata } : {};

  ['notes_html', 'summary_html', 'form_html', 'flow_chart_html', 'instruction_html'].forEach(
    (key) => {
      if (next[key] !== undefined) next[key] = toFormBlankToken(next[key]);
    }
  );

  if (next.summary_html && !next.summary_text) next.summary_text = toFormBlankToken(next.summary_html);
  if (next.form_html && !next.form_layout_html) next.form_layout_html = next.form_html;
  if (next.flow_chart_html && !next.flow_chart_layout_html) {
    next.flow_chart_layout_html = next.flow_chart_html;
  }
  if (next.instruction_html && !next.diagram_instruction_html) {
    next.diagram_instruction_html = next.instruction_html;
  }

  if (next.min_words != null && next.word_limit_min == null) next.word_limit_min = next.min_words;
  if (next.recommended_minutes != null && next.time_recommended_minutes == null) {
    next.time_recommended_minutes = next.recommended_minutes;
  }
  if (next.visual_type && !next.graph_type) next.graph_type = next.visual_type;

  if (next.cue_card) {
    if (!next.topic) next.topic = next.cue_card.main_prompt;
    if (!next.bullet_points && Array.isArray(next.cue_card.bullet_points)) {
      next.bullet_points = next.cue_card.bullet_points.map((text: string) => ({ text }));
    }
  }
  if (next.speaking_seconds != null && next.speaking_max_seconds == null) {
    next.speaking_max_seconds = next.speaking_seconds;
  }
  if (Array.isArray(next.rounding_off_questions) && !next.rounding_off_question) {
    next.rounding_off_question = next.rounding_off_questions[0] || '';
  }
  if (next.expected_duration_seconds != null && next.suggested_time_seconds == null) {
    next.suggested_time_seconds = next.expected_duration_seconds;
  }

  return next;
}

const SINGLE_VALUE_MAPPING_TYPES = new Set([
  'matching',
  'matching_headings',
  'matching_information',
  'matching_features',
  'matching_sentence_endings',
  'map_labeling',
  'summary_completion_list',
]);

function buildCorrectAnswerPayload(correctAnswer: any, questionType?: string) {
  if (
    questionType &&
    SINGLE_VALUE_MAPPING_TYPES.has(questionType) &&
    correctAnswer &&
    typeof correctAnswer === 'object' &&
    !Array.isArray(correctAnswer)
  ) {
    return Object.fromEntries(
      Object.entries(correctAnswer).map(([key, value]) => [
        key,
        Array.isArray(value) ? value : value === '' || value == null ? [] : [value],
      ])
    );
  }

  return correctAnswer;
}

function normalizeCorrectAnswerForForm(correctAnswer: any, questionType?: string) {
  if (correctAnswer && typeof correctAnswer === 'object' && !Array.isArray(correctAnswer)) {
    if (questionType && SINGLE_VALUE_MAPPING_TYPES.has(questionType)) {
      return Object.fromEntries(
        Object.entries(correctAnswer).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] ?? '' : value ?? '',
        ])
      );
    }

    return { ...correctAnswer };
  }

  return correctAnswer ?? null;
}

export function buildSectionPayload(data: {
  section_type: string;
  exam_type: string;
  title: string;
  instructions: string;
  audio_url: string;
  duration_minutes: number | '';
  difficulty: string;
  tags: string;
}) {
  const sectionDuration = SECTION_DURATIONS[data.section_type as SectionType];

  return {
    section_type: data.section_type,
    exam_type: data.exam_type,
    title: data.title,
    instructions: emptyToNull(data.instructions),
    audio_url: emptyToNull(data.audio_url),
    duration_minutes: sectionDuration ?? numberOrNull(data.duration_minutes),
    difficulty: emptyToNull(data.difficulty),
    tags: data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : null,
  };
}

export function buildPartPayload(part: PartLike, order: number) {
  return {
    title: part.title,
    instructions: emptyToNull(part.instructions),
    passage_text: emptyToNull(part.passage_text),
    passage_source: emptyToNull(part.passage_source),
    audio_url: emptyToNull(part.audio_url),
    audio_start_time: numberOrNull(part.audio_start_time),
    audio_end_time: numberOrNull(part.audio_end_time),
    image_url: emptyToNull(part.image_url),
    order,
  };
}

export function buildQuestionPayload(question: QuestionLike, order: number) {
  return {
    question_type: question.question_type,
    text: question.text,
    options: question.options?.length ? question.options : null,
    correct_answer: buildCorrectAnswerPayload(
      question.correct_answer,
      question.question_type
    ),
    explanation: emptyToNull(question.explanation),
    points: Number(question.points) || 1,
    order: question.order ? Number(question.order) : order + 1,
    metadata: sanitizeQuestionMetadata(question.question_type, question.metadata),
    image_url: emptyToNull(question.image_url),
  };
}

export function getDefaultQuestionFormValues({
  order,
  partIndex,
  examType,
  sectionType,
}: {
  order: number;
  partIndex: number;
  examType?: string;
  sectionType?: string;
}) {
  const isWriting = sectionType === 'writing';
  const isTask1 = isWriting && partIndex === 0;
  const isGeneralTraining = examType === 'general_training';

  let questionType = '';
  let metadata: Record<string, any> = {};

  if (isTask1) {
    questionType = isGeneralTraining ? 'letter_writing' : 'graph_description';
    metadata = {
      ...WRITING_TASK_DEFAULTS[questionType],
      ...(isGeneralTraining ? { letter_type: '' } : { visual_type: '' }),
    };
  } else if (isWriting) {
    questionType = 'essay';
    metadata = {
      ...WRITING_TASK_DEFAULTS[questionType],
      essay_type: '',
    };
  }

  return {
    question_type: questionType,
    text: '',
    options: [],
    correct_answer: null,
    explanation: '',
    points: 1,
    order,
    metadata,
    image_url: '',
  };
}

export function sanitizeQuestionMetadata(
  questionType: string,
  metadata?: Record<string, any> | null
) {
  const meta = metadata && Object.keys(metadata).length ? { ...metadata } : null;
  if (!meta) return null;

  if (meta.summary_text) meta.summary_html = toBackendBlankHtml(meta.summary_text);
  if (meta.form_layout_html && !meta.form_html) meta.form_html = meta.form_layout_html;
  if (meta.flow_chart_layout_html && !meta.flow_chart_html) {
    meta.flow_chart_html = meta.flow_chart_layout_html;
  }
  if (meta.diagram_instruction_html && !meta.instruction_html) {
    meta.instruction_html = meta.diagram_instruction_html;
  }

  ['notes_html', 'summary_html', 'form_html', 'flow_chart_html', 'instruction_html'].forEach(
    (key) => {
      if (meta[key] !== undefined) meta[key] = toBackendBlankHtml(meta[key]);
    }
  );

  if (questionType === 'diagram_completion' && meta.blanks && !meta.slot_ids) {
    meta.slot_ids = meta.blanks;
  }

  if (meta.word_limit !== undefined && meta.word_limit !== '') {
    meta.word_limit = Number(meta.word_limit);
  }
  if (meta.select_count !== undefined && meta.select_count !== '') {
    meta.select_count = Number(meta.select_count);
  }
  if (meta.word_limit_min !== undefined && meta.word_limit_min !== '') {
    meta.min_words = Number(meta.word_limit_min);
  }
  if (meta.min_words !== undefined && meta.min_words !== '') {
    meta.min_words = Number(meta.min_words);
  }
  if (meta.time_recommended_minutes !== undefined && meta.time_recommended_minutes !== '') {
    meta.recommended_minutes = Number(meta.time_recommended_minutes);
  }
  if (meta.recommended_minutes !== undefined && meta.recommended_minutes !== '') {
    meta.recommended_minutes = Number(meta.recommended_minutes);
  }
  if (meta.graph_type && !meta.visual_type) meta.visual_type = meta.graph_type;

  if (WRITING_TASK_DEFAULTS[questionType]) {
    Object.assign(meta, WRITING_TASK_DEFAULTS[questionType]);
  }

  if (meta.group_label === '') delete meta.group_label;
  if (meta.group_instruction === '') delete meta.group_instruction;

  delete meta.word_limit_min;
  delete meta.time_recommended_minutes;
  delete meta.graph_type;
  delete meta.form_layout_html;
  delete meta.flow_chart_layout_html;
  delete meta.diagram_instruction_html;

  Object.keys(meta).forEach((key) => {
    if (meta[key] === '' || meta[key] === undefined) delete meta[key];
  });

  return Object.keys(meta).length ? meta : null;
}
