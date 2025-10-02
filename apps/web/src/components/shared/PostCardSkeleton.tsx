import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

export default function PostCardSkeleton() {
  return (
    <Card>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" />
          <Skeleton width="25%" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <Skeleton width="100%" />
        <Skeleton width="95%" />
        <Skeleton width="80%" />
      </div>

      {/* Image placeholder */}
      <Skeleton variant="rectangular" height={256} className="mb-4" />

      {/* Engagement bar */}
      <div className="flex items-center justify-between pt-4 border-t border-tobacco-200">
        <Skeleton width={60} />
        <Skeleton width={100} />
        <Skeleton width={60} />
      </div>
    </Card>
  );
}
