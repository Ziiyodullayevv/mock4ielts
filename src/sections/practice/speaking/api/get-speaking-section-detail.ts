import type {
  SpeakingPart,
  SpeakingTest,
  SpeakingQuestion,
  SpeakingPartBehavior,
  SpeakingQuestionType,
  SpeakingFrontendEvent,
  SpeakingGradingCriterion,
} from '../types';

import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;

const pickBoolean = (...values: unknown[]) =>
  values.find((value): value is boolean => typeof value === 'boolean');

const pickNumber = (...values: unknown[]) =>
  values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const normalizedValue = value.replace(/\s+/g, ' ').trim();

    if (normalizedValue.length) {
      return normalizedValue;
    }
  }

  return undefined;
};

const toDifficulty = (value?: string): SpeakingTest['difficulty'] => {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }

  return 'medium';
};

const toQuestionType = (value?: string): SpeakingQuestionType => {
  switch (value?.toLowerCase()) {
    case 'speaking_cue_card':
      return 'speaking_cue_card';
    case 'speaking_discussion':
      return 'speaking_discussion';
    default:
      return 'speaking_short';
  }
};

const toStringArray = (...values: unknown[]) =>
  values
    .flatMap((value) => asArray(value))
    .map((value) => pickString(value))
    .filter((value): value is string => Boolean(value));

const toFrontendEvents = (value: unknown): SpeakingFrontendEvent[] =>
  asArray(value).reduce<SpeakingFrontendEvent[]>((events, item) => {
    const record = asRecord(item) ?? {};
    const event = pickString(record.event);

    if (!event) {
      return events;
    }

    events.push({
      durationSeconds: pickNumber(record.duration_seconds, record.durationSeconds),
      event,
      trigger: pickString(record.trigger),
    });

    return events;
  }, []);

const toPartBehavior = (value: unknown): SpeakingPartBehavior => {
  const record = asRecord(value) ?? {};

  return {
    aiBehavior: pickString(record.ai_behavior, record.aiBehavior),
    autoAdvanceOnSilence: pickBoolean(record.auto_advance_on_silence, record.autoAdvanceOnSilence),
    canProbeDeeper: pickBoolean(record.can_probe_deeper, record.canProbeDeeper),
    followUpOnShortAnswer: pickBoolean(
      record.follow_up_on_short_answer,
      record.followUpOnShortAnswer
    ),
    followUpPrompt: pickString(record.follow_up_prompt, record.followUpPrompt),
    interruptionAllowed: pickBoolean(record.interruption_allowed, record.interruptionAllowed),
    maxFollowUpsPerQuestion: pickNumber(
      record.max_follow_ups_per_question,
      record.maxFollowUpsPerQuestion
    ),
    maxProbesPerQuestion: pickNumber(record.max_probes_per_question, record.maxProbesPerQuestion),
    minAnswerWords: pickNumber(record.min_answer_words, record.minAnswerWords),
    preparationAnnouncement: pickString(
      record.preparation_announcement,
      record.preparationAnnouncement
    ),
    probePrompts: toStringArray(record.probe_prompts, record.probePrompts),
    silenceBeforeAdvanceMs: pickNumber(
      record.silence_before_advance_ms,
      record.silenceBeforeAdvanceMs
    ),
    silenceBeforeWarningMs: pickNumber(
      record.silence_before_warning_ms,
      record.silenceBeforeWarningMs
    ),
    startSpeakingPrompt: pickString(record.start_speaking_prompt, record.startSpeakingPrompt),
    stopPrompt: pickString(record.stop_prompt, record.stopPrompt),
    timeWarningPrompt: pickString(record.time_warning_prompt, record.timeWarningPrompt),
    transitionToNextTopic: pickString(
      record.transition_to_next_topic,
      record.transitionToNextTopic
    ),
    warningPrompt: pickString(record.warning_prompt, record.warningPrompt),
  };
};

const toQuestion = (
  value: unknown,
  questionIndex: number,
  partIndex: number,
  partKey: string,
  sectionId: string
): SpeakingQuestion | null => {
  const record = asRecord(value) ?? {};
  const metadata = asRecord(record.metadata) ?? {};
  const questionText = pickString(record.text);

  if (!questionText) {
    return null;
  }

  return {
    id:
      pickString(record.id) ??
      `${sectionId}-${partKey || `part${partIndex + 1}`}-question-${questionIndex + 1}`,
    metadata: {
      aiReadText: pickString(metadata.ai_read_text, metadata.aiReadText),
      bulletPoints: toStringArray(metadata.bullet_points, metadata.bulletPoints),
      cueCardDisplay: (() => {
        const cueCardDisplay = asRecord(metadata.cue_card_display ?? metadata.cueCardDisplay) ?? {};
        const title = pickString(cueCardDisplay.title);
        const points = toStringArray(cueCardDisplay.points);

        if (!title || !points.length) {
          return undefined;
        }

        return { points, title };
      })(),
      frontendEvents: toFrontendEvents(metadata.frontend_events ?? metadata.frontendEvents),
      groupId: pickString(metadata.group_id, metadata.groupId),
      groupLabel: pickString(metadata.group_label, metadata.groupLabel),
      preparationSeconds: pickNumber(metadata.preparation_seconds, metadata.preparationSeconds),
      roundingOffQuestions: toStringArray(
        metadata.rounding_off_questions,
        metadata.roundingOffQuestions
      ),
      speakingMaxSeconds: pickNumber(metadata.speaking_max_seconds, metadata.speakingMaxSeconds),
      speakingMinSeconds: pickNumber(metadata.speaking_min_seconds, metadata.speakingMinSeconds),
      suggestedTimeSeconds: pickNumber(
        metadata.suggested_time_seconds,
        metadata.suggestedTimeSeconds
      ),
      topic: pickString(metadata.topic),
    },
    number: pickNumber(record.order) ?? questionIndex + 1,
    points: pickNumber(record.points) ?? 1,
    questionType: toQuestionType(pickString(record.question_type, record.questionType)),
    text: questionText,
  };
};

