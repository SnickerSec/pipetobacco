import { useState } from 'react';

interface ClubInviteManagerProps {
  clubSlug: string;
}

export default function ClubInviteManager({ clubSlug }: ClubInviteManagerProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShare = async () => {
    const clubUrl = `${window.location.origin}/clubs/${clubSlug}`;
    const shareData = {
      title: 'Join my club!',
      text: `Check out this club on The Ember Society`,
      url: clubUrl,
    };

    try {
      // Check if Web Share API is available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(clubUrl);
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
        Share this club with people you want to invite. They can join by clicking the "Join Club" button.
      </p>

      {/* Club URL Display */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4">
        <code className="text-sm text-gray-700 break-all">
          {window.location.origin}/clubs/{clubSlug}
        </code>
      </div>

      {successMessage && (
        <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <button
        onClick={handleShare}
        className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Club
      </button>
    </div>
  );
}
