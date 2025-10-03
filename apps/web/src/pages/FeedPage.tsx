import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Post } from '../services/api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';

interface Club {
  id: string;
  name: string;
  slug: string;
}

type FeedItem = (Post & { type: 'post' }) | (any & { type: 'event' });

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedData, currentUser, userClubs, recentReviews] = await Promise.all([
        api.getFeed(),
        api.getCurrentUser().catch(() => null),
        api.getMyClubs().catch(() => []),
        api.getReviews({ limit: 3 }).catch(() => []),
      ]);

      // Separate posts and events
      const postItems = feedData.filter((item: FeedItem) => item.type === 'post') as Post[];
      const eventItems = feedData.filter((item: FeedItem) => item.type === 'event');

      // Sort events by start time (soonest first)
      const sortedEvents = eventItems.sort((a: any, b: any) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      setPosts(postItems);
      setEvents(sortedEvents);
      setReviews(recentReviews);
      setCurrentUserId(currentUser?.id || null);
      setClubs(userClubs);

      // Set default club if user has one set, otherwise use first club
      if (!selectedClubId && userClubs.length > 0) {
        if (currentUser?.defaultClubId) {
          // Check if default club is in user's clubs
          const defaultClubExists = userClubs.some((club: Club) => club.id === currentUser.defaultClubId);
          setSelectedClubId(defaultClubExists ? currentUser.defaultClubId : userClubs[0].id);
        } else {
          setSelectedClubId(userClubs[0].id);
        }
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
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading feed...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
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
      </div>
    );
  }

  // Show message if user hasn't joined any clubs
  if (!loading && clubs.length === 0) {
    return (
      <div className="container mx-auto px-4">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Posts (Center Column) */}
        <div className="lg:col-span-8 space-y-6">
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

        {/* Sidebar - Events & Reviews (Right Column) */}
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <button
                  onClick={() => navigate('/events')}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  View All
                </button>
              </div>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                <button
                  onClick={() => navigate('/reviews')}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  View All
                </button>
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => navigate('/reviews')}
                      className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:shadow-sm transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {review.productName}
                        </h3>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{review.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <img
                          src={review.author.avatarUrl || `https://ui-avatars.com/api/?name=${review.author.displayName || review.author.username}&size=20`}
                          alt={review.author.username}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{review.author.displayName || review.author.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
