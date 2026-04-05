import type {
  Part,
  Answers,
  TestResult,
  CorrectAnswer,
  ListeningTest,
  QuestionGroup,
} from './types';

export type PartQuestionMeta = {
  id: string;
  number: number;
};

export function getPrimaryAnswer(answer: CorrectAnswer): string {
  return Array.isArray(answer) ? answer[0] ?? '' : answer;
}

export function isAnswerCorrect(userAnswer: string | undefined, correctAnswer: CorrectAnswer, multiSelect?: boolean) {
  if (multiSelect) {
    const expectedAnswers = Array.isArray(correctAnswer)
      ? correctAnswer.map((answer) => normalizeMultiSelectAnswer(answer))
      : [normalizeMultiSelectAnswer(correctAnswer)];

    return expectedAnswers.includes(normalizeMultiSelectAnswer(userAnswer ?? ''));
  }

  const expectedAnswers = Array.isArray(correctAnswer)
    ? correctAnswer.map((answer) => normalizeAnswer(answer))
    : [normalizeAnswer(correctAnswer)];

  return expectedAnswers.includes(normalizeAnswer(userAnswer ?? ''));
}

/** Collect all blank fields from a test with their correct answers */
export function getCorrectAnswers(test: ListeningTest): Record<string, string> {
  const map: Record<string, string> = {};

  for (const part of test.parts) {
    for (const group of part.groups) {
      if (group.type === 'multiple-choice') {
        for (const q of group.questions) map[q.id] = getPrimaryAnswer(q.answer);
      } else if (group.type === 'matching') {
        for (const p of group.data.pairs) map[p.id] = getPrimaryAnswer(p.answer);
      } else if (group.type === 'form-completion') {
        for (const s of group.sections) for (const f of s.fields) map[f.id] = getPrimaryAnswer(f.answer);
      } else if (group.type === 'note-completion') {
        for (const s of group.sections)
          for (const b of s.bullets) if (b.field) map[b.field.id] = getPrimaryAnswer(b.field.answer);
      } else if (group.type === 'table-completion') {
        const rows = [
          ...(group.data.rows ?? []),
          ...(group.data.sections?.flatMap((section) => section.rows) ?? []),
        ];

        for (const row of rows) {
          for (const cell of row) {
            if (cell.isBlank && cell.id && cell.answer) {
              map[cell.id] = getPrimaryAnswer(cell.answer);
            }

            for (const segment of cell.segments ?? []) {
              if (segment.type === 'blank') {
                map[segment.field.id] = getPrimaryAnswer(segment.field.answer);
              }
            }
          }
        }
      } else if (group.type === 'flow-chart') {
        for (const step of group.steps)
          if (step.isBlank && step.id && step.answer) map[step.id] = getPrimaryAnswer(step.answer);
      } else if (group.type === 'sentence-completion') {
        for (const q of group.questions) map[q.id] = getPrimaryAnswer(q.answer);
      } else if (group.type === 'short-answer') {
        for (const q of group.questions) map[q.id] = getPrimaryAnswer(q.answer);
      } else if (group.type === 'map-labelling') {
        for (const pin of group.data.pins) map[pin.id] = getPrimaryAnswer(pin.answer);
      } else if (group.type === 'diagram-completion') {
        for (const question of group.data.questions) {
          map[question.id] = getPrimaryAnswer(question.answer);
        }
      } else if (group.type === 'summary-completion') {
        for (const paragraph of group.paragraphs)
          for (const segment of paragraph.segments)
            if (segment.type === 'blank') map[segment.field.id] = getPrimaryAnswer(segment.field.answer);
      }
    }
  }

  return map;
}

