import type {
  Part,
  MapPin,
  MCOption,
  FlowStep,
  TableCell,
  MCQuestion,
  BlankField,
  FormSection,
  NoteSection,
  TableSection,
  CorrectAnswer,
  ListeningTest,
  QuestionGroup,
  SummaryParagraph,
  TableCellSegment,
} from '../types';

import { CONFIG } from '@/src/global-config';
import { endpoints, axiosInstance } from '@/src/lib/axios';
import { stripHtmlPreservingInlineFormatting } from '@/src/sections/practice/shared/inline-html-formatting';

import { LISTENING_DURATION_MINUTES } from '../constants';

type ApiRecord = Record<string, unknown>;

type ListeningDifficulty = ListeningTest['difficulty'];

type ApiQuestion = {
  correctAnswer?: unknown;
  id?: string;
  imageUrl?: string;
  metadata?: ApiRecord;
  options?: MCOption[];
  order?: number;
  questionType?: string;
  text?: string;
};

type ApiPart = {
  audioEndTime?: number;
  audioStartTime?: number;
  instructions?: string;
  questions: ApiQuestion[];
  title?: string;
};

type ApiSectionDetail = {
  audioUrl?: string;
  difficulty?: string;
  durationMinutes?: number;
  id: string;
  instructions?: string;
  parts: ApiPart[];
  title: string;
};

const BLANK_MARKER_REGEX = /___(\d+)___/g;
const HTML_BLANK_MARKER_REGEX = /<b>\s*(\d+)\s*<\/b>\s*'?_{2,}'?/gi;

// Converts explicit backend blank markers to ___N___ so existing parsers work.
// Do not convert bare "N ____" text: normal content can contain numbers (e.g. £90, Flat 4).
const preprocessBlankMarkers = (html: string): string =>
  html.replace(HTML_BLANK_MARKER_REGEX, '___$1___');

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.replace(/\s+/g, ' ').trim();
  return normalizedValue.length ? normalizedValue : undefined;
};

const pickId = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const pickNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseInt(value.trim(), 10);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const normalizeMediaUrl = (value: unknown) => {
  const rawValue = pickString(value);

  if (!rawValue) {
    return rawValue;
  }

  if (/^(https?:|data:|blob:)/i.test(rawValue)) {
    return rawValue;
  }

  const serverUrl = CONFIG.serverUrl.trim();

  if (!serverUrl) {
    return rawValue;
  }

  try {
    const serverOrigin = new URL(serverUrl).origin;
    const normalizedPath = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;

    return new URL(normalizedPath, serverOrigin).toString();
  } catch {
    return rawValue;
  }
};

const normalizeText = (value?: string) =>
  stripHtmlPreservingInlineFormatting(value ?? '')
    ?.replace(/&nbsp;/gi, ' ')
    ?.replace(/&amp;/gi, '&')
    ?.replace(/&quot;/gi, '"')
    ?.replace(/&#39;/gi, "'")
    ?.replace(/&lt;/gi, '<')
    ?.replace(/&gt;/gi, '>')
    ?.replace(/\s+/g, ' ')
    ?.trim() ?? '';

const toDifficulty = (value?: string): ListeningDifficulty => {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }

  return 'medium';
};

const toCorrectAnswer = (value: unknown): CorrectAnswer | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  const singleValue = pickString(value);

  if (singleValue) {
    return singleValue;
  }

  const values = asArray(value)
    .map((item) =>
      typeof item === 'number' && Number.isFinite(item) ? String(item) : pickString(item)
    )
    .filter((item): item is string => Boolean(item));

  if (values.length) {
    return values;
  }

  return undefined;
};

const getAnswerPreview = (answer?: CorrectAnswer) => {
  if (!answer) {
    return '';
  }

  return Array.isArray(answer) ? answer[0] ?? '' : answer;
};

const estimateAnswerLength = (answer?: CorrectAnswer, wordLimit?: number) => {
  const preview = getAnswerPreview(answer);

  if (preview.length) {
    return Math.max(4, Math.min(32, preview.length + 2));
  }

  if (typeof wordLimit === 'number' && Number.isFinite(wordLimit)) {
    return Math.max(4, Math.min(32, wordLimit * 6));
  }

  return 10;
};

const getWordLimit = (metadata?: ApiRecord) => {
  const rawValue = pickNumber(metadata?.word_limit);

  if (typeof rawValue === 'number') {
    return rawValue;
  }

  return undefined;
};

const buildLocalId = (backendQuestionId: string, number: number) => `${backendQuestionId}:${number}`;

