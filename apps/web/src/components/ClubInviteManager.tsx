import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ClubInviteManagerProps {
  clubSlug: string;
}

export default function ClubInviteManager({ clubSlug }: ClubInviteManagerProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [club, setClub] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadClub();
  }, [clubSlug]);

  const loadClub = async () => {
    try {
      const clubData = await api.getClub(clubSlug);
      setClub(clubData);
    } catch (err) {
      console.error('Failed to load club:', err);
    }
  };

  const handleGenerateInviteLink = async () => {
    setIsGenerating(true);
    try {
      const invitation = await api.createClubInvite(clubSlug, 'invite@placeholder.com');
      const link = `${window.location.origin}/clubs/${clubSlug}/invite/${invitation.token}`;
      setInviteLink(link);
    } catch (err: any) {
      console.error('Failed to generate invite link:', err);
      alert(err.message || 'Failed to generate invite link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = club?.isPrivate && inviteLink ? inviteLink : `${window.location.origin}/clubs/${clubSlug}`;
    const shareData = {
      title: 'Join my club!',
      text: `Check out this club on Herf Social`,
      url: shareUrl,
    };

    try {
      // Check if Web Share API is available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setSuccessMessage('Club link copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      // User cancelled share or error occurred
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };


  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite People</h3>
      <p className="text-sm text-gray-600 mb-4">
        {club?.isPrivate
          ? 'Generate a shareable invite link for this private club. The link expires in 7 days.'
          : 'Share this club with people you want to invite. They can join by clicking the "Join Club" button.'
        }
      </p>

      {/* For Private Clubs - Generate Invite Link */}
      {club?.isPrivate && !inviteLink && (
        <button
          onClick={handleGenerateInviteLink}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 mb-4"
        >
          {isGenerating ? 'Generating...' : 'Generate Invite Link'}
        </button>
      )}

      {/* Show the link once generated or for public clubs */}
      {(inviteLink || !club?.isPrivate) && (
        <>
          {/* Club URL Display */}
          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4">
            <code className="text-sm text-gray-700 break-all">
              {club?.isPrivate && inviteLink
                ? inviteLink
                : `${window.location.origin}/clubs/${clubSlug}`
              }
            </code>
          </div>

          {successMessage && (
            <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share {club?.isPrivate ? 'Invite Link' : 'Club'}
            </button>

            {/* Regenerate button for private clubs */}
            {club?.isPrivate && inviteLink && (
              <button
                onClick={handleGenerateInviteLink}
                disabled={isGenerating}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isGenerating ? '...' : '🔄'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
