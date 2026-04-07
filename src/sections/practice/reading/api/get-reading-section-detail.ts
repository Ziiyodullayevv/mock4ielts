import type {
  MCOption,
  TableCell,
  MCQuestion,
  NoteSection,
  ReadingTest,
  QuestionGroup,
  CorrectAnswer,
  MatchingOption,
  SummaryParagraph,
  TableCellSegment,
} from '../types';

import { CONFIG } from '@/src/global-config';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

type ApiOption = {
  label?: string;
  text?: string;
  value?: string;
};

type ApiQuestion = {
  correct_answer?: unknown;
  correctAnswer?: unknown;
  id?: string;
  image_url?: string;
  imageUrl?: string;
  metadata?: ApiRecord;
  options?: ApiOption[];
  order?: number;
  points?: number;
  question_type?: string;
  questionType?: string;
  text?: string;
};

type ApiPart = {
  instructions?: string;
  passage_text?: string;
  passageText?: string;
  questions?: ApiQuestion[];
  title?: string;
};

type ApiSectionDetail = {
  data?: ApiRecord;
  difficulty?: string;
  duration_minutes?: number;
  durationMinutes?: number;
  id: string;
  instructions?: string;
  parts?: ApiPart[];
  title?: string;
};

type OptionEntry = {
  displayLabel: string;
  text: string;
  value: string;
};

const BLANK_MARKER_REGEX = /___(\d+)___/g;

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    const normalizedValue = value.replace(/\s+/g, ' ').trim();

    if (normalizedValue.length) {
      return normalizedValue;
    }
  }

  return undefined;
};

const pickNumber = (...values: unknown[]) =>
  values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));

const normalizeText = (value?: string) =>
  value
    ?.replace(/&nbsp;/gi, ' ')
    ?.replace(/&amp;/gi, '&')
    ?.replace(/&quot;/gi, '"')
    ?.replace(/&#39;/gi, "'")
    ?.replace(/&lt;/gi, '<')
    ?.replace(/&gt;/gi, '>')
    ?.replace(/\s+/g, ' ')
    ?.trim() ?? '';

const normalizeMediaUrl = (value: unknown) => {
  const rawValue = pickString(value);

  if (!rawValue) {
    return undefined;
  }

  if (/^(https?:|data:|blob:)/i.test(rawValue)) {
    return rawValue;
  }

  const serverUrl = CONFIG.serverUrl.trim();

  if (!serverUrl) {
    return rawValue;
  }

  try {
    const normalizedPath = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;

    return new URL(normalizedPath, serverUrl).toString();
  } catch {
    return rawValue;
  }
};

const toDifficulty = (value?: string): ReadingTest['difficulty'] => {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }

  return 'medium';
};

const toCorrectAnswer = (value: unknown): CorrectAnswer | undefined => {
  const singleValue = pickString(value);

  if (singleValue) {
    return singleValue;
  }

  const values = asArray(value)
    .map((item) => pickString(item))
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
    return Math.max(4, Math.min(36, preview.length + 4));
  }

  if (typeof wordLimit === 'number') {
    return Math.max(4, Math.min(36, wordLimit * 8));
  }

  return 12;
};

const getWordLimit = (metadata?: ApiRecord) =>
  pickNumber(metadata?.word_limit, metadata?.wordLimit);

const parseNumberedAnswers = (value: unknown) => {
  const record = asRecord(value);
  const answers = new Map<number, CorrectAnswer>();

  if (!record) {
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
) => ({
  answer: answer ?? '',
  answerLength: estimateAnswerLength(answer, options?.wordLimit),
  backendQuestionId,
  id: buildLocalId(backendQuestionId, number),
  label: options?.label ?? '',
  number,
  suffix: options?.suffix,
});

const splitPromptByBlankMarker = (text: string, markerNumber: number) => {
  const marker = `___${markerNumber}___`;
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) {
    return {
      label: '',
      suffix: undefined,
      textBefore: normalizeText(text),
    };
  }

  return {
    label: '',
    suffix: normalizeText(text.slice(markerIndex + marker.length)),
    textBefore: normalizeText(text.slice(0, markerIndex)),
  };
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
    const markerIndex = match.index ?? -1;
    const markerValue = match[1];
    const number = Number.parseInt(markerValue, 10);

    if (markerIndex === -1 || !Number.isFinite(number)) {
      continue;
    }

    const content = normalizeText(text.slice(lastIndex, markerIndex));

    if (content) {
      segments.push({
        content: content.endsWith(' ') ? content : `${content} `,
        type: 'text',
      });
    }

    segments.push({
      field: buildBlankField(backendQuestionId, number, answersByNumber.get(number), {
        wordLimit,
      }),
      type: 'blank',
    });

    lastIndex = markerIndex + match[0].length;
  }

  const trailingText = normalizeText(text.slice(lastIndex));

  if (trailingText) {
    segments.push({
      content: trailingText,
      type: 'text',
    });
  }

  return segments;
};