const buildBlankField = (
  backendQuestionId: string,
  number: number,
  answer?: CorrectAnswer,
  options?: {
    label?: string;
    suffix?: string;
    wordLimit?: number;
  }
): BlankField => ({
  backendQuestionId,
  id: buildLocalId(backendQuestionId, number),
  number,
  label: options?.label ?? '',
  suffix: options?.suffix,
  answer: answer ?? '',
  answerLength: estimateAnswerLength(answer, options?.wordLimit),
});

const parseNumberedAnswers = (value: unknown, startNumber = 1) => {
  const record = asRecord(value);
  const answers = new Map<number, CorrectAnswer>();

  if (!record) {
    asArray(value).forEach((answerValue, index) => {
      const answer = toCorrectAnswer(answerValue);

      if (answer) {
        answers.set(startNumber + index, answer);
      }
    });

    return answers;
  }

  Object.entries(record).forEach(([key, answerValue]) => {
    const number = Number.parseInt(key, 10);
    const answer = toCorrectAnswer(answerValue);

    if (Number.isFinite(number) && answer) {
      answers.set(number, answer);
    }
  });

  return answers;
};

const stripHtmlToLines = (html?: string) => {
  if (!html) {
    return [] as string[];
  }

  const text = stripHtmlPreservingInlineFormatting(html)
    .replace(/\n{2,}/g, '\n');

  return text
    .split('\n')
    .map((line) => normalizeText(line))
    .filter(Boolean);
};

const extractFirstHeadingText = (html?: string) => {
  const headingMatch = html?.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);

  return headingMatch ? normalizeText(headingMatch[1]) : undefined;
};

type HtmlTextBlock = {
  tag: string;
  text: string;
};

const isHeadingBlock = (block: HtmlTextBlock) => /^h[1-6]$/i.test(block.tag);

const extractHtmlTextBlocks = (html?: string): HtmlTextBlock[] => {
  if (!html) {
    return [];
  }

  const blockPattern = /<(h[1-6]|p|li|tr|td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const blocks: HtmlTextBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = normalizeText(match[2]);

    if (text) {
      blocks.push({ tag, text });
    }
  }

  if (blocks.length) {
    return blocks;
  }

  return stripHtmlToLines(html).map((text) => ({ tag: 'p', text }));
};

const splitTextWithBlanks = (
  text: string,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): TableCellSegment[] => {
  const segments: TableCellSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BLANK_MARKER_REGEX)) {
    const marker = match[0];
    const rawNumber = match[1];
    const markerIndex = match.index ?? -1;

    if (markerIndex < 0) {
      continue;
    }

    const beforeText = normalizeText(text.slice(lastIndex, markerIndex));

    if (beforeText) {
      segments.push({
        type: 'text',
        content: beforeText,
      });
    }

    const number = Number.parseInt(rawNumber, 10);
    const answer = answersByNumber.get(number);

    segments.push({
      type: 'blank',
      field: buildBlankField(backendQuestionId, number, answer, {
        wordLimit,
      }),
    });

    lastIndex = markerIndex + marker.length;
  }

  const afterText = normalizeText(text.slice(lastIndex));

  if (afterText) {
    segments.push({
      type: 'text',
      content: afterText,
    });
  }

  return segments;
};

const getBlankMarkerMatches = (text: string) => [...text.matchAll(BLANK_MARKER_REGEX)];

const parseBlankFieldsFromText = (
  text: string,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): BlankField[] => {
  const matches = getBlankMarkerMatches(text);

  return matches
    .map((match, index) => {
      const marker = match[0];
      const markerIndex = match.index ?? -1;

      if (markerIndex < 0) {
        return null;
      }

      const number = Number.parseInt(match[1], 10);
      const previousMatch = matches[index - 1];
      const nextMatch = matches[index + 1];
      const labelStart = previousMatch
        ? (previousMatch.index ?? 0) + previousMatch[0].length
        : 0;
      const suffixEnd = nextMatch?.index ?? text.length;
      const answer = answersByNumber.get(number);

      return buildBlankField(backendQuestionId, number, answer, {
        label: normalizeText(text.slice(labelStart, markerIndex)),
        suffix: normalizeText(text.slice(markerIndex + marker.length, suffixEnd)),
        wordLimit,
      });
    })
    .filter((field): field is BlankField => field !== null && Number.isFinite(field.number));
};

