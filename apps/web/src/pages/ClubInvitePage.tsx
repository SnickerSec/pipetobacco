import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ClubInvite } from '../services/api';

export default function ClubInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<ClubInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await api.getInviteByToken(token);
      setInvite(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;

    setIsAccepting(true);
    setError(null);

    try {
      const result = await api.acceptClubInvite(token);
      // Redirect to club page
      navigate(`/clubs/${result.club.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading invitation...</div>
      </div>
    );
  }

  if (error || !invite || !invite.club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This invitation link is invalid or has expired.'}
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

  const expiresAt = new Date(invite.expiresAt);
  const isExpired = expiresAt < new Date();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Club Header */}
        {invite.club.avatarUrl && (
          <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500">
            <img
              src={invite.club.avatarUrl}
              alt={invite.club.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Invitation Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="h-12 w-12 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
          </div>

          {/* Invitation Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're Invited!
            </h1>
            <p className="text-gray-600 text-lg">
              You've been invited to join <span className="font-semibold">{invite.club.name}</span>
            </p>
            {invite.club.isPrivate && (
              <p className="mt-2 text-sm text-gray-500">
                🔒 This is a private club
              </p>
            )}
          </div>

          {/* Club Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{invite.club.name}</h2>
            {invite.club.description && (
              <p className="text-gray-700 mb-4">{invite.club.description}</p>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>{invite.club.memberCount} {invite.club.memberCount === 1 ? 'member' : 'members'}</span>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="mb-6 text-sm text-gray-600">
            <p>Invited to: <span className="font-medium">{invite.email}</span></p>
            <p className="mt-1">
              Expires: <span className="font-medium">{expiresAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              disabled={isAccepting || isExpired}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isAccepting ? 'Accepting...' : isExpired ? 'Invitation Expired' : 'Accept Invitation'}
            </button>
            <button
              onClick={() => navigate('/clubs')}
              disabled={isAccepting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Browse Clubs
            </button>
          </div>

          {isExpired && (
            <p className="mt-4 text-center text-sm text-red-600">
              This invitation has expired. Please contact the club admin for a new invitation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
