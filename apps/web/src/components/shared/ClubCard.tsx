import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export interface ClubCardProps {
  slug: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  memberCount: number;
  isPrivate?: boolean;
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onRequest?: () => void;
}

export default function ClubCard({
  slug,
  name,
  description,
  avatarUrl,
  coverUrl,
  memberCount,
  isPrivate,
  isMember,
  onJoin,
  onLeave,
  onRequest,
}: ClubCardProps) {
  return (
    <Card padding="none" hover>
      {/* Cover Photo */}
      <Link to={`/clubs/${slug}`}>
        <div
          className="h-32 rounded-t-lg bg-gradient-to-r from-ember-400 to-tobacco-400"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover' } : {}}
        />
      </Link>

      {/* Club Info */}
      <div className="p-6">
        <div className="flex items-center space-x-3 -mt-16 mb-4">
          <Avatar src={avatarUrl} alt={name} size="xl" className="border-4 border-white" />
          <div className="mt-12 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link
                to={`/clubs/${slug}`}
                className="font-bold text-tobacco-900 hover:text-ember-600 truncate"
              >
                {name}
              </Link>
              {isPrivate && <Badge variant="default" size="sm">Private</Badge>}
            </div>
          </div>
        </div>

        {description && (
          <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-tobacco-600">
            <span className="font-semibold">{memberCount.toLocaleString()}</span> members
          </div>

          {/* Action Button */}
          {isMember ? (
            <Button variant="secondary" size="sm" onClick={onLeave}>
              Joined
            </Button>
          ) : isPrivate ? (
            <Button variant="secondary" size="sm" onClick={onRequest}>
              Request
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onJoin}>
              Join
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
