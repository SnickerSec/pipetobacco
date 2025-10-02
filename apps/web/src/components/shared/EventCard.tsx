import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  club: {
    name: string;
    slug: string;
  };
  attendeeCount: number;
  isPublic?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  onRSVP?: (status: 'going' | 'maybe' | 'not_going') => void;
}

export default function EventCard({
  id,
  title,
  description,
  startTime,
  location,
  club,
  attendeeCount,
  isPublic = true,
  rsvpStatus,
  onRSVP,
}: EventCardProps) {
  const date = new Date(startTime);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const time = date.toLocaleString('default', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });

  return (
    <Card hover>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        {/* Date Badge */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <div className="bg-ember-600 text-white rounded-lg p-4 text-center w-20">
            <div className="text-2xl font-bold">{day}</div>
            <div className="text-sm">{month}</div>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  to={`/events/${id}`}
                  className="text-xl font-bold text-tobacco-900 hover:text-ember-600"
                >
                  {title}
                </Link>
                {!isPublic && <Badge variant="default" size="sm">Private</Badge>}
              </div>

              <p className="text-tobacco-600 mb-2">
                <Link
                  to={`/clubs/${club.slug}`}
                  className="hover:text-ember-600 font-medium"
                >
                  {club.name}
                </Link>
                {' • '}
                {dayOfWeek}, {time}
              </p>

              {description && (
                <p className="text-tobacco-700 mb-3">{description}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-tobacco-600">
                {location && <span>📍 {location}</span>}
                <span>
                  👥 {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} going
                </span>
              </div>
            </div>
          </div>

          {/* RSVP Button */}
          {isPublic && (
            <div className="mt-4">
              {rsvpStatus === 'going' ? (
                <Button variant="secondary" size="sm" onClick={() => onRSVP?.('going')}>
                  Going
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => onRSVP?.('going')}>
                  RSVP
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
