import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Review } from '../services/api';
import ReportModal from './ReportModal';

interface ReviewCardProps {
  review: Review;
  onDelete?: () => void;
  currentUserId?: string;
}

export default function ReviewCard({ review, onDelete, currentUserId }: ReviewCardProps) {
  const isOwner = currentUserId === review.authorId;
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'PIPE_TOBACCO':
        return 'Pipe Tobacco';
      case 'CIGAR':
        return 'Cigar';
      case 'PIPE':
        return 'Pipe';
      case 'ACCESSORY':
        return 'Accessory';
      default:
        return category;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <img
            key={star}
            src="/reviews.png"
            alt="star"
            className={`h-5 w-5 ${star <= rating ? 'opacity-100' : 'opacity-30 grayscale'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/u/${review.author.username}`}>
            <img
              src={
                review.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${review.author.displayName || review.author.username}&size=40&background=ea580c&color=fff`
              }
              alt={review.author.displayName || review.author.username}
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/u/${review.author.username}`}
                className="font-medium text-gray-900 hover:text-orange-600"
              >
                {review.author.displayName || review.author.username}
              </Link>
              {review.author.isVerified && (
                <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Menu button (three dots) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-2 -m-1"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {isOwner && onDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Review
                </button>
              )}
              {currentUserId && !isOwner && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                  Report Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
          {getCategoryLabel(review.category)}
        </span>
        {review.club && (
          <Link
            to={`/clubs/${review.club.slug}`}
            className="ml-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            {review.club.name}
          </Link>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">{review.productName}</h3>
        {review.brand && <p className="text-sm text-gray-600">{review.brand}</p>}
      </div>

      {/* Rating */}
      <div className="mb-4">{renderStars(review.rating)}</div>

      {/* Review Title */}
      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

      {/* Review Content */}
      <p className="text-gray-700 whitespace-pre-wrap mb-4">{review.content}</p>

      {/* Image */}
      {review.imageUrl && (
        <div className="mb-4">
          <img
            src={review.imageUrl}
            alt={review.productName}
            loading="lazy"
            className="rounded-lg max-h-96 w-full object-cover"
          />
        </div>
      )}

      {/* Report Modal - Note: Reviews aren't directly reportable in schema yet,
          so we report the user as a workaround */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReportSubmitted={() => {
          alert('Thank you for your report. Our moderation team will review it shortly.');
        }}
        reportedUserId={review.authorId}
        reportType="user"
      />
    </div>
  );
}