const buildOptionEntries = (value: unknown): OptionEntry[] =>
  asArray(value).map((option, index) => {
    const record = asRecord(option) ?? {};
    const displayLabel = pickString(record.label, record.value) ?? String.fromCharCode(65 + index);
    const text = pickString(record.text) ?? displayLabel;

    return {
      displayLabel,
      text,
      value: displayLabel,
    };
  });

const resolveChoiceValue = (value: unknown, options: OptionEntry[]) => {
  const rawValue = pickString(value);

  if (!rawValue) {
    return '';
  }

  const exactOption = options.find(
    (option) =>
      option.value.toLowerCase() === rawValue.toLowerCase() ||
      option.displayLabel.toLowerCase() === rawValue.toLowerCase()
  );

  if (exactOption) {
    return exactOption.value;
  }

  if (/^[A-Z]$/i.test(rawValue)) {
    const optionIndex = rawValue.toUpperCase().charCodeAt(0) - 65;

    if (options[optionIndex]) {
      return options[optionIndex].value;
    }
  }

  return rawValue;
};

const resolveOptionText = (value: unknown, options: OptionEntry[]) => {
  const resolvedValue = resolveChoiceValue(value, options);

  return options.find((option) => option.value === resolvedValue)?.text ?? resolvedValue;
};

const buildInstruction = (prompt?: string, detail?: string) =>
  [normalizeText(prompt), normalizeText(detail)].filter(Boolean).join(' ');

const normalizeCoordinate = (value: number, maxValue: number) => {
  if (maxValue <= 100) {
    return Math.max(4, Math.min(96, value));
  }

  return Math.max(4, Math.min(96, (value / maxValue) * 100));
};

const buildStatementOptions = (questionType: string): MCOption[] => {
  if (questionType === 'yes_no_not_given') {
    return [
      { text: 'YES', value: 'Y' },
      { text: 'NO', value: 'N' },
      { text: 'NOT GIVEN', value: 'NG' },
    ];
  }

  return [
    { text: 'TRUE', value: 'T' },
    { text: 'FALSE', value: 'F' },
    { text: 'NOT GIVEN', value: 'NG' },
  ];
};

const buildStatementAnswer = (questionType: string, value: unknown) => {
  const rawValue = pickString(value)?.toUpperCase();

  if (!rawValue) {
    return '';
  }

  if (questionType === 'yes_no_not_given') {
    if (rawValue === 'YES' || rawValue === 'Y') return 'Y';
    if (rawValue === 'NO' || rawValue === 'N') return 'N';

    return 'NG';
  }

  if (rawValue === 'TRUE' || rawValue === 'T') return 'T';
  if (rawValue === 'FALSE' || rawValue === 'F') return 'F';

  return 'NG';
};

