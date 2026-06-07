import formatCurrency from "../../utils/formatCurrency";

const getProductId = (item) =>
  Number(item?.product?.id ?? item?.product?.productID ?? item?.productId ?? 0);

const getProductName = (item) =>
  item?.product?.productName || item?.product?.name || "Sản phẩm";

const getProductImage = (item) =>
  item?.product?.image || item?.product?.imageUrl || "";

const getQuantity = (item) => Number(item?.quantity || 1);

export default function ProductBundlePanel({
  bundle,
  loading,
  onAddBundleToCart,
  adding,
}) {
  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-4 w-48 animate-pulse rounded bg-gray-100 mb-3" />
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded bg-gray-100" />
          <div className="h-14 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!bundle) return null;

  const items = Array.isArray(bundle.items) ? bundle.items : [];
  const savings = Math.max(0, Number(bundle.originalPrice || 0) - Number(bundle.bundlePrice || 0));

  return (
    <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-800">Mua theo bộ</p>
          <h3 className="text-lg font-bold text-gray-900">{bundle.name || "Combo tiết kiệm"}</h3>
          {bundle.description && (
            <p className="mt-1 text-sm text-gray-600">{bundle.description}</p>
          )}
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Tiết kiệm {formatCurrency(savings)}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={`${bundle.id}-${getProductId(item)}`}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
          >
            <img
              src={getProductImage(item)}
              alt={getProductName(item)}
              className="h-10 w-10 rounded object-cover bg-gray-50"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{getProductName(item)}</p>
              <p className="text-xs text-gray-500">x{getQuantity(item)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 line-through">{formatCurrency(bundle.originalPrice)}</p>
          <p className="text-lg font-bold text-indigo-700">{formatCurrency(bundle.bundlePrice)}</p>
        </div>
        <button
          type="button"
          onClick={() => onAddBundleToCart?.(bundle)}
          disabled={adding}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1 5h13M7 13 5.4 5M10 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Thêm cả bộ
        </button>
      </div>
    </div>
  );
}
