import { useState, useEffect } from 'react';
import { api, Post } from '../services/api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const [feedPosts, currentUser] = await Promise.all([
        api.getFeed(),
        api.getCurrentUser().catch(() => null),
      ]);
      setPosts(feedPosts);
      setCurrentUserId(currentUser?.id || null);
    } catch (err) {
      setError('Failed to load feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = () => {
    fetchFeed();
  };

  const handlePostDeleted = () => {
    fetchFeed();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading feed...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchFeed}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <CreatePostForm onPostCreated={handlePostCreated} />

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No posts to show yet</p>
          <p className="text-sm text-gray-500">
            Follow some users or join clubs to see posts in your feed
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              currentUserId={currentUserId || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
