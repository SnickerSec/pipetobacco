import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export interface PostCardProps {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  mediaUrls?: string[];
  club?: {
    name: string;
    slug: string;
  };
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  onReact?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function PostCard({
  id,
  author,
  content,
  mediaUrls,
  club,
  reactionCount,
  commentCount,
  createdAt,
  onReact,
  onComment,
  onShare,
}: PostCardProps) {
  return (
    <Card hover>
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Link to={`/profile/${author.username}`}>
          <Avatar src={author.avatarUrl} alt={author.displayName} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link
              to={`/profile/${author.username}`}
              className="font-semibold text-tobacco-900 hover:text-ember-600"
            >
              {author.displayName}
            </Link>
            {club && (
              <>
                <span className="text-tobacco-600">•</span>
                <span className="text-sm text-tobacco-600">in</span>
                <Link
                  to={`/clubs/${club.slug}`}
                  className="text-sm text-ember-600 hover:text-ember-700 font-medium"
                >
                  {club.name}
                </Link>
              </>
            )}
          </div>
          <p className="text-sm text-tobacco-600">{createdAt}</p>
        </div>
      </div>

      {/* Post Content */}
      <Link to={`/posts/${id}`} className="block">
        <p className="text-tobacco-800 mb-4 whitespace-pre-wrap">{content}</p>

        {/* Media */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="mb-4">
            <img
              src={mediaUrls[0]}
              alt="Post media"
              className="w-full h-64 object-cover rounded-lg bg-tobacco-200"
            />
          </div>
        )}
      </Link>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-tobacco-200">
        <button
          onClick={onReact}
          className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600 transition-colors"
        >
          <span>🔥</span>
          <span className="text-sm font-medium">{reactionCount}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600 transition-colors"
        >
          <span>💬</span>
          <span className="text-sm font-medium">{commentCount} comments</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600 transition-colors"
        >
          <span>🔗</span>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </Card>
  );
}
