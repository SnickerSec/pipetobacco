import { useState, useEffect } from 'react';
import { api, ClubInvite } from '../services/api';

interface ClubInviteManagerProps {
  clubSlug: string;
}

export default function ClubInviteManager({ clubSlug }: ClubInviteManagerProps) {
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.createClubInvite(clubSlug, email);
      setEmail('');
      setSuccessMessage('Invitation sent successfully!');
      await fetchInvites();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
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
      {/* Send Invitation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invitation</h3>

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="user@example.com"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>

      {/* Pending Invitations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
        </div>

        {invites.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invites.map((invite) => (
              <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{invite.email}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>
                      {invite.accepted ? (
                        <span className="text-green-600">✓ Accepted</span>
                      ) : isExpired(invite.expiresAt) ? (
                        <span className="text-red-600">Expired</span>
                      ) : (
                        <span>Pending</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>Expires {formatDate(invite.expiresAt)}</span>
                    <span>•</span>
                    <span>Sent {formatDate(invite.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!invite.accepted && !isExpired(invite.expiresAt) && (
                    <>
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
