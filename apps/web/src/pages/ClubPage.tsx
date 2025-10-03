import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Club, ClubMember, Post } from '../services/api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import ClubInviteManager from '../components/ClubInviteManager';

export default function ClubPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club & { members: ClubMember[]; userMembership: ClubMember | null } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'invites'>('feed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchClubData = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const [clubData, currentUser] = await Promise.all([
        api.getClub(slug),
        api.getCurrentUser().catch(() => null),
      ]);

      setClub(clubData);
      setCurrentUserId(currentUser?.id || null);

      // Fetch posts if user is a member or club is public
      if (!clubData.isPrivate || clubData.userMembership) {
        const clubPosts = await api.getClubPosts(slug);
        setPosts(clubPosts);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load club');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [slug]);

  const handleJoinClub = async () => {
    if (!slug) return;

    setIsJoining(true);
    try {
      await api.joinClub(slug);
      await fetchClubData(); // Refresh club data
    } catch (err: any) {
      alert(err.message || 'Failed to join club');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!slug || !window.confirm('Are you sure you want to leave this club?')) return;

    setIsLeaving(true);
    try {
      await api.leaveClub(slug);
      await fetchClubData(); // Refresh club data
    } catch (err: any) {
      alert(err.message || 'Failed to leave club');
    } finally {
      setIsLeaving(false);
    }
  };

  const handlePostCreated = () => {
    fetchClubData();
  };

  const handlePostDeleted = () => {
    fetchClubData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading club...</div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Club not found'}</p>
          <button
            onClick={() => navigate('/clubs')}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Back to clubs
          </button>
        </div>
      </div>
    );
  }

  const isMember = !!club.userMembership;
  const isOwner = club.userMembership?.role === 'OWNER';
  const isAdmin = isOwner || club.userMembership?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Club Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Cover Photo */}
        {club.coverUrl && (
          <div className="h-48 rounded-t-lg overflow-hidden">
            <img
              src={club.coverUrl}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Club Info */}
            <div className="flex items-center">
              {club.avatarUrl && (
                <img
                  src={club.avatarUrl}
                  alt={club.name}
                  className="h-20 w-20 rounded-lg"
                />
              )}
              <div className={club.avatarUrl ? 'ml-4' : ''}>
                <h1 className="text-3xl font-bold text-gray-900">
                  {club.name}
                  {club.isPrivate && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      🔒 Private
                    </span>
                  )}
                </h1>
                <p className="text-gray-600">/clubs/{club.slug}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}</span>
                  <span>•</span>
                  <span>{club._count.posts} {club._count.posts === 1 ? 'post' : 'posts'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {currentUserId && !club.isPrivate && (
                <>
                  {!isMember ? (
                    <button
                      onClick={handleJoinClub}
                      disabled={isJoining}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isJoining ? 'Joining...' : 'Join Club'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    >
                      Joined
                    </button>
                  )}
                </>
              )}

              {isMember && !isOwner && (
                <button
                  onClick={handleLeaveClub}
                  disabled={isLeaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLeaving ? 'Leaving...' : 'Leave Club'}
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => navigate(`/clubs/${slug}/settings`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Settings
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {club.description && (
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{club.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members ({club.memberCount})
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('invites')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'invites'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invitations
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post (only for members) */}
          {isMember && (
            <CreatePostForm onPostCreated={handlePostCreated} clubId={club.id} />
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 mb-4">No posts yet</p>
              {isMember && (
                <p className="text-sm text-gray-500">Be the first to post in this club!</p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                currentUserId={currentUserId || undefined}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'invites' && isAdmin && slug && (
        <ClubInviteManager clubSlug={slug} />
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {club.members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={
                      member.user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${member.user.displayName || member.user.username}`
                    }
                    alt={member.user.displayName || member.user.username}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {member.user.displayName || member.user.username}
                      </span>
                      {member.user.isVerified && (
                        <svg className="h-4 w-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{member.user.username}
                      {member.role !== 'MEMBER' && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && member.role !== 'OWNER' && member.userId !== currentUserId && (
                  <button
                    onClick={() => {
                      // This would open a role management modal
                      alert('Role management UI coming soon');
                    }}
                    className="text-sm text-gray-600 hover:text-orange-600"
                  >
                    Manage
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
