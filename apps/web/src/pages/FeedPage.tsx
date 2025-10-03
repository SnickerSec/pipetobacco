import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Post } from '../services/api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';

interface Club {
  id: string;
  name: string;
  slug: string;
}

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedPosts, currentUser, userClubs] = await Promise.all([
        api.getFeed(),
        api.getCurrentUser().catch(() => null),
        api.getMyClubs().catch(() => []),
      ]);
      setPosts(feedPosts);
      setCurrentUserId(currentUser?.id || null);
      setClubs(userClubs);

      // Set first club as default if not already set
      if (!selectedClubId && userClubs.length > 0) {
        setSelectedClubId(userClubs[0].id);
      }
    } catch (err) {
      setError('Failed to load feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostCreated = () => {
    fetchData();
  };

  const handlePostDeleted = () => {
    fetchData();
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
            onClick={fetchData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show message if user hasn't joined any clubs
  if (!loading && clubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Join a Club to Get Started</h2>
          <p className="text-gray-600 mb-6">
            You need to join at least one club before you can view or create posts.
          </p>
          <button
            onClick={() => navigate('/clubs')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Browse Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Club Selector */}
      {clubs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label htmlFor="club-select" className="block text-sm font-medium text-gray-700 mb-2">
            Posting to:
          </label>
          <select
            id="club-select"
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Create Post */}
      <CreatePostForm onPostCreated={handlePostCreated} clubId={selectedClubId} />

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No posts yet</p>
          <p className="text-sm text-gray-500">
            Be the first to post in your clubs!
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
