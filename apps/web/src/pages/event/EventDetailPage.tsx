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
  timezone: string;
  isPublic: boolean;
  creatorId: string;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTimezone, setEditTimezone] = useState('America/New_York');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
      const [eventData, rsvpData, currentUser] = await Promise.all([
        api.getEvent(id),
        api.getUserRsvp(id).catch(() => null),
        api.getCurrentUser().catch(() => null),
      ]);

      setEvent(eventData);
      setUserRsvp(rsvpData?.status || null);
      setCurrentUserId(currentUser?.id || null);
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

  const openEditModal = () => {
    if (!event) return;
    setEditTitle(event.title);
    setEditDescription(event.description || '');
    setEditLocation(event.location || '');
    setEditStartTime(new Date(event.startTime).toISOString().slice(0, 16));
    setEditEndTime(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '');
    setEditTimezone((event as any).timezone || 'America/New_York');
    setEditIsPublic(event.isPublic);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await api.updateEvent(id, {
        title: editTitle,
        description: editDescription || null,
        location: editLocation || null,
        startTime: editStartTime,
        endTime: editEndTime || null,
        timezone: editTimezone,
        isPublic: editIsPublic,
      });

      setShowEditModal(false);
      await loadEvent();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update event');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string, timezone: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone,
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
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

  const startDate = formatDate(event.startTime, event.timezone);
  const endDate = event.endTime ? formatDate(event.endTime, event.timezone) : null;
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            {currentUserId === event.creatorId && (
              <button
                onClick={openEditModal}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-opacity-90 transition text-sm font-medium"
              >
                Edit Event
              </button>
            )}
          </div>
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
              <p className="text-sm text-gray-500">
                <span className="font-medium">Timezone:</span> {event.timezone}
              </p>
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

      {/* Edit Event Modal */}
      {showEditModal && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Event</h2>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="edit-startTime"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="edit-endTime"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="edit-timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone *
                </label>
                <select
                  id="edit-timezone"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              {/* Public/Private */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-isPublic"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-isPublic" className="ml-2 block text-sm text-gray-700">
                  Public event (visible to non-members)
                </label>
              </div>

              {/* Error Message */}
              {updateError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {updateError}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setUpdateError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
