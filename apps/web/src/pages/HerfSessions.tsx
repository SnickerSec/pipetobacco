import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getHerfSessions,
  createHerfSession,
  HerfSession,
  CreateHerfSessionData,
} from '../services/herfService';

export default function HerfSessions() {
  const [sessions, setSessions] = useState<HerfSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live'>('upcoming');

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (filter === 'upcoming') {
        filters.upcoming = true;
      } else if (filter === 'live') {
        filters.status = 'LIVE';
      }

      const data = await getHerfSessions(filters, token);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (data: CreateHerfSessionData) => {
    try {
      await createHerfSession(data, token);
      setShowCreateModal(false);
      loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Virtual Herf Sessions</h1>
            <p className="text-gray-400">Join or host a virtual smoking session</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Session</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setFilter('upcoming')}
            className={`pb-3 px-2 font-medium ${
              filter === 'upcoming'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`pb-3 px-2 font-medium flex items-center space-x-2 ${
              filter === 'live'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span>Live Now</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-2 font-medium ${
              filter === 'all'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Sessions
          </button>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400">No sessions found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-amber-500 hover:text-amber-400"
            >
              Create the first session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSession}
        />
      )}
    </div>
  );
}

function SessionCard({ session }: { session: HerfSession }) {
  const isLive = session.status === 'LIVE';
  const participantCount = session._count?.participants || 0;

  return (
    <Link
      to={`/herf/${session.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all"
    >
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          {isLive && (
            <span className="flex items-center space-x-2 text-red-500 text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>LIVE</span>
            </span>
          )}
          {session.status === 'SCHEDULED' && (
            <span className="text-amber-500 text-sm font-medium">Scheduled</span>
          )}
          {session.isPrivate && (
            <span className="text-gray-400 text-sm flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Private</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2">{session.title}</h3>

        {/* Description */}
        {session.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{session.description}</p>
        )}

        {/* Host */}
        <div className="flex items-center space-x-2 mb-4">
          {session.host.avatarUrl ? (
            <img
              src={session.host.avatarUrl}
              alt={session.host.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-semibold">
              {session.host.displayName[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white text-sm font-medium">{session.host.displayName}</p>
            <p className="text-gray-500 text-xs">Host</p>
          </div>
        </div>

        {/* Club */}
        {session.club && (
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Club: </span>
            <span className="text-amber-500 text-sm">{session.club.name}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>
              {participantCount}/{session.maxParticipants}
            </span>
          </div>

          {session.scheduledFor && (
            <span className="text-gray-400 text-sm">
              {new Date(session.scheduledFor).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CreateSessionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: CreateHerfSessionData) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title,
      description: description || undefined,
      scheduledFor: scheduledFor || undefined,
      maxParticipants,
      isPrivate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Herf Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Friday Night Herf"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Let's enjoy some cigars together..."
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Schedule For (Optional)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Max Participants</label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              min={2}
              max={20}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="isPrivate" className="text-white">
              Private session (invite only)
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