const parseNoteSections = (
  backendQuestionId: string,
  sourceHtml: string | undefined,
  fallbackTitle: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): { noteTitle?: string; sections: NoteSection[] } => {
  const preprocessed = sourceHtml ? preprocessBlankMarkers(sourceHtml) : sourceHtml;
  const blocks = extractHtmlTextBlocks(preprocessed);
  const explicitTitle = blocks[0] && isHeadingBlock(blocks[0]) ? blocks[0].text : extractFirstHeadingText(preprocessed);
  const firstLine = normalizeText(blocks[0]?.text);
  const implicitTitle = firstLine && !firstLine.match(BLANK_MARKER_REGEX) ? firstLine : undefined;
  const noteTitle = explicitTitle ?? implicitTitle ?? fallbackTitle;
  const contentBlocks = blocks.filter((block, index) => {
    if (explicitTitle && index === 0 && normalizeText(block.text) === explicitTitle) {
      return false;
    }

    if (!explicitTitle && implicitTitle && index === 0 && normalizeText(block.text) === implicitTitle) {
      return false;
    }

    return true;
  });

  const sections: NoteSection[] = [];
  let currentSection: NoteSection = { bullets: [] };

  const pushCurrentSection = () => {
    if (currentSection.heading || currentSection.bullets.length) {
      sections.push(currentSection);
    }
    currentSection = { bullets: [] };
  };

  (contentBlocks.length ? contentBlocks : [{ tag: 'p', text: fallbackTitle }]).forEach((block) => {
    if (isHeadingBlock(block) && !block.text.match(BLANK_MARKER_REGEX)) {
      pushCurrentSection();
      currentSection.heading = block.text;
      return;
    }

    const fields = parseBlankFieldsFromText(block.text, backendQuestionId, answersByNumber, wordLimit);

    if (!fields.length) {
      currentSection.bullets.push({
        text: block.text,
      });
      return;
    }

    fields.forEach((field) => {
      currentSection.bullets.push({
        text: field.label,
        field,
      });
    });
  });

  pushCurrentSection();

  return {
    noteTitle,
    sections: sections.length ? sections : [{ bullets: [{ text: fallbackTitle }] }],
  };
};

const getFieldNumber = (record: ApiRecord) => {
  const directNumber =
    pickNumber(record.order) ??
    pickNumber(record.number) ??
    pickNumber(record.question_number) ??
    pickNumber(record.questionNumber);

  if (typeof directNumber === 'number') {
    return directNumber;
  }

  const rawId = pickString(record.id) ?? pickString(record.question_id);
  const idNumber = rawId?.match(/\d+/)?.[0];

  return idNumber ? Number.parseInt(idNumber, 10) : undefined;
};

const buildFormFieldFromRecord = (
  backendQuestionId: string,
  record: ApiRecord,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): BlankField | null => {
  const number = getFieldNumber(record);

  if (typeof number !== 'number' || !Number.isFinite(number)) {
    return null;
  }

  const answer = answersByNumber.get(number);

  return buildBlankField(backendQuestionId, number, answer, {
    label:
      pickString(record.label) ??
      pickString(record.prompt) ??
      pickString(record.text) ??
      `Question ${number}`,
    suffix: pickString(record.suffix),
    wordLimit,
  });
};

const parseFormSections = (
  backendQuestionId: string,
  question: ApiQuestion,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): FormSection[] => {
  const metadata = question.metadata ?? {};
  const sections = asArray(metadata.sections)
    .map((section) => asRecord(section))
    .filter((section): section is ApiRecord => Boolean(section))
    .map((section) => ({
      fields: asArray(section.fields)
        .map((field) => asRecord(field))
        .filter((field): field is ApiRecord => Boolean(field))
        .map((field) => buildFormFieldFromRecord(backendQuestionId, field, answersByNumber, wordLimit))
        .filter((field): field is BlankField => field !== null),
      heading: pickString(section.heading) ?? pickString(section.title),
    }))
    .filter((section) => section.fields.length > 0);

  if (sections.length) {
    return sections;
  }

  const fields = asArray(metadata.fields)
    .map((field) => asRecord(field))
    .filter((field): field is ApiRecord => Boolean(field))
    .map((field) => buildFormFieldFromRecord(backendQuestionId, field, answersByNumber, wordLimit))
    .filter((field): field is BlankField => field !== null);

  if (fields.length) {
    return [
      {
        fields,
      },
    ];
  }

  const formLayoutFields = asArray(metadata.form_layout)
    .map((field) => asRecord(field))
    .filter((field): field is ApiRecord => Boolean(field))
    .flatMap((field) => {
      const label = pickString(field.label) ?? '';
      const value = preprocessBlankMarkers(pickString(field.value) ?? '');
      const parsedFields: BlankField[] = [];

      for (const match of value.matchAll(BLANK_MARKER_REGEX)) {
        const number = Number.parseInt(match[1], 10);
        const answer = answersByNumber.get(number);

        parsedFields.push(
          buildBlankField(backendQuestionId, number, answer, {
            label: label || `Question ${number}`,
            suffix: normalizeText(value.replace(match[0], '')),
            wordLimit,
          })
        );
      }

      return parsedFields;
    });

  if (formLayoutFields.length) {
    return [
      {
        fields: formLayoutFields,
      },
    ];
  }

  const sourceHtml =
    pickString(metadata.form_html) ??
    pickString(metadata.formHtml) ??
    pickString(metadata.form_layout_html) ??
    pickString(metadata.formLayoutHtml) ??
    pickString(metadata.html) ??
    question.text;
  const sourceBlocks = extractHtmlTextBlocks(preprocessBlankMarkers(sourceHtml ?? ''));
  const parsedSections: FormSection[] = [];
  let currentSection: FormSection = { fields: [] };

  const pushCurrentSection = () => {
    if (currentSection.heading || currentSection.fields.length) {
      parsedSections.push(currentSection);
    }
    currentSection = { fields: [] };
  };

  sourceBlocks.forEach((block) => {
    if (isHeadingBlock(block) && !block.text.match(BLANK_MARKER_REGEX)) {
      pushCurrentSection();
      currentSection.heading = block.text;
      return;
    }

    currentSection.fields.push(
      ...parseBlankFieldsFromText(block.text, backendQuestionId, answersByNumber, wordLimit)
    );
  });

  pushCurrentSection();

  const parsedFields = parsedSections.flatMap((section) => section.fields);

  return parsedFields.length
    ? parsedSections.filter((section) => section.fields.length > 0)
    : [];
};

