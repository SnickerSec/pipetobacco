import { useState, useEffect } from 'react';
import { api, ClubInvite } from '../services/api';

interface ClubInviteManagerProps {
  clubSlug: string;
}

export default function ClubInviteManager({ clubSlug }: ClubInviteManagerProps) {
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, [clubSlug]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const data = await api.getClubInvites(clubSlug);
      setInvites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create invite with a placeholder email (will generate link)
      const invite = await api.createClubInvite(clubSlug, 'invite@placeholder.com');
      await fetchInvites();

      // Auto-copy the link
      const link = `${window.location.origin}/clubs/invites/${invite.token}`;
      await navigator.clipboard.writeText(link);
      setSuccessMessage('Invitation link created and copied to clipboard!');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    try {
      await api.revokeClubInvite(clubSlug, inviteId);
      await fetchInvites();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/clubs/invites/${token}`;
    navigator.clipboard.writeText(link);
    setSuccessMessage('Invitation link copied to clipboard!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-600">Loading invitations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Invitation Link */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Invitation Link</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate a shareable invitation link. You can send it via email, text, or any messaging app.
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <button
          onClick={handleCreateInvite}
          disabled={isCreating}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
        >
          {isCreating ? 'Creating Link...' : '+ Create New Invitation Link'}
        </button>
      </div>

      {/* Active Invitation Links */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Invitation Links</h3>
          <p className="text-sm text-gray-600 mt-1">
            Share these links with people you want to invite to the club
          </p>
        </div>

        {invites.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No active invitation links</p>
            <p className="text-sm text-gray-500 mt-1">Create one above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invites.map((invite) => (
              <div key={invite.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {invite.accepted ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Used
                        </span>
                      ) : isExpired(invite.expiresAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Link Preview */}
                    <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200 mb-2">
                      <code className="text-xs text-gray-600 break-all">
                        {window.location.origin}/clubs/invites/{invite.token}
                      </code>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Created {formatDate(invite.createdAt)}</span>
                      <span>•</span>
                      <span>Expires {formatDate(invite.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!invite.accepted && !isExpired(invite.expiresAt) && (
                      <>
                        <button
                          onClick={() => copyInviteLink(invite.token)}
                          className="px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
