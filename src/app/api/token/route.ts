import type { NextRequest} from 'next/server';

import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type VideoGrant = {
  canPublish?: boolean;
  canSubscribe?: boolean;
  room?: string;
  roomAdmin?: boolean;
  roomJoin?: boolean;
};

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createLiveKitJwt(params: {
  apiKey: string;
  apiSecret: string;
  grant: VideoGrant;
  identity: string;
  ttlSeconds: number;
}) {
  const { apiKey, apiSecret, grant, identity, ttlSeconds } = params;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const payload = {
    exp: nowInSeconds + ttlSeconds,
    iat: nowInSeconds,
    iss: apiKey,
    nbf: nowInSeconds,
    sub: identity,
    video: grant,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', apiSecret).update(unsignedToken).digest();

  return `${unsignedToken}.${toBase64Url(signature)}`;
}

function buildRoomName(attemptId: string | null) {
  const sanitizedAttemptId = attemptId
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);

  return sanitizedAttemptId ? `speaking-${sanitizedAttemptId}` : 'simli-room';
}

async function dispatchAgent(params: {
  apiKey: string;
  apiSecret: string;
  livekitUrl: string;
  metadata: string;
  roomName: string;
}) {
  const { apiKey, apiSecret, livekitUrl, metadata, roomName } = params;
  const httpUrl = livekitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
  const authToken = createLiveKitJwt({
    apiKey,
    apiSecret,
    grant: {
      room: roomName,
      roomAdmin: true,
    },
    identity: 'dispatch-service',
    ttlSeconds: 3600,
  });

  const response = await fetch(`${httpUrl}/twirp/livekit.AgentDispatchService/CreateDispatch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agentName: '',
      metadata,
      room: roomName,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Dispatch failed with status ${response.status}`);
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
  }

  const attemptId = request.nextUrl.searchParams.get('attemptId');
  const roomName = buildRoomName(attemptId);
  const participantName = `user-${Math.random().toString(36).slice(2, 7)}`;

  const jwt = createLiveKitJwt({
    apiKey,
    apiSecret,
    grant: {
      canPublish: true,
      canSubscribe: true,
      room: roomName,
      roomJoin: true,
    },
    identity: participantName,
    ttlSeconds: 3600,
  });

  try {
    await dispatchAgent({
      apiKey,
      apiSecret,
      livekitUrl,
      metadata: JSON.stringify({
        attemptId,
        avatar: 'simli-avatar',
      }),
      roomName,
    });
  } catch (error) {
    console.error('Agent dispatch error:', error);
  }

  return NextResponse.json({ room: roomName, token: jwt, url: livekitUrl });
}
