import { useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

interface RSVP {
  userId: string;
  status: string;
  user: User;
}

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
  rsvps?: RSVP[];
  _count: {
    rsvps: number;
  };
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [showAttendees, setShowAttendees] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    };
  };

  const startDate = formatDate(event.startTime);
  const isPast = new Date(event.startTime) < new Date();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
      <Link to={`/events/${event.id}`} className="block">
        <div className="p-6">
          {/* Header with Club Info */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/clubs/${event.club.slug}`}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
              onClick={(e) => e.stopPropagation()}
            >
              {event.club.name}
            </Link>
            {!event.isPublic && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                Private
              </span>
            )}
          </div>

          {/* Event Content */}
          <div className="flex gap-6">
            {/* Date Badge */}
            <div className="flex-shrink-0">
              <div
                className={`rounded-lg p-4 text-center w-20 ${
                  isPast ? 'bg-gray-400' : 'bg-orange-600'
                } text-white`}
              >
                <div className="text-2xl font-bold">{startDate.day}</div>
                <div className="text-sm">{startDate.month}</div>
              </div>
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{startDate.full} at {startDate.time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-gray-700 line-clamp-2 mb-3">{event.description}</p>
              )}

              <div className="flex items-center justify-between">
                {event._count.rsvps > 0 ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAttendees(true);
                    }}
                    className="text-sm text-gray-600 hover:text-orange-600 transition"
                  >
                    👥 {event._count.rsvps} {event._count.rsvps === 1 ? 'person' : 'people'} going
                  </button>
                ) : (
                  <span className="text-sm text-gray-600">
                    👥 No one going yet
                  </span>
                )}
                {!isPast && (
                  <span className="text-sm font-medium text-orange-600">
                    View Details →
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Attendees Modal */}
      {showAttendees && event.rsvps && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAttendees(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  People Going ({event._count.rsvps})
                </h3>
                <button
                  onClick={() => setShowAttendees(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {event.rsvps.map((rsvp) => (
                <Link
                  key={rsvp.userId}
                  to={`/u/${rsvp.user.username}`}
                  onClick={() => setShowAttendees(false)}
                  className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition"
                >
                  <img
                    src={
                      rsvp.user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${rsvp.user.displayName || rsvp.user.username}&size=40&background=ea580c&color=fff`
                    }
                    alt={rsvp.user.displayName || rsvp.user.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {rsvp.user.displayName || rsvp.user.username}
                      </p>
                      {rsvp.user.isVerified && (
                        <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{rsvp.user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