const parseNotesHtml = (
  html: string,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
) => {
  const fallback = {
    noteTitle: undefined as string | undefined,
    sections: [] as NoteSection[],
  };

  if (typeof DOMParser === 'undefined') {
    return fallback;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const bodyChildren = Array.from(document.body.children);
  const sections: NoteSection[] = [];
  let noteTitle: string | undefined;
  let currentSection: NoteSection = { heading: undefined, bullets: [] };

  const flushSection = () => {
    if (currentSection.heading || currentSection.bullets.length) {
      sections.push(currentSection);
    }

    currentSection = { heading: undefined, bullets: [] };
  };

  const addBullet = (text: string) => {
    const normalizedLine = normalizeText(text);

    if (!normalizedLine) {
      return;
    }

    const marker = normalizedLine.match(BLANK_MARKER_REGEX);

    if (!marker?.[0]) {
      currentSection.bullets.push({ text: normalizedLine });
      return;
    }

    const markerNumber = Number.parseInt(marker[0].replaceAll('_', ''), 10);
    const markerIndex = normalizedLine.indexOf(marker[0]);

    if (!Number.isFinite(markerNumber) || markerIndex === -1) {
      currentSection.bullets.push({ text: normalizedLine });
      return;
    }

    currentSection.bullets.push({
      text: normalizeText(normalizedLine.slice(0, markerIndex)),
      field: buildBlankField(backendQuestionId, markerNumber, answersByNumber.get(markerNumber), {
        suffix: normalizeText(normalizedLine.slice(markerIndex + marker[0].length)),
        wordLimit,
      }),
    });
  };

  bodyChildren.forEach((child) => {
    const tagName = child.tagName.toLowerCase();
    const textContent = normalizeText(child.textContent ?? '');

    if (!textContent) {
      return;
    }

    if (/^h[1-6]$/.test(tagName)) {
      if (!noteTitle) {
        noteTitle = textContent;
        return;
      }

      if (currentSection.heading || currentSection.bullets.length) {
        flushSection();
      }

      currentSection.heading = textContent;
      return;
    }

    if (tagName === 'ul' || tagName === 'ol') {
      Array.from(child.children).forEach((item) => {
        if (item.tagName.toLowerCase() === 'li') {
          addBullet(item.textContent ?? '');
        }
      });
      return;
    }

    if (tagName === 'li') {
      addBullet(child.textContent ?? '');
      return;
    }

    if (!currentSection.heading && !currentSection.bullets.length) {
      currentSection.heading = textContent;
      return;
    }

    addBullet(textContent);
  });

  flushSection();

  return {
    noteTitle,
    sections,
  };
};

const buildMatchingGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const items = asArray(metadata.items);
  const options = buildOptionEntries(question.options).map(
    (option): MatchingOption => ({
      label: option.text === option.displayLabel ? option.displayLabel : `${option.displayLabel} ${option.text}`,
      value: option.value,
    })
  );
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);

  if (!items.length || !options.length) {
    return null;
  }

  return {
    data: {
      options,
      pairs: items
        .map((item) => {
          const record = asRecord(item) ?? {};
          const number = pickNumber(record.order);
          const text = pickString(record.text);

          if (typeof number !== 'number' || !text) {
            return null;
          }

          return {
            answer: resolveChoiceValue(getAnswerPreview(answersByNumber.get(number)), buildOptionEntries(question.options)),
            backendQuestionId,
            id: buildLocalId(backendQuestionId, number),
            number,
            text,
          };
        })
        .filter((pair): pair is NonNullable<typeof pair> => pair !== null),
    },
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    type: 'matching',
  };
};

const buildSentenceCompletionGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const wordLimit = getWordLimit(metadata);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);
  const sentences = asArray(metadata.sentences);

  if (!sentences.length) {
    return null;
  }

  return {
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    questions: sentences
      .map((sentence) => {
        const record = asRecord(sentence) ?? {};
        const number = pickNumber(record.order);
        const text = pickString(record.text);

        if (typeof number !== 'number' || !text) {
          return null;
        }

        const promptParts = splitPromptByBlankMarker(text, number);

        return buildBlankField(backendQuestionId, number, answersByNumber.get(number), {
          label: promptParts.textBefore ?? normalizeText(text),
          suffix: promptParts.suffix,
          wordLimit,
        });
      })
      .filter((field): field is NonNullable<typeof field> => field !== null),
    type: 'sentence-completion',
  };
};

const buildShortAnswerGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const wordLimit = getWordLimit(metadata);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);
  const subQuestions = asArray(metadata.sub_questions);

  if (!subQuestions.length) {
    return null;
  }

  return {
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    questions: subQuestions.flatMap((entry) => {
      const record = asRecord(entry) ?? {};
      const text = pickString(record.text);
      const slots = asArray(record.slots)
        .map((slot) => (typeof slot === 'number' ? slot : undefined))
        .filter((slot): slot is number => typeof slot === 'number');

      if (!text || !slots.length) {
        return [];
      }

      return slots.map((number) => ({
        ...buildBlankField(backendQuestionId, number, answersByNumber.get(number), {
          label: '',
          suffix: undefined,
          wordLimit,
        }),
        label: text,
      }));
    }),
    type: 'short-answer',
  };
};

const buildDiagramCompletionGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const wordLimit = getWordLimit(metadata);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);
  const blanks = asArray(metadata.blanks)
    .map((item) =>
      typeof item === 'number'
        ? item
        : typeof item === 'string'
          ? Number.parseInt(item, 10)
          : undefined
    )
    .filter((item): item is number => Number.isFinite(item));

  if (!blanks.length) {
    return null;
  }

  return {
    data: {
      imageUrl: normalizeMediaUrl(question.image_url ?? question.imageUrl),
      questions: blanks.map((number) =>
        buildBlankField(backendQuestionId, number, answersByNumber.get(number), {
          wordLimit,
        })
      ),
      title: question.text,
    },
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    type: 'diagram-completion',
  };
};

const buildNoteCompletionGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const notesHtml = pickString(metadata.notes_html, metadata.notesHtml);

  if (!notesHtml) {
    return null;
  }

  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);
  const wordLimit = getWordLimit(metadata);
  const parsedNotes = parseNotesHtml(notesHtml, backendQuestionId, answersByNumber, wordLimit);

  if (!parsedNotes.sections.length) {
    return null;
  }

  return {
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    noteTitle: parsedNotes.noteTitle,
    sections: parsedNotes.sections,
    type: 'note-completion',
  };
};

const buildTableCell = (
  value: unknown,
  backendQuestionId: string,
  answersByNumber: Map<number, CorrectAnswer>,
  wordLimit?: number
): TableCell => {
  const text = pickString(value) ?? '';
  const matches = [...text.matchAll(BLANK_MARKER_REGEX)];

  if (!matches.length) {
    return {
      content: normalizeText(text),
      isBlank: false,
    };
  }

  if (matches.length === 1 && normalizeText(text) === matches[0][0]) {
    const number = Number.parseInt(matches[0][1], 10);

    return {
      answer: answersByNumber.get(number),
      answerLength: estimateAnswerLength(answersByNumber.get(number), wordLimit),
      backendQuestionId,
      id: buildLocalId(backendQuestionId, number),
      isBlank: true,
      number,
    };
  }

  return {
    isBlank: false,
    segments: splitTextWithBlanks(text, backendQuestionId, answersByNumber, wordLimit),
  };
};

const buildTableCompletionGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const table = asRecord(metadata.table);

  if (!table) {
    return null;
  }

  const headers = asArray(table.headers)
    .map((header) => pickString(header))
    .filter((header): header is string => Boolean(header));
  const rows = asArray(table.rows);
  const wordLimit = getWordLimit(metadata);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);

  if (!headers.length || !rows.length) {
    return null;
  }

  return {
    data: {
      headers,
      rows: rows.map((row) =>
        asArray(row).map((cell) => buildTableCell(cell, backendQuestionId, answersByNumber, wordLimit))
      ),
    },
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    tableTitle: question.text,
    type: 'table-completion',
  };
};

const buildMapLabellingGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const labelsOnImage = asArray(metadata.labels_on_image);
  const optionEntries = buildOptionEntries(question.options);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);

  if (!labelsOnImage.length || !optionEntries.length) {
    return null;
  }

  const maxX = labelsOnImage.reduce((best, item) => {
    const value = pickNumber((asRecord(item) ?? {}).x);

    return typeof value === 'number' ? Math.max(best, value) : best;
  }, 100);
  const maxY = labelsOnImage.reduce((best, item) => {
    const value = pickNumber((asRecord(item) ?? {}).y);

    return typeof value === 'number' ? Math.max(best, value) : best;
  }, 100);

  return {
    data: {
      imageUrl: normalizeMediaUrl(question.image_url ?? question.imageUrl),
      legendOptions: optionEntries.map((option) => ({
        text: option.text,
        value: option.value,
      })),
      panelTitle: question.text,
      pins: labelsOnImage
        .map((item) => {
          const record = asRecord(item) ?? {};
          const number =
            typeof record.id === 'string'
              ? Number.parseInt(record.id, 10)
              : pickNumber(record.id, record.order);
          const x = pickNumber(record.x);
          const y = pickNumber(record.y);

          if (typeof number !== 'number' || typeof x !== 'number' || typeof y !== 'number') {
            return null;
          }

          const answer = answersByNumber.get(number);

          return {
            answer: resolveChoiceValue(getAnswerPreview(answer), optionEntries),
            answerLength: 10,
            backendQuestionId,
            id: buildLocalId(backendQuestionId, number),
            number,
            x: normalizeCoordinate(x, maxX),
            y: normalizeCoordinate(y, maxY),
          };
        })
        .filter((pin): pin is NonNullable<typeof pin> => pin !== null),
      showBadges: true,
      wordBank: optionEntries.map((option) => option.value),
    },
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    type: 'map-labelling',
  };
};

