import Skeleton from "./Skeleton";

/**
 * ProductGridSkeleton — Backward-compatible wrapper.
 * Uses the new composable Skeleton system internally.
 */
function ProductGridSkeleton({ count = 8, className = "" }) {
  return <Skeleton.ProductGrid count={count} className={className} />;
}

export default ProductGridSkeleton;