const parseSummaryParagraphs = (
  backendQuestionId: string,
  sourceText: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): SummaryParagraph[] => {
  const sourceBlocks = extractHtmlTextBlocks(preprocessBlankMarkers(sourceText));

  if (sourceBlocks.length <= 1 && !/<[a-z][\s\S]*>/i.test(sourceText)) {
    return [
      {
        segments: splitTextWithBlanks(sourceText, backendQuestionId, answersByNumber, wordLimit),
      },
    ];
  }

  const paragraphs: SummaryParagraph[] = [];
  let currentParagraph: SummaryParagraph = { segments: [] };

  const pushCurrentParagraph = () => {
    if (currentParagraph.heading || currentParagraph.segments.length) {
      paragraphs.push(currentParagraph);
    }
    currentParagraph = { segments: [] };
  };

  sourceBlocks.forEach((block) => {
    if (isHeadingBlock(block) && !block.text.match(BLANK_MARKER_REGEX)) {
      pushCurrentParagraph();
      currentParagraph.heading = block.text;
      return;
    }

    currentParagraph.segments.push(
      ...splitTextWithBlanks(block.text, backendQuestionId, answersByNumber, wordLimit)
    );
  });

  pushCurrentParagraph();

  return paragraphs.length
    ? paragraphs
    : [
        {
          segments: splitTextWithBlanks(sourceText, backendQuestionId, answersByNumber, wordLimit),
        },
      ];
};

const normalizeChoiceOptions = (value: unknown): MCOption[] =>
  asArray(value)
    .map((option) => asRecord(option))
    .filter((option): option is ApiRecord => Boolean(option))
    .map((option) => ({
      value: pickString(option.label) ?? '',
      text: pickString(option.text) ?? '',
    }))
    .filter((option) => option.value && option.text);

const normalizeQuestion = (value: unknown): ApiQuestion | null => {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  return {
    correctAnswer:
      record.correct_answer ??
      record.correctAnswer ??
      record.correct_answers ??
      record.correctAnswers ??
      record.answer_key ??
      record.answerKey ??
      record.correct,
    id: pickId(record.id) ?? pickId(record.uuid) ?? pickId(record.question_id),
    imageUrl: normalizeMediaUrl(record.image_url),
    metadata: asRecord(record.metadata) ?? undefined,
    options: normalizeChoiceOptions(record.options),
    order: pickNumber(record.order),
    questionType: pickString(record.question_type),
    text: pickString(record.text),
  };
};

const normalizePart = (value: unknown): ApiPart | null => {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  return {
    audioEndTime: pickNumber(record.audio_end_time),
    audioStartTime: pickNumber(record.audio_start_time),
    instructions: pickString(record.instructions),
    questions: asArray(record.questions)
      .map(normalizeQuestion)
      .filter((question): question is ApiQuestion => question !== null)
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0)),
    title: pickString(record.title),
  };
};