const buildSummaryCompletionGroup = (question: ApiQuestion, backendQuestionId: string): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const summaryText = pickString(metadata.summary_text, metadata.summaryText);
  const optionEntries = buildOptionEntries(question.options);
  const answersByNumber = parseNumberedAnswers(question.correct_answer ?? question.correctAnswer);

  if (!summaryText) {
    return null;
  }

  const segments: SummaryParagraph['segments'] = [];
  let lastIndex = 0;

  for (const match of summaryText.matchAll(BLANK_MARKER_REGEX)) {
    const markerIndex = match.index ?? -1;
    const number = Number.parseInt(match[1], 10);

    if (markerIndex === -1 || !Number.isFinite(number)) {
      continue;
    }

    const content = normalizeText(summaryText.slice(lastIndex, markerIndex));

    if (content) {
      segments.push({
        content: content.endsWith(' ') ? content : `${content} `,
        type: 'text',
      });
    }

    const rawAnswer = answersByNumber.get(number);

    segments.push({
      field: buildBlankField(
        backendQuestionId,
        number,
        rawAnswer ? resolveOptionText(getAnswerPreview(rawAnswer), optionEntries) : rawAnswer,
        {
          wordLimit: getWordLimit(metadata),
        }
      ),
      type: 'blank',
    });

    lastIndex = markerIndex + match[0].length;
  }

  const trailingText = normalizeText(summaryText.slice(lastIndex));

  if (trailingText) {
    segments.push({
      content: trailingText,
      type: 'text',
    });
  }

  return {
    instructions: buildInstruction(question.text, pickString(metadata.instruction)),
    paragraphs: [{ segments }],
    summaryTitle: question.text,
    type: 'summary-completion',
    wordBank: optionEntries.map((option) => option.text),
  };
};

const buildDirectMultipleChoiceGroup = (
  question: ApiQuestion,
  backendQuestionId: string,
  questionType: string
): QuestionGroup | null => {
  const metadata = asRecord(question.metadata) ?? {};
  const optionEntries = buildOptionEntries(question.options);

  if (!optionEntries.length) {
    return null;
  }

  const answerValue = question.correct_answer ?? question.correctAnswer;
  const selectCount = pickNumber(metadata.select_count, metadata.selectCount);
  const multiSelect = Boolean(selectCount && selectCount > 1);
  const resolvedAnswer = Array.isArray(answerValue)
    ? answerValue.map((item) => resolveChoiceValue(item, optionEntries)).filter(Boolean)
    : resolveChoiceValue(answerValue, optionEntries);
  const order = pickNumber(question.order) ?? 1;
  const scoreWeight = pickNumber(question.points);

  return {
    instructions:
      pickString(metadata.instruction, metadata.group_instruction) ??
      buildInstruction(question.text),
    questions: [
      {
        answer: resolvedAnswer,
        backendQuestionId,
        id: buildLocalId(backendQuestionId, order),
        multiSelect: Boolean(multiSelect),
        number: order,
        options: optionEntries.map((option): MCOption => ({
          text: option.text,
          value: option.value,
        })),
        scoreWeight: scoreWeight && scoreWeight > 1 ? scoreWeight : undefined,
        selectCount: selectCount && selectCount > 1 ? selectCount : undefined,
        text: question.text ?? '',
      },
    ],
    type: 'multiple-choice',
  };
};

const buildStatementQuestion = (
  question: ApiQuestion,
  backendQuestionId: string,
  questionType: string
): MCQuestion => ({
  answer: buildStatementAnswer(questionType, question.correct_answer ?? question.correctAnswer),
  backendQuestionId,
  id: buildLocalId(backendQuestionId, pickNumber(question.order) ?? 1),
  number: pickNumber(question.order) ?? 1,
  options: buildStatementOptions(questionType),
  text: question.text ?? '',
});

const toQuestionType = (value: unknown) => pickString(value)?.toLowerCase().replace(/-/g, '_') ?? '';

