import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HerfSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  roomUrl?: string;
  roomName?: string;
  maxParticipants: number;
  scheduledFor?: string;
  startedAt?: string;
  endedAt?: string;
  isPrivate: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  clubId?: string;
  createdAt: string;
  updatedAt: string;
  host: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  club?: {
    id: string;
    name: string;
    slug: string;
  };
  participants?: HerfParticipant[];
  _count?: {
    participants: number;
  };
}

export interface HerfParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface HerfChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface CreateHerfSessionData {
  title: string;
  description?: string;
  scheduledFor?: string;
  maxParticipants?: number;
  isPrivate?: boolean;
  clubId?: string;
}

export interface JoinHerfSessionResponse {
  token: string;
  roomUrl: string;
  sessionId: string;
  isHost: boolean;
}

/**
 * Create a new herf session
 */
export async function createHerfSession(
  data: CreateHerfSessionData,
  token: string
): Promise<HerfSession> {
  const response = await axios.post(`${API_URL}/api/herf/sessions`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Get all herf sessions
 */
export async function getHerfSessions(
  filters?: {
    status?: string;
    clubId?: string;
    upcoming?: boolean;
  },
  token?: string
): Promise<HerfSession[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.clubId) params.append('clubId', filters.clubId);
  if (filters?.upcoming) params.append('upcoming', 'true');

  const response = await axios.get(`${API_URL}/api/herf/sessions?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Get a specific herf session
 */
export async function getHerfSession(sessionId: string, token?: string): Promise<HerfSession> {
  const response = await axios.get(`${API_URL}/api/herf/sessions/${sessionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Start a herf session
 */
export async function startHerfSession(sessionId: string, token: string): Promise<HerfSession> {
  const response = await axios.post(
    `${API_URL}/api/herf/sessions/${sessionId}/start`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * Join a herf session
 */
export async function joinHerfSession(
  sessionId: string,
  token: string
): Promise<JoinHerfSessionResponse> {
  const response = await axios.post(
    `${API_URL}/api/herf/sessions/${sessionId}/join`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * Leave a herf session
 */
export async function leaveHerfSession(sessionId: string, token: string): Promise<void> {
  await axios.post(
    `${API_URL}/api/herf/sessions/${sessionId}/leave`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * End a herf session (host only)
 */
export async function endHerfSession(sessionId: string, token: string): Promise<HerfSession> {
  const response = await axios.post(
    `${API_URL}/api/herf/sessions/${sessionId}/end`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * Cancel a herf session (host only)
 */
export async function cancelHerfSession(sessionId: string, token: string): Promise<void> {
  await axios.delete(`${API_URL}/api/herf/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get chat messages for a session
 */
export async function getHerfMessages(
  sessionId: string,
  token: string
): Promise<HerfChatMessage[]> {
  const response = await axios.get(`${API_URL}/api/herf/sessions/${sessionId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
