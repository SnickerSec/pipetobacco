import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, User, Post } from '../../services/api';
import PostCard from '../../components/PostCard';
import ReportModal from '../../components/ReportModal';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      // Handle "me" as current user
      let targetUsername = username;
      if (username === 'me') {
        const me = await api.getCurrentUser();
        targetUsername = me.username;
        navigate(`/u/${targetUsername}`, { replace: true });
        return;
      }

      const [profileData, currentUserData, userPosts] = await Promise.all([
        api.getUserProfile(targetUsername),
        api.getCurrentUser().catch(() => null),
        api.getUserPosts(targetUsername),
      ]);

      setUser(profileData);
      setCurrentUser(currentUserData);
      setPosts(userPosts);

      // Set following status from API response
      if (currentUserData && profileData.isFollowing !== undefined) {
        setIsFollowing(profileData.isFollowing);
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

    try {
      if (isFollowing) {
        await api.unfollowUser(user.username);
        setIsFollowing(false);
      } else {
        await api.followUser(user.username);
        setIsFollowing(true);
      }
      // Refresh profile to update follower count
      fetchProfileData();
    } catch (err: any) {
      console.error('Follow/unfollow error:', err);

      // Handle "already following" errors by syncing with server
      const errorMsg = err.message?.toLowerCase() || '';
      if (errorMsg.includes('already')) {
        console.log('Syncing follow state with server due to error');
        // Refresh to get the true follow status from server
        await fetchProfileData();
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
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        {/* Cover Photo - Taller and more subtle */}
        <div
          className="h-48 relative"
          style={{
            backgroundImage: user.coverPhotoUrl
              ? `url(${user.coverPhotoUrl})`
              : 'linear-gradient(135deg, #ea580c 0%, #fb923c 25%, #fdba74 50%, #fcd34d 75%, #fde68a 100%)',
            backgroundSize: user.coverPhotoUrl ? 'cover' : '400% 400%',
            backgroundPosition: 'center',
            animation: user.coverPhotoUrl ? undefined : 'gradient 15s ease infinite',
          }}
        >
          {!user.coverPhotoUrl && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}
        </div>
        <style>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-5">
            {/* Avatar - Overlapping cover */}
            <div className="flex-shrink-0 -mt-16 relative z-10">
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.displayName || user.username}&size=160&background=ea580c&color=fff`
                }
                alt={user.displayName || user.username}
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* Name & Actions */}
            <div className="flex-1 mt-4 sm:mt-0 sm:pt-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
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

                  {/* Bio & Location */}
                  {(user.bio || user.location || user.website) && (
                    <div className="mt-3 space-y-2">
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

                {/* Action Buttons */}
                <div className="mt-4 sm:mt-0 sm:ml-4 flex gap-2">
                  {isOwnProfile ? (
                    <Link
                      to="/settings/profile"
                      className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                    >
                      Edit Profile
                    </Link>
                  ) : currentUser ? (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                      >
                        Report
                      </button>
                    </>
                  ) : null}
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
            {isOwnProfile && user.email && (
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
            )}
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

      {/* Report Modal */}
      {user && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={() => {
            alert('Thank you for your report. Our moderation team will review it shortly.');
          }}
          reportedUserId={user.id}
          reportType="user"
        />
      )}
    </div>
  );
}