export async function getReadingSectionDetail(sectionId: string): Promise<ReadingTest> {
  const response = await axiosInstance.get<ApiSectionDetail>(endpoints.sections.details(sectionId));
  const root = asRecord(response.data) ?? {};
  const data = (asRecord(root.data) ?? root) as ApiSectionDetail;
  const parts = asArray(data.parts)
    .map((part, index) => {
      const record = asRecord(part) ?? {};
      const apiQuestions = asArray(record.questions)
        .map((question) => asRecord(question) as ApiQuestion)
        .sort(
          (left, right) => (pickNumber(left.order) ?? Number.MAX_SAFE_INTEGER) - (pickNumber(right.order) ?? Number.MAX_SAFE_INTEGER)
        );
      const groups: QuestionGroup[] = [];
      let groupedStatementChoice: {
        groupId: string;
        instructions: string;
        questions: MCQuestion[];
      } | null = null;

      const flushGroupedStatementChoice = () => {
        if (!groupedStatementChoice) {
          return;
        }

        groups.push({
          instructions: groupedStatementChoice.instructions,
          questions: groupedStatementChoice.questions,
          type: 'multiple-choice',
        });

        groupedStatementChoice = null;
      };

      apiQuestions.forEach((question, questionIndex) => {
        const backendQuestionId =
          pickString(question.id) ?? `${sectionId}-reading-${index + 1}-${questionIndex + 1}`;
        const metadata = asRecord(question.metadata) ?? {};
        const questionType = toQuestionType(question.question_type ?? question.questionType);

        if (questionType === 'true_false_not_given' || questionType === 'yes_no_not_given') {
          const groupId = pickString(metadata.group_id, metadata.groupId) ?? backendQuestionId;
          const groupInstruction =
            pickString(metadata.group_instruction, metadata.groupInstruction) ?? question.text ?? '';

          if (!groupedStatementChoice || groupedStatementChoice.groupId !== groupId) {
            flushGroupedStatementChoice();
            groupedStatementChoice = {
              groupId,
              instructions: groupInstruction,
              questions: [],
            };
          }

          groupedStatementChoice.questions.push(
            buildStatementQuestion(question, backendQuestionId, questionType)
          );

          return;
        }

        flushGroupedStatementChoice();

        let group: QuestionGroup | null = null;

        if (
          questionType === 'matching_information' ||
          questionType === 'matching_headings' ||
          questionType === 'matching_sentence_endings'
        ) {
          group = buildMatchingGroup(question, backendQuestionId);
        } else if (questionType === 'diagram_completion') {
          group = buildDiagramCompletionGroup(question, backendQuestionId);
        } else if (questionType === 'sentence_completion') {
          group = buildSentenceCompletionGroup(question, backendQuestionId);
        } else if (questionType === 'short_answer') {
          group = buildShortAnswerGroup(question, backendQuestionId);
        } else if (questionType === 'note_completion') {
          group = buildNoteCompletionGroup(question, backendQuestionId);
        } else if (questionType === 'table_completion') {
          group = buildTableCompletionGroup(question, backendQuestionId);
        } else if (questionType === 'map_labeling' || questionType === 'map_labelling') {
          group = buildMapLabellingGroup(question, backendQuestionId);
        } else if (questionType === 'summary_completion_list') {
          group = buildSummaryCompletionGroup(question, backendQuestionId);
        } else if (questionType === 'multiple_choice' || questionType === 'single_choice') {
          group = buildDirectMultipleChoiceGroup(question, backendQuestionId, questionType);
        }

        if (group) {
          groups.push(group);
        }
      });

      flushGroupedStatementChoice();

      return {
        audioUrl: undefined,
        groups,
        number: index + 1,
        passageText: normalizeText(
          pickString(record.passage_text, record.passageText) ?? '[Passage content unavailable]'
        ),
        scenario:
          pickString(record.instructions) ??
          `Read the passage and answer the questions in Section ${index + 1}.`,
        title: pickString(record.title) ?? `Section ${index + 1}`,
      };
    })
    .filter((part) => part.groups.length > 0);

  return {
    description:
      pickString(data.instructions) ??
      'You will be allowed 1 hour to complete all sections. There are 40 questions.',
    difficulty: toDifficulty(pickString(data.difficulty)),
    durationMinutes: pickNumber(data.duration_minutes, data.durationMinutes) ?? 60,
    id: data.id ?? sectionId,
    parts,
    supportsLocalScoring: true,
    title: pickString(data.title) ?? 'Academic Reading',
  };
}