const toPart = (value: unknown, partIndex: number, sectionId: string): SpeakingPart | null => {
  const record = asRecord(value) ?? {};
  const partKey = pickString(record.part_key, record.partKey) ?? `part${partIndex + 1}`;
  const questions = asArray(record.questions)
    .map((question, questionIndex) =>
      toQuestion(question, questionIndex, partIndex, partKey, sectionId)
    )
    .filter((question): question is SpeakingQuestion => question !== null);

  if (!questions.length) {
    return null;
  }

  return {
    durationMinutes: pickNumber(record.duration_minutes, record.durationMinutes) ?? 0,
    instructions:
      pickString(record.instructions) ??
      (partKey === 'part2'
        ? '1 minute preparation, 1-2 minutes speaking.'
        : 'Answer naturally and extend your ideas clearly.'),
    partKey,
    questions,
    title: pickString(record.title) ?? `Part ${partIndex + 1}`,
  };
};

export async function getSpeakingSectionDetail(sectionId: string): Promise<SpeakingTest> {
  const response = await axiosInstance.get(endpoints.sections.details(sectionId));
  const root = asRecord(response.data) ?? {};
  const data = (asRecord(root.data) ?? root) as ApiRecord;
  const agentConfigRecord = asRecord(data.agent_config ?? data.agentConfig) ?? {};
  const gradingConfigRecord = asRecord(data.grading_config ?? data.gradingConfig) ?? {};
  const partBehaviorsRecord =
    asRecord(agentConfigRecord.part_behaviors ?? agentConfigRecord.partBehaviors) ?? {};
  const vadConfigRecord =
    asRecord(agentConfigRecord.vad_config ?? agentConfigRecord.vadConfig) ?? {};

  return {
    agentConfig: {
      aiModel: pickString(agentConfigRecord.ai_model, agentConfigRecord.aiModel),
      aiRole: pickString(agentConfigRecord.ai_role, agentConfigRecord.aiRole),
      aiVoice: pickString(agentConfigRecord.ai_voice, agentConfigRecord.aiVoice),
      closingScript: pickString(agentConfigRecord.closing_script, agentConfigRecord.closingScript),
      language: pickString(agentConfigRecord.language),
      openingScript: pickString(agentConfigRecord.opening_script, agentConfigRecord.openingScript),
      partBehaviors: Object.fromEntries(
        Object.entries(partBehaviorsRecord).map(([key, value]) => [key, toPartBehavior(value)])
      ),
      systemPrompt: pickString(agentConfigRecord.system_prompt, agentConfigRecord.systemPrompt),
      vadConfig:
        Object.keys(vadConfigRecord).length > 0
          ? {
              minSpeechDurationMs: pickNumber(
                vadConfigRecord.min_speech_duration_ms,
                vadConfigRecord.minSpeechDurationMs
              ),
              silenceThresholdMs: pickNumber(
                vadConfigRecord.silence_threshold_ms,
                vadConfigRecord.silenceThresholdMs
              ),
            }
          : undefined,
    },
    description:
      pickString(data.instructions, data.description) ??
      'The speaking test lasts 11-14 minutes and has three parts.',
    difficulty: toDifficulty(pickString(data.difficulty)),
    durationMinutes: pickNumber(data.duration_minutes, data.durationMinutes) ?? 14,
    examType: pickString(data.exam_type, data.examType),
    gradingConfig:
      Object.keys(gradingConfigRecord).length > 0
        ? {
            criteria: asArray(gradingConfigRecord.criteria).reduce<SpeakingGradingCriterion[]>(
              (criteria, criterion) => {
                const record = asRecord(criterion) ?? {};
                const id = pickString(record.id);
                const name = pickString(record.name);

                if (!id || !name) {
                  return criteria;
                }

                criteria.push({
                  description: pickString(record.description),
                  id,
                  name,
                });

                return criteria;
              },
              []
            ),
            description: pickString(gradingConfigRecord.description),
            gradingPromptTemplate: pickString(
              gradingConfigRecord.grading_prompt_template,
              gradingConfigRecord.gradingPromptTemplate
            ),
            method: pickString(gradingConfigRecord.method),
            transcriptSource: pickString(
              gradingConfigRecord.transcript_source,
              gradingConfigRecord.transcriptSource
            ),
          }
        : undefined,
    id: pickString(data.id) ?? sectionId,
    parts: asArray(data.parts)
      .map((part, partIndex) => toPart(part, partIndex, sectionId))
      .filter((part): part is SpeakingPart => part !== null),
    tags: toStringArray(data.tags),
    title: pickString(data.title) ?? 'Speaking Practice',
  };
}