const normalizeSectionDetail = (payload: unknown): ApiSectionDetail => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return {
    audioUrl: pickString(data.audio_url),
    difficulty: pickString(data.difficulty),
    durationMinutes: LISTENING_DURATION_MINUTES,
    id: pickString(data.id) ?? '',
    instructions: pickString(data.instructions),
    parts: asArray(data.parts)
      .map(normalizePart)
      .filter((part): part is ApiPart => part !== null),
    title: pickString(data.title) ?? 'Listening practice test',
  };
};

const buildTableCell = (
  text: string,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): TableCell => {
  const normalizedText = normalizeText(preprocessBlankMarkers(text));

  if (!normalizedText.match(BLANK_MARKER_REGEX)) {
    return {
      content: normalizedText,
      isBlank: false,
    };
  }

  return {
    isBlank: false,
    segments: splitTextWithBlanks(normalizedText, backendQuestionId, answersByNumber, wordLimit),
  };
};

const buildTableRows = (
  rowsValue: unknown,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
) =>
  asArray(rowsValue).map((row) =>
    asArray(row).map((cell) =>
      buildTableCell(pickString(cell) ?? '', backendQuestionId, answersByNumber, wordLimit)
    )
  );

const buildTableSections = (
  sectionsValue: unknown,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): TableSection[] =>
  asArray(sectionsValue)
    .map((section) => asRecord(section))
    .filter((section): section is ApiRecord => Boolean(section))
    .map((section) => ({
      rows: buildTableRows(section.rows, backendQuestionId, answersByNumber, wordLimit),
      title: pickString(section.title) ?? 'Section',
    }))
    .filter((section) => section.rows.length > 0);

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const toPercent = (value: number, maxValue: number) => {
  if (!maxValue) {
    return clampPercent(value);
  }

  return clampPercent((value / maxValue) * 100);
};

const buildMapPins = (
  backendQuestionId: string,
  labelsValue: unknown,
  answersByNumber: Map<number, CorrectAnswer>,
  options?: {
    imageHeight?: number;
    imageWidth?: number;
  }
): MapPin[] => {
  const labels = asArray(labelsValue)
    .map((label) => asRecord(label))
    .filter((label): label is ApiRecord => Boolean(label));

  const maxX = labels.reduce((currentMax, label) => Math.max(currentMax, pickNumber(label.x) ?? 0), 1);
  const maxY = labels.reduce((currentMax, label) => Math.max(currentMax, pickNumber(label.y) ?? 0), 1);
  const imageWidth = options?.imageWidth;
  const imageHeight = options?.imageHeight;
  const usesFractionCoordinates = maxX <= 1 && maxY <= 1;
  const usesPercentCoordinates = !usesFractionCoordinates && maxX <= 100 && maxY <= 100;

  return labels
    .map((label): MapPin | null => {
      const rawNumber = pickString(label.id) ?? '';
      const number = Number.parseInt(rawNumber, 10);
      const answer = answersByNumber.get(number);
      const rawX = pickNumber(label.x) ?? 0;
      const rawY = pickNumber(label.y) ?? 0;

      if (!Number.isFinite(number)) {
        return null;
      }

      return {
        backendQuestionId,
        id: buildLocalId(backendQuestionId, number),
        number,
        x: usesFractionCoordinates
          ? clampPercent(rawX * 100)
          : usesPercentCoordinates
            ? clampPercent(rawX)
            : toPercent(rawX, imageWidth ?? maxX),
        y: usesFractionCoordinates
          ? clampPercent(rawY * 100)
          : usesPercentCoordinates
            ? clampPercent(rawY)
            : toPercent(rawY, imageHeight ?? maxY),
        answer: answer ?? '',
        answerLength: estimateAnswerLength(answer),
      };
    })
    .filter((pin): pin is MapPin => pin !== null);
};

const normalizeChoiceQuestion = (
  question: ApiQuestion,
  backendQuestionId: string,
  questionNumber: number
): MCQuestion => {
  const correctAnswer = toCorrectAnswer(question.correctAnswer) ?? '';
  const selectCount = pickNumber(question.metadata?.select_count);
  const numbers =
    selectCount && selectCount > 1
      ? Array.from({ length: selectCount }, (_, i) => questionNumber + i)
      : undefined;

  return {
    backendQuestionId,
    id: buildLocalId(backendQuestionId, questionNumber),
    multiSelect: question.questionType === 'multiple_choice' || Array.isArray(correctAnswer),
    number: questionNumber,
    numbers,
    options: question.options ?? [],
    answer: Array.isArray(correctAnswer) ? correctAnswer.join(',') : correctAnswer,
    selectCount,
    text: question.text ?? `Question ${questionNumber}`,
  };
};