/** Compute full test result */
export function computeResult(test: ListeningTest, answers: Answers): TestResult {
  const partScores: Record<number, { score: number; total: number }> = {};
  let total = 0;
  let score = 0;

  for (const part of test.parts) {
    let pTotal = 0;
    let pScore = 0;

    for (const group of part.groups) {
      if (group.type === 'multiple-choice') {
        for (const question of group.questions) {
          pTotal++;
          if (isAnswerCorrect(answers[question.id], question.answer, question.multiSelect)) {
            pScore++;
          }
        }
      } else if (group.type === 'matching') {
        for (const pair of group.data.pairs) {
          pTotal++;
          if (isAnswerCorrect(answers[pair.id], pair.answer)) pScore++;
        }
      } else if (group.type === 'form-completion') {
        for (const section of group.sections) {
          for (const field of section.fields) {
            pTotal++;
            if (isAnswerCorrect(answers[field.id], field.answer)) pScore++;
          }
        }
      } else if (group.type === 'note-completion') {
        for (const section of group.sections) {
          for (const bullet of section.bullets) {
            if (!bullet.field) continue;
            pTotal++;
            if (isAnswerCorrect(answers[bullet.field.id], bullet.field.answer)) pScore++;
          }
        }
      } else if (group.type === 'table-completion') {
        const rows = [
          ...(group.data.rows ?? []),
          ...(group.data.sections?.flatMap((section) => section.rows) ?? []),
        ];

        for (const row of rows) {
          for (const cell of row) {
            if (cell.isBlank && cell.id && cell.answer) {
              pTotal++;
              if (isAnswerCorrect(answers[cell.id], cell.answer)) pScore++;
            }

            for (const segment of cell.segments ?? []) {
              if (segment.type !== 'blank') continue;
              pTotal++;
              if (isAnswerCorrect(answers[segment.field.id], segment.field.answer)) pScore++;
            }
          }
        }
      } else if (group.type === 'flow-chart') {
        for (const step of group.steps) {
          if (!step.isBlank || !step.id || !step.answer) continue;
          pTotal++;
          if (isAnswerCorrect(answers[step.id], step.answer)) pScore++;
        }
      } else if (group.type === 'sentence-completion' || group.type === 'short-answer') {
        for (const question of group.questions) {
          pTotal++;
          if (isAnswerCorrect(answers[question.id], question.answer)) pScore++;
        }
      } else if (group.type === 'map-labelling') {
        for (const pin of group.data.pins) {
          pTotal++;
          if (isAnswerCorrect(answers[pin.id], pin.answer)) pScore++;
        }
      } else if (group.type === 'diagram-completion') {
        for (const question of group.data.questions) {
          pTotal++;
          if (isAnswerCorrect(answers[question.id], question.answer)) pScore++;
        }
      } else if (group.type === 'summary-completion') {
        for (const paragraph of group.paragraphs) {
          for (const segment of paragraph.segments) {
            if (segment.type !== 'blank') continue;
            pTotal++;
            if (isAnswerCorrect(answers[segment.field.id], segment.field.answer)) pScore++;
          }
        }
      }
    }

    partScores[part.number] = { score: pScore, total: pTotal };
    total += pTotal;
    score += pScore;
  }

  return { answers, score, total, partScores };
}

/** Get all question IDs from a group */
export function getGroupIds(group: QuestionGroup): string[] {
  if (group.type === 'multiple-choice') return group.questions.map((q) => q.id);
  if (group.type === 'matching') return group.data.pairs.map((p) => p.id);
  if (group.type === 'form-completion')
    return group.sections.flatMap((s) => s.fields.map((f) => f.id));
  if (group.type === 'note-completion')
    return group.sections.flatMap((s) => s.bullets.filter((b) => b.field).map((b) => b.field!.id));
  if (group.type === 'table-completion')
    return [
      ...(group.data.rows ?? []),
      ...(group.data.sections?.flatMap((section) => section.rows) ?? []),
    ].flatMap((row) =>
      row.flatMap((cell) => [
        ...(cell.isBlank && cell.id ? [cell.id] : []),
        ...(cell.segments
          ?.filter((segment) => segment.type === 'blank')
          .map((segment) => segment.field.id) ?? []),
      ])
    );
  if (group.type === 'flow-chart')
    return group.steps.filter((s) => s.isBlank && s.id).map((s) => s.id!);
  if (group.type === 'sentence-completion') return group.questions.map((q) => q.id);
  if (group.type === 'short-answer') return group.questions.map((q) => q.id);
  if (group.type === 'map-labelling') return group.data.pins.map((p) => p.id);
  if (group.type === 'diagram-completion') return group.data.questions.map((question) => question.id);
  if (group.type === 'summary-completion')
    return group.paragraphs.flatMap((paragraph) =>
      paragraph.segments
        .filter((segment) => segment.type === 'blank')
        .map((segment) => segment.field.id)
    );
  return [];
}

