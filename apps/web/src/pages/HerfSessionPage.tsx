import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getHerfSession,
  joinHerfSession,
  startHerfSession,
  endHerfSession,
  leaveHerfSession,
  HerfSession as HerfSessionType,
} from '../services/herfService';
import HerfSession from '../components/herf/HerfSession';

export default function HerfSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<HerfSessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinData, setJoinData] = useState<{
    token: string;
    roomUrl: string;
    isHost: boolean;
  } | null>(null);

  const token = localStorage.getItem('token') || '';
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await getHerfSession(sessionId!, token);
      setSession(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      const updatedSession = await startHerfSession(sessionId!, token);
      setSession(updatedSession);
      // Auto-join after starting
      handleJoin();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start session');
    }
  };

  const handleJoin = async () => {
    try {
      const data = await joinHerfSession(sessionId!, token);
      setJoinData(data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join session');
    }
  };

  const handleEnd = async () => {
    if (!confirm('Are you sure you want to end this session?')) return;

    try {
      await endHerfSession(sessionId!, token);
      navigate('/herf');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to end session');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveHerfSession(sessionId!, token);
      setJoinData(null);
      navigate('/herf');
    } catch (err: any) {
      console.error('Failed to leave session:', err);
      navigate('/herf');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/herf')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // If already in the video call
  if (joinData) {
    return (
      <HerfSession
        sessionId={sessionId!}
        roomUrl={joinData.roomUrl}
        token={token}
        meetingToken={joinData.token}
        isHost={joinData.isHost}
        onLeave={handleLeave}
      />
    );
  }

  // Lobby view
  const isHost = session.hostId === userId;
  const isLive = session.status === 'LIVE';
  const isScheduled = session.status === 'SCHEDULED';
  const participantCount = session._count?.participants || 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/herf')}
          className="text-gray-400 hover:text-white mb-6 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Sessions</span>
        </button>

        {/* Session Info Card */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          {/* Status Badge */}
          <div className="flex items-center space-x-4 mb-6">
            {isLive && (
              <span className="flex items-center space-x-2 text-red-500 text-lg font-medium">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span>LIVE</span>
              </span>
            )}
            {isScheduled && (
              <span className="text-amber-500 text-lg font-medium">Scheduled</span>
            )}
            {session.isPrivate && (
              <span className="text-gray-400 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Private Session</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">{session.title}</h1>

          {/* Description */}
          {session.description && (
            <p className="text-gray-300 mb-6">{session.description}</p>
          )}

          {/* Host Info */}
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-700">
            {session.host.avatarUrl ? (
              <img
                src={session.host.avatarUrl}
                alt={session.host.displayName}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-lg font-semibold">
                {session.host.displayName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-medium">{session.host.displayName}</p>
              <p className="text-gray-400 text-sm">Host</p>
            </div>
            {isHost && (
              <span className="ml-auto bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
                You're the host
              </span>
            )}
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Participants</p>
              <p className="text-white text-lg font-medium">
                {participantCount} / {session.maxParticipants}
              </p>
            </div>
            {session.scheduledFor && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Scheduled For</p>
                <p className="text-white text-lg font-medium">
                  {new Date(session.scheduledFor).toLocaleString()}
                </p>
              </div>
            )}
            {session.club && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Club</p>
                <p className="text-amber-500 text-lg font-medium">{session.club.name}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {isHost && isScheduled && (
              <button
                onClick={handleStart}
                className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium"
              >
                Start Session
              </button>
            )}
            {isLive && (
              <button
                onClick={handleJoin}
                className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium"
              >
                Join Session
              </button>
            )}
            {isHost && isLive && (
              <button
                onClick={handleEnd}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Participants List */}
        {session.participants && session.participants.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Participants</h2>
            <div className="space-y-3">
              {session.participants
                .filter((p) => !p.leftAt)
                .map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    {participant.user.avatarUrl ? (
                      <img
                        src={participant.user.avatarUrl}
                        alt={participant.user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold">
                        {participant.user.displayName[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{participant.user.displayName}</p>
                      <p className="text-gray-400 text-sm">
                        Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
