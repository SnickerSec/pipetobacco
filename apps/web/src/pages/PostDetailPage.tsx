import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Post } from '../services/api';
import PostCard from '../components/PostCard';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    if (!postId) {
      setError('No post ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [postData, currentUser] = await Promise.all([
        api.getPost(postId),
        api.getCurrentUser().catch(() => null),
      ]);

      setPost(postData);
      setCurrentUserId(currentUser?.id || null);
    } catch (err: any) {
      console.error('Error loading post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = () => {
    // Navigate back to feed after deletion
    navigate('/feed');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Post not found'}</p>
          <button
            onClick={() => navigate('/feed')}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Post Card */}
      <PostCard
        post={post}
        onPostDeleted={handlePostDeleted}
        currentUserId={currentUserId || undefined}
      />
    </div>
  );
}
