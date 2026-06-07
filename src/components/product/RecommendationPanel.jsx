import { useNavigate } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";

export default function RecommendationPanel({
  title = "Có thể bạn thích",
  products = [],
  loading = false,
}) {
  const navigate = useNavigate();

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-48 shrink-0 rounded-xl border border-gray-100 p-3"
            >
              <div className="h-28 w-full animate-pulse rounded-lg bg-gray-100" />
              <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {products.map((item) => (
            <button
              key={item.productID}
              onClick={() => navigate(`/product/${item.productID}/productAbout`)}
              className="w-48 shrink-0 rounded-xl border border-gray-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex h-28 items-center justify-center rounded-lg bg-gray-50">
                <img
                  src={item.image || "/images/placeholder.png"}
                  alt={item.productName}
                  className="max-h-24 max-w-full object-contain"
                />
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-medium text-gray-800">
                {item.productName}
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-700">
                {formatCurrency(item.price || 0)}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