const parseFlowChartHtml = (
  html: string,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number,
  selectOptions?: MCOption[]
): FlowStep[] => {
  const preprocessed = preprocessBlankMarkers(html);
  const elementPattern = /<div[^>]*class=['"](?:step|arrow)['"][^>]*>([\s\S]*?)<\/div>/gi;
  const steps: FlowStep[] = [];
  let firstStep = true;
  let match: RegExpExecArray | null;

  while ((match = elementPattern.exec(preprocessed)) !== null) {
    const fullTag = match[0];
    const content = match[1];
    const isArrow = /class=['"]arrow['"]/.test(fullTag);

    if (isArrow) {
      if (!firstStep) {
        steps.push({ content: '↓', isBlank: false });
      }
      continue;
    }

    const normalizedContent = normalizeText(content);
    const blankMatch = normalizedContent.match(BLANK_MARKER_REGEX);

    if (!blankMatch) {
      steps.push({ content: normalizedContent, isBlank: false });
    } else {
      const [marker] = blankMatch;
      const number = Number.parseInt(marker.replaceAll('_', ''), 10);
      const answer = answersByNumber.get(number);

      steps.push({
        answer: answer ?? '',
        answerLength: estimateAnswerLength(answer, wordLimit),
        backendQuestionId,
        content: normalizedContent.replace(marker, '_______'),
        id: buildLocalId(backendQuestionId, number),
        isBlank: true,
        number,
        selectOptions,
      });
    }

    firstStep = false;
  }

  return steps;
};

const resolveGroupInstructions = (questions: ApiQuestion[]): Map<string, string> => {
  const map = new Map<string, string>();

  for (const question of questions) {
    const groupId = pickString(question.metadata?.group_id);
    const instruction = pickString(question.metadata?.group_instruction);

    if (groupId && instruction && !map.has(groupId)) {
      map.set(groupId, instruction);
    }
  }

  return map;
};

const toQuestionGroup = (
  question: ApiQuestion,
  index: number,
  groupInstructions?: Map<string, string>
): QuestionGroup | null => {
  const backendQuestionId = question.id ?? `question-${index + 1}`;
  const questionNumber = question.order ?? index + 1;
  const groupId = pickString(question.metadata?.group_id);
  const instructions =
    pickString(question.metadata?.group_instruction) ??
    (groupId ? groupInstructions?.get(groupId) : undefined) ??
    pickString(question.metadata?.instruction) ??
    'Answer the question.';
  const wordLimit = getWordLimit(question.metadata);

  if (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') {
    return {
      type: 'multiple-choice',
      instructions,
      questions: [normalizeChoiceQuestion(question, backendQuestionId, questionNumber)],
    };
  }

  if (question.questionType === 'matching') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const items = asArray(question.metadata?.items)
      .map((item) => asRecord(item))
      .filter((item): item is ApiRecord => Boolean(item));
    const inputMode = pickString(question.metadata?.input_mode);

    return {
      type: 'matching',
      instructions,
      data: {
        options: (question.options ?? []).map((option) => ({
          value: option.value,
          label: `${option.value} ${option.text}`.trim(),
        })),
        pairs: items
          .map((item) => {
            const number = pickNumber(item.order);
            const answer = number ? answersByNumber.get(number) : undefined;

            if (typeof number !== 'number') {
              return null;
            }

            return {
              backendQuestionId,
              id: buildLocalId(backendQuestionId, number),
              number,
              text: pickString(item.text) ?? `Question ${number}`,
              answer: answer ?? '',
            };
          })
          .filter((pair): pair is NonNullable<typeof pair> => pair !== null),
        showOptionsPanel: inputMode !== 'select',
      },
    };
  }

  if (question.questionType === 'form_completion') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const sections = parseFormSections(backendQuestionId, question, answersByNumber, wordLimit);

    if (!sections.length) {
      return null;
    }

    return {
      type: 'form-completion',
      formTitle:
        pickString(question.metadata?.form_title) ??
        pickString(question.metadata?.formTitle) ??
        question.text ??
        `Questions ${questionNumber}`,
      instructions,
      sections,
    };
  }

  if (question.questionType === 'note_completion') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const notesHtml = pickString(question.metadata?.notes_html);
    const parsedNote = parseNoteSections(
      backendQuestionId,
      notesHtml,
      question.text ?? `Notes ${questionNumber}`,
      answersByNumber,
      wordLimit
    );

    return {
      type: 'note-completion',
      instructions,
      noteTitle: parsedNote.noteTitle,
      sections: parsedNote.sections,
    };
  }

  if (question.questionType === 'table_completion') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const table = asRecord(question.metadata?.table);

    if (!table) {
      return null;
    }

    return {
      type: 'table-completion',
      instructions,
      tableTitle: question.text,
      data: {
        headers: asArray(table.headers).map((header) => pickString(header) ?? ''),
        rows: buildTableRows(table.rows, backendQuestionId, answersByNumber, wordLimit),
        sections: buildTableSections(table.sections, backendQuestionId, answersByNumber, wordLimit),
      },
    };
  }

  if (question.questionType === 'map_labeling') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const imageWidth =
      pickNumber(question.metadata?.image_width) ??
      pickNumber(question.metadata?.natural_width) ??
      pickNumber(question.metadata?.width);
    const imageHeight =
      pickNumber(question.metadata?.image_height) ??
      pickNumber(question.metadata?.natural_height) ??
      pickNumber(question.metadata?.height);

    return {
      type: 'map-labelling',
      instructions,
      data: {
        imageUrl: question.imageUrl,
        legendOptions: question.options ?? [],
        panelTitle: question.text,
        showBadges: true,
        wordBank:
          pickString(question.metadata?.input_mode) === 'select_from_list'
            ? (question.options ?? []).map((option) => option.value)
            : [],
        pins: buildMapPins(backendQuestionId, question.metadata?.labels_on_image, answersByNumber, {
          imageHeight,
          imageWidth,
        }),
      },
    };
  }

  if (question.questionType === 'flow_chart_completion') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const flowChartHtml = pickString(question.metadata?.flow_chart_html);
    const stepsArray = asArray(question.metadata?.steps);

    let steps: FlowStep[];

    const inputMode = pickString(question.metadata?.input_mode);
    const flowChartSelectOptions =
      inputMode === 'select'
        ? (question.options ?? []).map((opt) => ({ value: opt.value, text: opt.text }))
        : undefined;

    if (flowChartHtml) {
      steps = parseFlowChartHtml(flowChartHtml, backendQuestionId, answersByNumber, wordLimit, flowChartSelectOptions);
    } else {
      steps = stepsArray
        .map((step) => asRecord(step))
        .filter((step): step is ApiRecord => Boolean(step))
        .flatMap((step, stepIndex) => {
          const text = pickString(step.text) ?? `Step ${stepIndex + 1}`;
          const match = text.match(BLANK_MARKER_REGEX);
          const items: FlowStep[] = [];

          if (stepIndex > 0) {
            items.push({ content: '↓', isBlank: false });
          }

          if (!match) {
            items.push({ content: text, isBlank: false });
            return items;
          }

          const [marker] = match;
          const number = Number.parseInt(marker.replaceAll('_', ''), 10);
          const answer = answersByNumber.get(number);

          items.push({
            answer: answer ?? '',
            answerLength: estimateAnswerLength(answer, wordLimit),
            backendQuestionId,
            content: text.replace(marker, '_______'),
            id: buildLocalId(backendQuestionId, number),
            isBlank: true,
            number,
          });

          return items;
        });
    }

    return {
      type: 'flow-chart',
      chartTitle: question.text ?? `Flow chart ${questionNumber}`,
      instructions,
      steps,
    };
  }

  if (question.questionType === 'summary_completion_free') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const summaryText =
      pickString(question.metadata?.summary_text) ??
      pickString(question.metadata?.summary_html) ??
      pickString(question.metadata?.summaryHtml) ??
      question.text ??
      '';

    return {
      type: 'summary-completion',
      instructions,
      paragraphs: parseSummaryParagraphs(backendQuestionId, summaryText, answersByNumber, wordLimit),
      summaryTitle: question.text,
    };
  }

  if (question.questionType === 'diagram_completion') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const blanks = asArray(question.metadata?.blanks)
      .map((value) => Number.parseInt(String(value), 10))
      .filter((value) => Number.isFinite(value));

    return {
      type: 'diagram-completion',
      instructions,
      data: {
        imageUrl: question.imageUrl,
        instructions,
        questions: blanks.map((number) =>
          buildBlankField(backendQuestionId, number, answersByNumber.get(number), {
            wordLimit,
          })
        ),
        title: question.text,
      },
    };
  }

  if (question.questionType === 'sentence_completion' || question.questionType === 'short_answer') {
    const answersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
    const text = question.text ?? `Question ${questionNumber}`;
    const segments = splitTextWithBlanks(text, backendQuestionId, answersByNumber, wordLimit);
    const questions = segments
      .filter((segment): segment is Extract<TableCellSegment, { type: 'blank' }> => segment.type === 'blank')
      .map((segment) => segment.field);

    return {
      type: question.questionType === 'short_answer' ? 'short-answer' : 'sentence-completion',
      instructions,
      questions,
    };
  }

  const fallbackAnswersByNumber = parseNumberedAnswers(question.correctAnswer, questionNumber);
  const fallbackText =
    pickString(question.metadata?.form_html) ??
    pickString(question.metadata?.formHtml) ??
    pickString(question.metadata?.form_layout_html) ??
    pickString(question.metadata?.formLayoutHtml) ??
    pickString(question.metadata?.summary_text) ??
    pickString(question.metadata?.summary_html) ??
    pickString(question.metadata?.summaryHtml) ??
    question.text ??
    '';

  if (preprocessBlankMarkers(fallbackText).match(BLANK_MARKER_REGEX)) {
    const sections = parseFormSections(
      backendQuestionId,
      question,
      fallbackAnswersByNumber,
      wordLimit
    );

    if (sections.length) {
      return {
        type: 'form-completion',
        formTitle: question.text ?? `Questions ${questionNumber}`,
        instructions,
        sections,
      };
    }
  }

  return null;
};

