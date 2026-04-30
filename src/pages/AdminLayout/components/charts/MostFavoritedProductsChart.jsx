import React from "react";
import { useTranslation } from "react-i18next";

export default function MostFavoritedProductsChart({ data, darkMode }) {
  const { t } = useTranslation("translation");
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized.slice(0, 8);

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="flex-grow space-y-1 overflow-y-auto">
        {entries.length > 0 ? (
          entries.map((item, i) => {
            const productId = Array.isArray(item) ? item[0] : item.productId || 0;
            const productName = Array.isArray(item) ? item[1] : item.productName || t("admin.unknown");
            const favoriteCount = Array.isArray(item) ? item[2] : item.favoriteCount || item.count || 0;

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-md ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 flex-shrink-0 ${
                    i === 0 ? "bg-pink-500" : i === 1 ? "bg-violet-400" : i === 2 ? "bg-red-600" : "bg-indigo-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`} title={productName}>
                      {productName}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ❤️ {favoriteCount} {t("admin.favorite_count")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    ID: {productId}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">{t("admin.no_data_text")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
