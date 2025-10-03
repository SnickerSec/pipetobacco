import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ClubSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    loadClub();
  }, [slug]);

  const loadClub = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const clubData = await api.getClub(slug);
      setClub(clubData);
      setName(clubData.name);
      setDescription(clubData.description || '');
      setIsPrivate(clubData.isPrivate);
    } catch (err: any) {
      setError(err.message || 'Failed to load club');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setIsSaving(true);
    setError(null);

    try {
      await api.updateClub(slug, {
        name,
        description: description || undefined,
        isPrivate,
      });

      // Redirect back to club page
      navigate(`/clubs/${slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update club');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;

    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteClub(slug);
      // Redirect to clubs page after deletion
      navigate('/clubs');
    } catch (err: any) {
      setError(err.message || 'Failed to delete club');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading club settings...</div>
        </div>
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => navigate(`/clubs/${slug}`)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Back to Club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/clubs/${slug}`)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {club?.name}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Club Settings</h1>
        <p className="text-gray-600 mt-2">Manage your club's information and privacy settings</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Club Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Club Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tell people what your club is about..."
            />
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Private Club</div>
                <div className="text-sm text-gray-600">
                  Only members can see posts and participate. People need an invitation link to join.
                </div>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/clubs/${slug}`)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      {club?.userMembership?.role === 'OWNER' && (
        <div className="bg-white rounded-lg shadow p-6 mt-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Delete this club</h3>
              <p className="text-sm text-gray-600 mt-1">
                Once you delete a club, there is no going back. This will permanently delete the club, all its posts, and remove all members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              Delete Club
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Club</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{club?.name}</strong>? This action cannot be undone. All posts, members, and data associated with this club will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Club'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
