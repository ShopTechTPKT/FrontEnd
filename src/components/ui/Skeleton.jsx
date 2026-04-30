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
        "relative overflow-hidden bg-gray-200 dark:bg-gray-700",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-xs">
      <div className="relative p-4 pb-0">
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <Skeleton className="h-8 w-8" circle />
          <Skeleton className="h-8 w-8" circle />
        </div>
      </div>
      <Skeleton className="h-52 w-full" />
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-8/12" />
        <Skeleton className="h-3 w-7/12" />
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
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
