import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';

export interface UserCardProps {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followerCount?: number;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function UserCard({
  username,
  displayName,
  avatarUrl,
  bio,
  followerCount,
  isFollowing,
  onFollow,
  onUnfollow,
}: UserCardProps) {
  return (
    <Card hover>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Link to={`/profile/${username}`}>
          <Avatar src={avatarUrl} alt={displayName} size="lg" />
        </Link>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${username}`}
            className="block font-semibold text-tobacco-900 hover:text-ember-600 truncate"
          >
            {displayName}
          </Link>
          <p className="text-sm text-tobacco-600 mb-1">@{username}</p>

          {bio && (
            <p className="text-sm text-tobacco-700 line-clamp-2 mb-2">{bio}</p>
          )}

          {followerCount !== undefined && (
            <p className="text-xs text-tobacco-600">
              <span className="font-semibold">{followerCount}</span> followers
            </p>
          )}
        </div>

        {/* Follow Button */}
        <div className="flex-shrink-0">
          {isFollowing ? (
            <Button variant="secondary" size="sm" onClick={onUnfollow}>
              Following
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onFollow}>
              Follow
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
