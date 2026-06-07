import React from "react";

const variantRound = {
  text: "rounded-md",
  circular: "rounded-full",
  rectangular: "rounded-none",
  rounded: "rounded-xl",
};

const animClass = {
  shimmer:
    "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-indigo-500/15 before:to-transparent",
  pulse: "animate-pulse",
  wave: "animate-shimmer",
};

function Skeleton({
  className = "",
  variant = "text",
  animation = "shimmer",
  circle = false,
  rounded = false,
}) {
  const v = circle ? "circular" : rounded ? "rounded" : variant;
  const round = variantRound[v] || variantRound.text;

  return (
    <div
      className={[
        "relative overflow-hidden bg-gray-200 dark:bg-gray-700",
        animClass[animation] || animClass.shimmer,
        round,
        className,
      ].join(" ")}
    />
  );
}

Skeleton.Text = function SkeletonText({ lines = 3, className = "" }) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} variant="text" className={`h-4 ${widths[idx % widths.length]}`} />
      ))}
    </div>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ className = "h-10 w-10" }) {
  return <Skeleton variant="circular" className={className} />;
};

Skeleton.Button = function SkeletonButton({ className = "h-10 w-24 rounded-[10px]" }) {
  return <Skeleton variant="rounded" className={className} />;
};

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="relative p-4 pb-0">
        <div className="absolute left-2 top-2 z-10 flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-52 w-full" variant="rounded" rounded />
      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-8/12" />
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

Skeleton.ProductCard = Skeleton.Card;

Skeleton.ProductGrid = function ProductGridSkeleton({ count = 8, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton.ProductCard key={idx} />
      ))}
    </div>
  );
};

Skeleton.CartItem = function CartItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="h-20 w-20 shrink-0" variant="rounded" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
};

Skeleton.TextBlock = Skeleton.Text;

export default Skeleton;
