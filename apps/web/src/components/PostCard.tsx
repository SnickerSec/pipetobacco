import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api, Post } from '../services/api';
import { renderTextWithMentions } from '../utils/mentions';
import ReportModal from './ReportModal';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

interface PostCardProps {
  post: Post & { isLikedByUser?: boolean };
  onPostDeleted?: () => void;
  currentUserId?: string;
}

export default function PostCard({ post, onPostDeleted, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-expand comments if post has comments
  useEffect(() => {
    if (commentCount > 0 && !showComments) {
      setShowComments(true);
      loadComments();
    }
  }, []); // Only run once on mount

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await api.likePost(post.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsDeleting(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return; // Already loaded

    setIsLoadingComments(true);
    try {
      const loadedComments = await api.getComments(post.id);
      setComments(loadedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await api.createComment(post.id, newComment);
      setComments([comment, ...comments]);
      setCommentCount(commentCount + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    const shareData = {
      title: `Post by ${post.author.displayName || post.author.username}`,
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: shareUrl,
    };

    try {
      // Check if Web Share API is available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Final fallback: show the URL
        alert(`Share this link: ${shareUrl}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Link to={`/u/${post.author.username}`}>
            <img
              src={
                post.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${post.author.displayName || post.author.username}`
              }
              alt={post.author.displayName || post.author.username}
              className="h-12 w-12 rounded-full"
            />
          </Link>
          <div className="ml-3">
            <div className="flex items-center">
              <Link
                to={`/u/${post.author.username}`}
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                {post.author.displayName || post.author.username}
              </Link>
              {post.author.isVerified && (
                <svg className="h-4 w-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span>@{post.author.username}</span>
              {post.club && (
                <>
                  <span className="mx-1">•</span>
                  <Link to={`/clubs/${post.club.slug}`} className="hover:underline">
                    {post.club.name}
                  </Link>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Menu button (three dots) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-2 -m-1"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {currentUserId === post.author.id && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Post
                </button>
              )}
              {currentUserId && currentUserId !== post.author.id && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 whitespace-pre-wrap mb-4">{renderTextWithMentions(post.content)}</p>

      {/* Media (Image or Video) */}
      {post.imageUrl && (
        <div className="mb-4">
          {/* Check if it's a video by file extension or attempt to render */}
          {post.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={post.imageUrl}
              controls
              className="rounded-lg w-full max-h-[500px]"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={post.imageUrl}
              alt="Post"
              loading="lazy"
              className="rounded-lg w-full object-cover max-h-[500px]"
              onError={(e) => {
                // If image fails to load, hide it
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
        >
          <svg
            className={`h-6 w-6 ${isLiked ? 'fill-red-600 text-red-600' : 'fill-none'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className={isLiked ? 'text-red-600 font-medium' : ''}>{likeCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={toggleComments}
          className={`flex items-center space-x-2 transition-colors ${
            showComments ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
          }`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentCount}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-500 hover:text-orange-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Comment Form */}
          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex space-x-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-4 text-gray-500">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Link to={`/u/${comment.author.username}`}>
                    <img
                      src={
                        comment.author.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${comment.author.displayName || comment.author.username}`
                      }
                      alt={comment.author.displayName || comment.author.username}
                      className="h-8 w-8 rounded-full"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/u/${comment.author.username}`}
                          className="text-sm font-medium text-gray-900 hover:underline"
                        >
                          {comment.author.displayName || comment.author.username}
                        </Link>
                        {comment.author.isVerified && (
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mt-1">{renderTextWithMentions(comment.content)}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-3">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReportSubmitted={() => {
          alert('Thank you for your report. Our moderation team will review it shortly.');
        }}
        reportedPostId={post.id}
        reportType="post"
      />
    </div>
  );
}
