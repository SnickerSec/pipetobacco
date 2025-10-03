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
  _count: {
    rsvps: number;
  };
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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
                <span className="text-sm text-gray-600">
                  👥 {event._count.rsvps} {event._count.rsvps === 1 ? 'person' : 'people'} going
                </span>
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
    </div>
  );
}
