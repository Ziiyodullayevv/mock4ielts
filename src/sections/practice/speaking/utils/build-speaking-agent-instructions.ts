import type {
  SpeakingTest,
  SpeakingQuestion,
  SpeakingPartBehavior,
  SpeakingFrontendEventEntry,
} from '../types';

const formatBoolean = (value: boolean | undefined) => {
  if (typeof value !== 'boolean') {
    return undefined;
  }

  return value ? 'yes' : 'no';
};

const appendIfPresent = (lines: string[], label: string, value: number | string | undefined) => {
  if (value === undefined || value === '') {
    return;
  }

  lines.push(`- ${label}: ${value}`);
};

const formatQuestionBlock = (question: SpeakingQuestion) => {
  const lines = [
    `${question.number}. ${question.metadata.aiReadText ?? question.text}`,
    `- question_type: ${question.questionType}`,
  ];

  appendIfPresent(lines, 'topic', question.metadata.topic);
  appendIfPresent(lines, 'group_id', question.metadata.groupId);
  appendIfPresent(lines, 'group_label', question.metadata.groupLabel);
  appendIfPresent(lines, 'suggested_time_seconds', question.metadata.suggestedTimeSeconds);
  appendIfPresent(lines, 'preparation_seconds', question.metadata.preparationSeconds);
  appendIfPresent(lines, 'speaking_min_seconds', question.metadata.speakingMinSeconds);
  appendIfPresent(lines, 'speaking_max_seconds', question.metadata.speakingMaxSeconds);

  if (question.metadata.bulletPoints.length) {
    lines.push('- bullet_points:');
    question.metadata.bulletPoints.forEach((point) => {
      lines.push(`  * ${point}`);
    });
  }

  if (question.metadata.roundingOffQuestions.length) {
    lines.push('- rounding_off_questions:');
    question.metadata.roundingOffQuestions.forEach((prompt) => {
      lines.push(`  * ${prompt}`);
    });
  }

  return lines.join('\n');
};

const formatPartBehaviorBlock = (partKey: string, behavior?: SpeakingPartBehavior) => {
  if (!behavior) {
    return `${partKey}\n- use the IELTS protocol for this part`;
  }

  const lines = [partKey];

  appendIfPresent(lines, 'ai_behavior', behavior.aiBehavior);
  appendIfPresent(lines, 'interruption_allowed', formatBoolean(behavior.interruptionAllowed));
  appendIfPresent(lines, 'auto_advance_on_silence', formatBoolean(behavior.autoAdvanceOnSilence));
  appendIfPresent(lines, 'min_answer_words', behavior.minAnswerWords);
  appendIfPresent(
    lines,
    'follow_up_on_short_answer',
    formatBoolean(behavior.followUpOnShortAnswer)
  );
  appendIfPresent(lines, 'follow_up_prompt', behavior.followUpPrompt);
  appendIfPresent(lines, 'max_follow_ups_per_question', behavior.maxFollowUpsPerQuestion);
  appendIfPresent(lines, 'silence_before_advance_ms', behavior.silenceBeforeAdvanceMs);
  appendIfPresent(lines, 'silence_before_warning_ms', behavior.silenceBeforeWarningMs);
  appendIfPresent(lines, 'warning_prompt', behavior.warningPrompt);
  appendIfPresent(lines, 'preparation_announcement', behavior.preparationAnnouncement);
  appendIfPresent(lines, 'start_speaking_prompt', behavior.startSpeakingPrompt);
  appendIfPresent(lines, 'time_warning_prompt', behavior.timeWarningPrompt);
  appendIfPresent(lines, 'stop_prompt', behavior.stopPrompt);
  appendIfPresent(lines, 'can_probe_deeper', formatBoolean(behavior.canProbeDeeper));
  appendIfPresent(lines, 'max_probes_per_question', behavior.maxProbesPerQuestion);
  appendIfPresent(lines, 'transition_to_next_topic', behavior.transitionToNextTopic);

  if (behavior.probePrompts.length) {
    lines.push('- probe_prompts:');
    behavior.probePrompts.forEach((prompt) => {
      lines.push(`  * ${prompt}`);
    });
  }

  return lines.join('\n');
};

export function collectSpeakingFrontendEvents(test: SpeakingTest): SpeakingFrontendEventEntry[] {
  return test.parts.flatMap((part) =>
    part.questions.flatMap((question) =>
      question.metadata.frontendEvents.map((event) => ({
        ...event,
        partKey: part.partKey,
        questionId: question.id,
        questionNumber: question.number,
      }))
    )
  );
}

export function buildSpeakingAgentInstructions(test: SpeakingTest) {
  const lines = [
    test.agentConfig.systemPrompt ?? 'You are a professional IELTS Speaking Examiner.',
    '',
    'TEST CONTEXT:',
    `- title: ${test.title}`,
    `- section_type: speaking`,
    `- exam_type: ${test.examType ?? 'unknown'}`,
    `- duration_minutes: ${test.durationMinutes}`,
    `- language: ${test.agentConfig.language ?? 'en'}`,
    '',
    'OPENING SCRIPT:',
    test.agentConfig.openingScript ?? 'Introduce yourself, verify identity, then begin Part 1.',
    '',
    'CLOSING SCRIPT:',
    test.agentConfig.closingScript ?? 'Thank the candidate and close the test professionally.',
    '',
    'VAD CONFIG:',
    `- silence_threshold_ms: ${test.agentConfig.vadConfig?.silenceThresholdMs ?? 'default'}`,
    `- min_speech_duration_ms: ${test.agentConfig.vadConfig?.minSpeechDurationMs ?? 'default'}`,
    '',
    'PART BEHAVIORS:',
    ...test.parts.map((part) =>
      formatPartBehaviorBlock(part.partKey, test.agentConfig.partBehaviors[part.partKey])
    ),
    '',
    'QUESTION FLOW:',
    ...test.parts.flatMap((part) => [
      `${part.title} (${part.partKey})`,
      `- instructions: ${part.instructions}`,
      ...part.questions.map((question) => formatQuestionBlock(question)),
    ]),
    '',
    'IMPORTANT:',
    '- Follow the order of questions exactly.',
    '- Do not provide feedback or corrections during the test.',
    '- If the candidate answer is too short, use only the configured follow-up rules.',
    '- Trigger frontend cue-card and timer events only from the provided event list.',
  ];

  return lines.join('\n');
}
