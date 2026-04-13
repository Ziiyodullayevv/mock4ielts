import type { SpeakingTest, SpeakingSessionStartResponse } from '../types';

import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

type StartSpeakingLiveSessionParams = {
  test: SpeakingTest;
};

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);

const parseAttemptId = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return pickString(data.attempt_id, data.attemptId, root.attempt_id, root.attemptId);
};

export async function startSpeakingSectionAttempt(sectionId: string) {
  const response = await axiosInstance.post(endpoints.sections.start(sectionId));
  const attemptId = parseAttemptId(response.data);

  if (!attemptId) {
    throw new Error('Start response did not include an attempt id.');
  }

  return { attemptId };
}

export async function startSpeakingLiveSession({
  test,
}: StartSpeakingLiveSessionParams): Promise<SpeakingSessionStartResponse> {
  const response = await axiosInstance.post(endpoints.speaking.startSession, {
    section_id: test.id,
  });

  const root = asRecord(response.data) ?? {};
  const data = asRecord(root.data) ?? root;
  const roomName = pickString(data.room_name, data.roomName, data.room);
  const token = pickString(data.token);
  const url = pickString(data.url, data.livekit_url, data.livekitUrl);

  if (!roomName || !token || !url) {
    throw new Error('Start session response did not include room credentials.');
  }

  return {
    attemptId: pickString(data.attempt_id, data.attemptId),
    dispatchId: pickString(data.dispatch_id, data.dispatchId),
    participantName: pickString(data.participant_name, data.participantName),
    roomName,
    token,
    url,
  };
}
