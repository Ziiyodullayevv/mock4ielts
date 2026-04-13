export type SpeakingQuestionType = 'speaking_short' | 'speaking_cue_card' | 'speaking_discussion';

export type SpeakingFrontendEvent = {
  durationSeconds?: number;
  event: string;
  trigger?: string;
};

export type SpeakingFrontendEventEntry = SpeakingFrontendEvent & {
  partKey: string;
  questionId: string;
  questionNumber: number;
};

export type SpeakingCueCardDisplay = {
  points: string[];
  title: string;
};

export type SpeakingQuestionMetadata = {
  aiReadText?: string;
  bulletPoints: string[];
  cueCardDisplay?: SpeakingCueCardDisplay;
  frontendEvents: SpeakingFrontendEvent[];
  groupId?: string;
  groupLabel?: string;
  preparationSeconds?: number;
  roundingOffQuestions: string[];
  speakingMaxSeconds?: number;
  speakingMinSeconds?: number;
  suggestedTimeSeconds?: number;
  topic?: string;
};

export type SpeakingQuestion = {
  id: string;
  metadata: SpeakingQuestionMetadata;
  number: number;
  points: number;
  questionType: SpeakingQuestionType;
  text: string;
};

export type SpeakingPartBehavior = {
  aiBehavior?: string;
  autoAdvanceOnSilence?: boolean;
  canProbeDeeper?: boolean;
  followUpOnShortAnswer?: boolean;
  followUpPrompt?: string;
  interruptionAllowed?: boolean;
  maxFollowUpsPerQuestion?: number;
  maxProbesPerQuestion?: number;
  minAnswerWords?: number;
  preparationAnnouncement?: string;
  probePrompts: string[];
  silenceBeforeAdvanceMs?: number;
  silenceBeforeWarningMs?: number;
  startSpeakingPrompt?: string;
  stopPrompt?: string;
  timeWarningPrompt?: string;
  transitionToNextTopic?: string;
  warningPrompt?: string;
};

export type SpeakingVADConfig = {
  minSpeechDurationMs?: number;
  silenceThresholdMs?: number;
};

export type SpeakingAgentConfig = {
  aiModel?: string;
  aiRole?: string;
  aiVoice?: string;
  closingScript?: string;
  language?: string;
  openingScript?: string;
  partBehaviors: Record<string, SpeakingPartBehavior>;
  systemPrompt?: string;
  vadConfig?: SpeakingVADConfig;
};

export type SpeakingGradingCriterion = {
  description?: string;
  id: string;
  name: string;
};

export type SpeakingGradingConfig = {
  criteria: SpeakingGradingCriterion[];
  description?: string;
  gradingPromptTemplate?: string;
  method?: string;
  transcriptSource?: string;
};

export type SpeakingPart = {
  durationMinutes: number;
  instructions: string;
  partKey: string;
  questions: SpeakingQuestion[];
  title: string;
};

export type SpeakingTest = {
  agentConfig: SpeakingAgentConfig;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  examType?: string;
  gradingConfig?: SpeakingGradingConfig;
  id: string;
  parts: SpeakingPart[];
  tags: string[];
  title: string;
};

export type SpeakingSessionStartResponse = {
  attemptId?: string;
  dispatchId?: string;
  participantName?: string;
  roomName: string;
  token: string;
  url: string;
};
