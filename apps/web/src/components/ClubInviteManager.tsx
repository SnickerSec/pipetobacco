import { useState } from 'react';

interface ClubInviteManagerProps {
  clubSlug: string;
}

export default function ClubInviteManager({ clubSlug }: ClubInviteManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    // Just copy the club URL - no need to create invite tokens
    const clubUrl = `${window.location.origin}/clubs/${clubSlug}`;

    try {
      await navigator.clipboard.writeText(clubUrl);
      setSuccessMessage('Club link copied to clipboard! Share it to invite people.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError('Failed to copy link to clipboard');
    }
  };


  return (
    <div className="space-y-6">
      {/* Share Club Link */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Club Link</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share this link with people you want to invite. They can join by clicking the "Join Club" button.
        </p>

        {/* Club URL Display */}
        <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-4">
          <code className="text-sm text-gray-700 break-all">
            {window.location.origin}/clubs/{clubSlug}
          </code>
        </div>

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
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          📋 Copy Club Link
        </button>
      </div>
    </div>
  );
}
