import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Club } from '../services/api';
import CreateClubForm from '../components/CreateClubForm';

export default function ClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await api.getClubs();
      setClubs(data);
    } catch (err) {
      setError('Failed to load clubs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleClubCreated = (slug: string) => {
    navigate(`/clubs/${slug}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading clubs...</div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <CreateClubForm
          onClubCreated={handleClubCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clubs</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 whitespace-nowrap text-sm sm:text-base"
        >
          Create Club
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchClubs}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Clubs List */}
      {clubs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No clubs yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Be the first to create a club for pipe tobacco and cigar enthusiasts!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Create the First Club
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start">
                {club.avatarUrl && (
                  <img
                    src={club.avatarUrl}
                    alt={club.name}
                    className="h-16 w-16 rounded-lg"
                  />
                )}
                <div className={club.avatarUrl ? 'ml-4' : ''}>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {club.name}
                    {club.isPrivate && (
                      <span className="ml-2 text-sm font-normal text-gray-500">🔒</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'} • {club._count.posts} {club._count.posts === 1 ? 'post' : 'posts'}
                  </p>
                  {club.description && (
                    <p className="text-gray-700 text-sm line-clamp-2">{club.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
