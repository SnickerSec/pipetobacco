import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  isPublic: boolean;
  club: {
    id: string;
    name: string;
    slug: string;
  };
  rsvps: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
  _count: {
    rsvps: number;
  };
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRsvp, setUserRsvp] = useState<string | null>(null);
  const [isRsvping, setIsRsvping] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [eventData, rsvpData] = await Promise.all([
        api.getEvent(id),
        api.getUserRsvp(id).catch(() => null),
      ]);

      setEvent(eventData);
      setUserRsvp(rsvpData?.status || null);
    } catch (err: any) {
      console.error('Error loading event:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: 'GOING' | 'MAYBE' | 'NOT_GOING') => {
    if (!id) return;

    setIsRsvping(true);
    try {
      await api.rsvpToEvent(id, status);
      setUserRsvp(status);
      // Reload event to update RSVP count
      await loadEvent();
    } catch (err: any) {
      alert(err.message || 'Failed to RSVP');
    } finally {
      setIsRsvping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Event not found'}</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const startDate = formatDate(event.startTime);
  const endDate = event.endTime ? formatDate(event.endTime) : null;
  const isPast = new Date(event.startTime) < new Date();
  const goingCount = event.rsvps.filter((r) => r.status === 'GOING').length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/events')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isPast ? 'bg-gray-400' : 'bg-orange-600'} text-white`}>
          <div className="flex items-center justify-between mb-2">
            <Link
              to={`/clubs/${event.club.slug}`}
              className="text-sm font-medium hover:underline"
            >
              {event.club.name}
            </Link>
            {!event.isPublic && (
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                Private
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {startDate.full}
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.location}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Time Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">When</h2>
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Starts:</span> {startDate.full} at {startDate.time}
              </p>
              {endDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Ends:</span> {endDate.full} at {endDate.time}
                </p>
              )}
              {isPast && (
                <p className="text-sm text-gray-500 mt-2">
                  This event ended {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* RSVP Section */}
          {!isPast && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Will you attend?</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRsvp('GOING')}
                  disabled={isRsvping}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    userRsvp === 'GOING'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Going
                </button>
                <button
                  onClick={() => handleRsvp('MAYBE')}
                  disabled={isRsvping}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    userRsvp === 'MAYBE'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRsvp('NOT_GOING')}
                  disabled={isRsvping}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    userRsvp === 'NOT_GOING'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Can't Go
                </button>
              </div>
            </div>
          )}

          {/* Attendees */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Attendees ({goingCount} going)
            </h2>
            {event.rsvps.filter((r) => r.status === 'GOING').length === 0 ? (
              <p className="text-gray-500">No one has RSVP'd yet. Be the first!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.rsvps
                  .filter((r) => r.status === 'GOING')
                  .map((rsvp) => (
                    <Link
                      key={rsvp.id}
                      to={`/u/${rsvp.user.username}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={
                          rsvp.user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${rsvp.user.displayName || rsvp.user.username}&size=40&background=ea580c&color=fff`
                        }
                        alt={rsvp.user.displayName || rsvp.user.username}
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {rsvp.user.displayName || rsvp.user.username}
                      </span>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
