import axios from 'axios';

const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

interface DailyRoomConfig {
  sessionId: string;
  maxParticipants: number;
  isPrivate: boolean;
}

interface DailyRoom {
  name: string;
  url: string;
  created_at: string;
  config: {
    exp?: number;
    max_participants?: number;
  };
}

interface DailyMeetingToken {
  token: string;
}

/**
 * Create a Daily.co video room for a herf session
 */
export async function createRoom(config: DailyRoomConfig): Promise<{ roomName: string; roomUrl: string }> {
  try {
    const roomName = `herf-${config.sessionId}`;

    const response = await axios.post<DailyRoom>(
      `${DAILY_API_URL}/rooms`,
      {
        name: roomName,
        privacy: config.isPrivate ? 'private' : 'public',
        properties: {
          max_participants: config.maxParticipants,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'cloud',
          exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days expiry
          enable_knocking: config.isPrivate,
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_video_processing_ui: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      roomName: response.data.name,
      roomUrl: response.data.url,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Daily.co API error:', error.response?.data || error.message);
      throw new Error(`Failed to create video room: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Create a meeting token for a user to join a specific room
 */
export async function createMeetingToken(
  roomName: string,
  userId: string,
  userName: string,
  isHost: boolean = false
): Promise<string> {
  try {
    const response = await axios.post<DailyMeetingToken>(
      `${DAILY_API_URL}/meeting-tokens`,
      {
        properties: {
          room_name: roomName,
          user_name: userName,
          user_id: userId,
          is_owner: isHost,
          enable_recording: isHost ? 'cloud' : undefined,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Daily.co token error:', error.response?.data || error.message);
      throw new Error(`Failed to create meeting token: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Delete a Daily.co room
 */
export async function deleteRoom(roomName: string): Promise<void> {
  try {
    await axios.delete(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Don't throw if room doesn't exist
      if (error.response?.status === 404) {
        console.warn(`Room ${roomName} not found, may have been already deleted`);
        return;
      }
      console.error('Daily.co delete error:', error.response?.data || error.message);
      throw new Error(`Failed to delete room: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Get room info
 */
export async function getRoomInfo(roomName: string): Promise<DailyRoom | null> {
  try {
    const response = await axios.get<DailyRoom>(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Daily.co get room error:', error.response?.data || error.message);
      throw new Error(`Failed to get room info: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * End a meeting by deleting the room
 */
export async function endMeeting(roomName: string): Promise<void> {
  await deleteRoom(roomName);
}
