import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

export default function ClubCardSkeleton() {
  return (
    <Card padding="none">
      {/* Cover */}
      <Skeleton variant="rectangular" height={128} className="rounded-t-lg rounded-b-none" />

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-3 -mt-16 mb-4">
          <Skeleton variant="circular" width={64} height={64} className="border-4 border-white" />
          <div className="mt-12 flex-1 space-y-2">
            <Skeleton width="60%" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Skeleton width="100%" />
          <Skeleton width="80%" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton width={80} />
          <Skeleton width={60} height={32} />
        </div>
      </div>
    </Card>
  );
}
