/** Skeleton loading placeholder components */

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 animate-shimmer ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-lg animate-shimmer" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-1/3 h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card p-5 space-y-2">
      <div className="skeleton w-8 h-8 rounded-lg animate-shimmer" />
      <SkeletonLine className="w-16 h-7" />
      <SkeletonLine className="w-24 h-3" />
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
