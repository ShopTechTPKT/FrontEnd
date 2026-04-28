import React from "react";

/**
 * Skeleton — Composable loading placeholder.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />           // text line
 *   <Skeleton className="h-48 w-full" rounded /> // image block
 *   <Skeleton circle className="h-10 w-10" />    // avatar
 */

function Skeleton({ className = "", circle = false, rounded = false }) {
  return (
    <div
      className={[
        "animate-pulse bg-gray-200",
        circle ? "rounded-full" : rounded ? "rounded-xl" : "rounded-md",
        className,
      ].join(" ")}
    />
  );
}

/**
 * SkeletonGroup — Pre-built skeleton layouts for common patterns.
 */

/** Product card skeleton */
Skeleton.ProductCard = function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8" circle />
        </div>
      </div>
    </div>
  );
};

/** Product grid skeleton */
Skeleton.ProductGrid = function ProductGridSkeleton({ count = 8, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton.ProductCard key={idx} />
      ))}
    </div>
  );
};

/** Cart item skeleton */
Skeleton.CartItem = function CartItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="w-20 h-20 shrink-0" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
};

/** Text block skeleton */
Skeleton.TextBlock = function TextBlockSkeleton({ lines = 3 }) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-4 ${widths[idx % widths.length]}`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
