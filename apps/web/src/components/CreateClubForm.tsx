import { useState, FormEvent } from 'react';
import { api, CreateClubData } from '../services/api';

interface CreateClubFormProps {
  onClubCreated?: (slug: string) => void;
  onCancel?: () => void;
}

export default function CreateClubForm({ onClubCreated, onCancel }: CreateClubFormProps) {
  const [formData, setFormData] = useState<CreateClubData>({
    name: '',
    slug: '',
    description: '',
    isPrivate: false,
    avatarUrl: '',
    coverUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug from name if slug hasn't been manually edited
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim()) {
      setError('Club name is required');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Club slug is required');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);

    try {
      const club = await api.createClub({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        isPrivate: formData.isPrivate,
        avatarUrl: formData.avatarUrl || undefined,
        coverUrl: formData.coverUrl || undefined,
      });

      if (onClubCreated) {
        onClubCreated(club.slug);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create club');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Club</h2>

      <form onSubmit={handleSubmit}>
        {/* Club Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Club Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Virginia Tobacco Enthusiasts"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Club Slug */}
        <div className="mb-4">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Club URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 text-sm mr-2">/clubs/</span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="virginia-tobacco-enthusiasts"
              pattern="[a-z0-9-]+"
              disabled={isSubmitting}
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="What's your club about?"
            disabled={isSubmitting}
          />
        </div>

        {/* Avatar URL */}
        <div className="mb-4">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Club Avatar URL
          </label>
          <input
            type="url"
            id="avatarUrl"
            value={formData.avatarUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
            disabled={isSubmitting}
          />
        </div>

        {/* Cover URL */}
        <div className="mb-4">
          <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Photo URL
          </label>
          <input
            type="url"
            id="coverUrl"
            value={formData.coverUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://example.com/cover.jpg"
            disabled={isSubmitting}
          />
        </div>

        {/* Privacy Toggle */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this club private (requires invitation to join)
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.slug}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Club'}
          </button>
        </div>
      </form>
    </div>
  );
}
