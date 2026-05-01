/**
 * ProductCardSkeleton — Shimmer loading placeholder matching ProductCard dimensions.
 * Uses a moving gradient shimmer for premium feel.
 */
export default function ProductCardSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Image placeholder */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>

          <div className="p-3.5 space-y-2.5">
            {/* Rating row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-3 h-3 rounded-sm bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-shimmer" />
                  </div>
                ))}
              </div>
              <div className="h-2.5 w-10 rounded-full bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            </div>

            {/* Title lines */}
            <div className="space-y-1.5">
              <div className="h-3.5 rounded-full bg-gray-100 w-full relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
              <div className="h-3 rounded-full bg-gray-100 w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 bg-violet-100/80 rounded-full w-24 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