export function getGroupQuestions(group: QuestionGroup): PartQuestionMeta[] {
  if (group.type === 'multiple-choice') {
    return group.questions.map((question) => ({ id: question.id, number: question.number }));
  }

  if (group.type === 'matching') {
    return group.data.pairs.map((pair) => ({ id: pair.id, number: pair.number }));
  }

  if (group.type === 'form-completion') {
    return group.sections.flatMap((section) =>
      section.fields.map((field) => ({ id: field.id, number: field.number }))
    );
  }

  if (group.type === 'note-completion') {
    return group.sections.flatMap((section) =>
      section.bullets
        .filter((bullet) => bullet.field)
        .map((bullet) => ({ id: bullet.field!.id, number: bullet.field!.number }))
    );
  }

  if (group.type === 'table-completion') {
    return [
      ...(group.data.rows ?? []),
      ...(group.data.sections?.flatMap((section) => section.rows) ?? []),
    ].flatMap((row) =>
      row.flatMap((cell) => [
        ...(cell.isBlank && cell.id && cell.number ? [{ id: cell.id, number: cell.number }] : []),
        ...(cell.segments
          ?.filter((segment) => segment.type === 'blank')
          .map((segment) => ({ id: segment.field.id, number: segment.field.number })) ?? []),
      ])
    );
  }

  if (group.type === 'flow-chart') {
    return group.steps
      .filter((step) => step.isBlank && step.id && step.number)
      .map((step) => ({ id: step.id!, number: step.number! }));
  }

  if (group.type === 'sentence-completion' || group.type === 'short-answer') {
    return group.questions.map((question) => ({ id: question.id, number: question.number }));
  }

  if (group.type === 'map-labelling') {
    return group.data.pins.map((pin) => ({ id: pin.id, number: pin.number }));
  }

  if (group.type === 'diagram-completion') {
    return group.data.questions.map((question) => ({ id: question.id, number: question.number }));
  }

  if (group.type === 'summary-completion') {
    return group.paragraphs.flatMap((paragraph) =>
      paragraph.segments
        .filter((segment) => segment.type === 'blank')
        .map((segment) => ({ id: segment.field.id, number: segment.field.number }))
    );
  }

  return [];
}

export function getPartQuestionIds(part: Part): string[] {
  return part.groups.flatMap((group) => getGroupIds(group));
}

export function getPartQuestions(part: Part): PartQuestionMeta[] {
  return part.groups.flatMap((group) => getGroupQuestions(group));
}

export function countPartAnswered(part: Part, answers: Answers): number {
  return getPartQuestionIds(part).filter((id) => (answers[id] ?? '').trim()).length;
}

export function getListeningQuestionAnchorId(questionId: string) {
  return `listening-question-${questionId}`;
}

/** Count answered questions */
export function countAnswered(test: ListeningTest, answers: Answers): number {
  let n = 0;
  for (const part of test.parts)
    for (const group of part.groups)
      for (const id of getGroupIds(group)) if ((answers[id] ?? '').trim()) n++;
  return n;
}

/** Count total questions */
export function countTotal(test: ListeningTest): number {
  let n = 0;
  for (const part of test.parts) for (const group of part.groups) n += getGroupIds(group).length;
  return n;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMultiSelectAnswer(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');
}
