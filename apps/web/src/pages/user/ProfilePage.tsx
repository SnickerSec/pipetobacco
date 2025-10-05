import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, User, Post } from '../../services/api';
import PostCard from '../../components/PostCard';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'clubs' | 'about'>('posts');

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async (preserveFollowState = false) => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      // Handle "me" as current user
      let targetUsername = username;
      if (username === 'me') {
        const me = await api.getCurrentUser();
        targetUsername = me.username;
        navigate(`/profile/${targetUsername}`, { replace: true });
        return;
      }

      const [profileData, currentUserData, userPosts] = await Promise.all([
        api.getUserProfile(targetUsername),
        api.getCurrentUser().catch(() => null),
        api.getUserPosts(targetUsername),
      ]);

      console.log('=== PROFILE DATA DEBUG ===');
      console.log('Raw profileData:', profileData);
      console.log('profileData.isFollowing type:', typeof profileData.isFollowing);
      console.log('profileData.isFollowing value:', profileData.isFollowing);
      console.log('preserveFollowState:', preserveFollowState);
      console.log('========================');

      setUser(profileData);
      setCurrentUser(currentUserData);
      setPosts(userPosts);

      // Set following status from API response (unless we're preserving the current state)
      if (!preserveFollowState) {
        const followStatus = profileData.isFollowing ?? false;
        console.log('Setting isFollowing to:', followStatus);
        setIsFollowing(followStatus);
      } else {
        console.log('Preserving follow state, not updating from API');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    console.log('=== FOLLOW BUTTON CLICKED ===');
    console.log('Current isFollowing state:', isFollowing);
    console.log('User:', user.username);
    console.log('============================');

    try {
      if (isFollowing) {
        console.log('Attempting to UNFOLLOW...');
        await api.unfollowUser(user.username);
        setIsFollowing(false);
        // Refresh profile to update follower count (preserve follow state)
        await fetchProfileData(true);
      } else {
        console.log('Attempting to FOLLOW...');
        await api.followUser(user.username);
        setIsFollowing(true);
        // Refresh profile to update follower count (preserve follow state)
        await fetchProfileData(true);
      }
    } catch (err: any) {
      console.error('=== FOLLOW ERROR ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('==================');

      // Handle "already following" or "already not following" errors by syncing with server
      const errorMsg = err.message?.toLowerCase() || '';
      if (errorMsg.includes('already following') || errorMsg.includes('already')) {
        console.log('Syncing follow state with server due to error:', err.message);
        // Refresh from server without preserving state to get the true follow status
        await fetchProfileData(false);
      } else {
        alert(err.message || 'Failed to update follow status');
      }
    }
  };

  const handlePostDeleted = () => {
    fetchProfileData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/feed')}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Cover Photo */}
        <div
          className="h-48 rounded-t-lg"
          style={{
            backgroundImage: user.coverPhotoUrl ? `url(${user.coverPhotoUrl})` : undefined,
            backgroundColor: user.coverPhotoUrl ? undefined : '#D97706',
          }}
        ></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12 sm:-mt-16">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.displayName || user.username}&size=128`
                }
                alt={user.displayName || user.username}
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white"
              />
            </div>

            {/* Name & Actions */}
            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.displayName || user.username}
                    </h1>
                    {user.isVerified && (
                      <svg
                        className="h-6 w-6 text-blue-500 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600">@{user.username}</p>
                </div>

                <div className="mt-4 sm:mt-0 flex space-x-3">
                  {isOwnProfile ? (
                    <Link
                      to="/settings/profile"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                    >
                      Edit Profile
                    </Link>
                  ) : currentUser ? (
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Bio & Location */}
              {(user.bio || user.location || user.website) && (
                <div className="mt-4 space-y-2">
                  {user.bio && <p className="text-gray-700">{user.bio}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {user.location && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {user.location}
                      </div>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-orange-600 hover:text-orange-700"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex space-x-6 mt-4">
                <div>
                  <span className="font-bold text-gray-900">{user._count?.posts || 0}</span>
                  <span className="text-gray-600 ml-1">Posts</span>
                </div>
                <div className="cursor-pointer hover:text-orange-600">
                  <span className="font-bold text-gray-900">{user._count?.followers || 0}</span>
                  <span className="text-gray-600 ml-1">Followers</span>
                </div>
                <div className="cursor-pointer hover:text-orange-600">
                  <span className="font-bold text-gray-900">{user._count?.following || 0}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'posts'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'about'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                currentUserId={currentUser?.id}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Username:</span>
              <span className="ml-2 text-gray-900">@{user.username}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{user.email}</span>
            </div>
            {user.location && (
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-900">{user.location}</span>
              </div>
            )}
            {user.website && (
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-orange-600 hover:text-orange-700"
                >
                  {user.website}
                </a>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Joined:</span>
              <span className="ml-2 text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
