import { useState, useEffect } from 'react';
import { api, Review } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import CreateReviewModal from '../components/CreateReviewModal';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    loadReviews();
    loadCurrentUser();
  }, [categoryFilter]);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      // User not logged in
      setCurrentUser(null);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReviews({
        ...(categoryFilter && { category: categoryFilter }),
        limit: 50,
      });
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadReviews}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviews</h1>
        {currentUser && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-4 py-2 rounded-lg font-medium ${
              categoryFilter === ''
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter('PIPE_TOBACCO')}
            className={`px-4 py-2 rounded-lg font-medium ${
              categoryFilter === 'PIPE_TOBACCO'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pipe Tobacco
          </button>
          <button
            onClick={() => setCategoryFilter('CIGAR')}
            className={`px-4 py-2 rounded-lg font-medium ${
              categoryFilter === 'CIGAR'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cigars
          </button>
          <button
            onClick={() => setCategoryFilter('PIPE')}
            className={`px-4 py-2 rounded-lg font-medium ${
              categoryFilter === 'PIPE'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pipes
          </button>
          <button
            onClick={() => setCategoryFilter('ACCESSORY')}
            className={`px-4 py-2 rounded-lg font-medium ${
              categoryFilter === 'ACCESSORY'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accessories
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <img
            src="/reviews.png"
            alt="star"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
          <p className="text-gray-600">
            Be the first to share your thoughts on your favorite products!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => handleDeleteReview(review.id)}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}

      {/* Create Review Modal */}
      <CreateReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewCreated={loadReviews}
      />
    </div>
  );
}
