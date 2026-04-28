/**
 * ProductCardSkeleton — Shimmer loading placeholder matching ProductCard dimensions.
 * Shows pulsing animation while products are being fetched.
 */
export default function ProductCardSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
        >
          {/* Image placeholder */}
          <div className="aspect-square bg-gray-200" />
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
            {/* Price */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 bg-violet-100 rounded-full w-24" />
              <div className="h-3 bg-gray-200 rounded-full w-16" />
            </div>
            {/* Button bar */}
            <div className="flex gap-2 pt-2">
              <div className="h-9 bg-gray-200 rounded-lg flex-1" />
              <div className="h-9 w-9 bg-gray-200 rounded-lg" />
              <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
