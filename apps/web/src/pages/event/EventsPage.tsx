import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'my' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load user's clubs
      const clubs = await api.getClubs();
      setUserClubs(clubs);

      // Load events from all clubs
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
        // TODO: Filter by RSVP status
        return events.filter(event => new Date(event.startTime) >= now);
      default:
        return events;
    }
  };

  const filteredEvents = filterEvents();

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

      {/* Create Event Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create Event</h2>
            <p className="text-gray-600 mb-4">
              Event creation form will be implemented in the next step.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