const mergeAdjacentGroups = (groups: QuestionGroup[]) => {
  const mergedGroups: QuestionGroup[] = [];

  for (const group of groups) {
    const previousGroup = mergedGroups.at(-1);

    if (
      previousGroup?.type === 'multiple-choice' &&
      group.type === 'multiple-choice' &&
      previousGroup.instructions === group.instructions
    ) {
      previousGroup.questions.push(...group.questions);
      continue;
    }

    mergedGroups.push(group);
  }

  return mergedGroups;
};

function supportsLocalScoring(parts: Part[]) {
  return parts.every((part) =>
    part.groups.every((group) => {
      if (group.type === 'multiple-choice') {
        return group.questions.every((question) => getAnswerPreview(question.answer));
      }

      if (group.type === 'matching') {
        return group.data.pairs.every((pair) => getAnswerPreview(pair.answer));
      }

      if (group.type === 'form-completion') {
        return group.sections.every((section) =>
          section.fields.every((field) => getAnswerPreview(field.answer))
        );
      }

      if (group.type === 'note-completion') {
        return group.sections.every((section) =>
          section.bullets.every((bullet) => !bullet.field || getAnswerPreview(bullet.field.answer))
        );
      }

      if (group.type === 'table-completion') {
        return [...(group.data.rows ?? []), ...(group.data.sections?.flatMap((section) => section.rows) ?? [])].every((row) =>
          row.every((cell) =>
            cell.segments?.length
              ? cell.segments.every(
                  (segment) => segment.type === 'text' || getAnswerPreview(segment.field.answer)
                )
              : !cell.isBlank || getAnswerPreview(cell.answer)
          )
        );
      }

      if (group.type === 'flow-chart') {
        return group.steps.every((step) => !step.isBlank || getAnswerPreview(step.answer));
      }

      if (group.type === 'sentence-completion' || group.type === 'short-answer') {
        return group.questions.every((question) => getAnswerPreview(question.answer));
      }

      if (group.type === 'map-labelling') {
        return group.data.pins.every((pin) => getAnswerPreview(pin.answer));
      }

      if (group.type === 'diagram-completion') {
        return group.data.questions.every((question) => getAnswerPreview(question.answer));
      }

      if (group.type === 'summary-completion') {
        return group.paragraphs.every((paragraph) =>
          paragraph.segments.every(
            (segment) => segment.type === 'text' || getAnswerPreview(segment.field.answer)
          )
        );
      }

      return false;
    })
  );
}

export async function getListeningSectionDetail(sectionId: string): Promise<ListeningTest> {
  const response = await axiosInstance.get(endpoints.sections.details(sectionId));
  const section = normalizeSectionDetail(response.data);

  const parts: Part[] = section.parts.map((part, partIndex) => {
    const groupInstructions = resolveGroupInstructions(part.questions);

    return {
    audioEndTime: part.audioEndTime,
    audioStartTime: part.audioStartTime,
    audioUrl: section.audioUrl,
    groups: mergeAdjacentGroups(
      part.questions
        .map((question, questionIndex) => toQuestionGroup(question, questionIndex, groupInstructions))
        .filter((group): group is QuestionGroup => group !== null)
    ),
    number: partIndex + 1,
    scenario: part.instructions ?? section.instructions ?? 'Listen carefully and answer the questions.',
    title: part.title ?? `Part ${partIndex + 1}`,
    };
  });

  return {
    description:
      section.instructions ??
      parts
        .map((part) => part.title)
        .filter(Boolean)
        .join(' • '),
    difficulty: toDifficulty(section.difficulty),
    durationMinutes: section.durationMinutes,
    id: section.id || sectionId,
    parts,
    supportsLocalScoring: supportsLocalScoring(parts),
    title: section.title,
  };
}
