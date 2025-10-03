import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

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
  rsvps: any[];
  _count: {
    rsvps: number;
  };
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'my' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [selectedClubId, setSelectedClubId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load current user and user's joined clubs only
      const [currentUser, clubs] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getMyClubs(),
      ]);

      setCurrentUserId(currentUser?.id || null);
      setUserClubs(clubs);

      // Set first club as default for event creation
      if (clubs.length > 0 && !selectedClubId) {
        setSelectedClubId(clubs[0].id);
      }

      // Load events from user's clubs
      const allEvents: Event[] = [];
      for (const club of clubs) {
        const clubEvents = await api.getClubEvents(club.slug);
        allEvents.push(...clubEvents);
      }

      // Sort by start time
      allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClubId) {
      setError('Please select a club');
      return;
    }

    if (!title.trim() || !startTime) {
      setError('Title and start time are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedClub = userClubs.find(c => c.id === selectedClubId);
      if (!selectedClub) {
        throw new Error('Club not found');
      }

      await api.createEvent(selectedClub.slug, {
        title,
        description: description || null,
        location: location || null,
        startTime,
        endTime: endTime || null,
        isPublic,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setStartTime('');
      setEndTime('');
      setIsPublic(true);
      setShowCreateModal(false);

      // Reload events
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  };

  const filterEvents = () => {
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.startTime) >= now);
      case 'past':
        return events.filter(event => new Date(event.startTime) < now);
      case 'my':
        // Filter events where user has RSVP'd with status 'GOING'
        return events.filter(event => {
          const userRsvp = event.rsvps.find((rsvp: any) => rsvp.userId === currentUserId);
          return userRsvp?.status === 'GOING';
        });
      default:
        return events;
    }
  };

  const filteredEvents = filterEvents();

  // Show empty state if user hasn't joined any clubs
  if (!isLoading && userClubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Join a Club to See Events</h2>
          <p className="text-gray-600 mb-6">
            You need to join at least one club before you can view or create events.
          </p>
          <button
            onClick={() => navigate('/clubs')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Browse Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Upcoming gatherings and meetups</p>
        </div>
        {userClubs.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium whitespace-nowrap"
          >
            Create Event
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'upcoming'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'my'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          My Events
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'past'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Past
        </button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming' && 'No upcoming events in your clubs.'}
            {filter === 'past' && 'No past events to show.'}
            {filter === 'my' && 'You haven\'t RSVP\'d to any events.'}
          </p>
          {userClubs.length > 0 && filter === 'upcoming' && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Create an Event
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const date = formatDate(event.startTime);
            const isPast = new Date(event.startTime) < new Date();

            return (
              <div
                key={event.id}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition ${
                  isPast ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <div
                      className={`rounded-lg p-4 text-center w-20 ${
                        isPast ? 'bg-gray-400' : 'bg-orange-600'
                      } text-white`}
                    >
                      <div className="text-2xl font-bold">{date.day}</div>
                      <div className="text-sm">{date.month}</div>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                          {!event.isPublic && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">
                          <Link
                            to={`/clubs/${event.club.slug}`}
                            className="hover:text-orange-600 font-medium"
                          >
                            {event.club.name}
                          </Link>{' '}
                          • {date.weekday}, {date.time}
                        </p>
                        {event.description && (
                          <p className="text-gray-700">{event.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {event.location && <span>📍 {event.location}</span>}
                        <span>👥 {event._count.rsvps} Going</span>
                      </div>
                      {!isPast && (
                        <Link
                          to={`/events/${event.id}`}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Event</h2>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Club Selection */}
              <div>
                <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-1">
                  Club *
                </label>
                <select
                  id="club"
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {userClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Pipe Night Gathering"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Tell us about your event..."
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Public/Private */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Public event (visible to non-members)
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
