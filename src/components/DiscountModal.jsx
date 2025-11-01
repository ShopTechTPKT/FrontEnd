import { useTranslation } from "react-i18next";

function DiscountModal({
  isOpen,
  onClose,
  vouchers,
  onSelectVoucher,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        style={{ maxHeight: "85vh", height: "600px" }}
      >
        {/* Header với nút Close rõ ràng */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("common.discount_vouchers")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={t("account.close")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nội dung modal với scroll */}
        <div className="h-[calc(100%-50px)] flex flex-col">
          {/* Available Vouchers */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("common.available_vouchers")}
            </h3>

            {vouchers.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">
                {t("common.no_vouchers_available")}
              </p>
            ) : (
              <div className="space-y-3 pr-2">
                {vouchers.map((voucher, index) => {
                  const endDate = voucher.endDate
                    ? new Date(voucher.endDate)
                    : null;
                  const isExpired = endDate ? endDate < new Date() : false;
                  const isPercentage = voucher.type === "PERCENTAGE";
                  const discountRate = voucher.discountRate || 0;
                  const discountValue = isPercentage
                    ? `${(discountRate * 100).toFixed(0)}%`
                    : new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(discountRate);

                  return (
                    <div
                      key={voucher.id || voucher.discountId || voucher.name || `voucher-${index}`}
                      className={`relative border rounded-lg overflow-hidden transition-all ${
                        isExpired
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-200 bg-white hover:border-purple-950 hover:shadow-md cursor-pointer"
                      }`}
                      onClick={
                        !isExpired
                          ? () => onSelectVoucher(voucher.name)
                          : undefined
                      }
                    >
                      {/* Ribbon góc */}
                      {!isExpired && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-gray-900 to-purple-950 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                          {isPercentage
                            ? `${(voucher.discountRate * 100).toFixed(0)}%`
                            : "GIẢM GIÁ"}
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Ảnh sản phẩm hoặc Icon giảm giá */}
                          {voucher.imageUrl ? (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={voucher.imageUrl}
                                alt={voucher.productName || voucher.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                                isExpired
                                  ? "bg-gray-200"
                                  : "bg-gradient-to-br from-gray-900 to-purple-950"
                              }`}
                            >
                              <span className="text-white font-bold text-lg">
                                {isPercentage
                                  ? `${(discountRate * 100).toFixed(0)}%`
                                  : "VND"}
                              </span>
                            </div>
                          )}

                          {/* Nội dung */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-bold text-base mb-1 truncate ${
                                isExpired ? "text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {voucher.name}
                            </h4>

                            {/* Tên sản phẩm */}
                            {voucher.productName && (
                              <p className="text-xs text-purple-950 font-medium mb-1 truncate">
                                {voucher.productName}
                              </p>
                            )}

                            <p
                              className={`text-sm mb-2 line-clamp-2 ${
                                isExpired ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {voucher.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs flex-wrap">
                              <span
                                className={`flex items-center gap-1 ${
                                  isExpired
                                    ? "text-gray-400"
                                    : "text-purple-950 font-semibold"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                  />
                                </svg>
                                Giảm {discountValue}
                              </span>

                              {voucher.point && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    isExpired
                                      ? "text-gray-400"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                  </svg>
                                  {voucher.point} điểm
                                </span>
                              )}

                              <span
                                className={`flex items-center gap-1 ${
                                  isExpired ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {endDate
                                  ? endDate.toLocaleDateString("vi-VN")
                                  : "Không giới hạn"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button Apply - Đơn giản hơn */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {isExpired ? (
                            <div className="flex items-center justify-center">
                              <span className="bg-gray-200 text-gray-500 text-xs px-4 py-2 rounded-md font-medium">
                                Hết hạn
                              </span>
                            </div>
                          ) : (
                            <button
                              className="w-full bg-gradient-to-r from-gray-900 to-purple-950 hover:from-purple-950 hover:to-gray-900 text-white text-sm py-2 px-4 rounded-md font-medium transition-all"
                              onClick={e => {
                                e.stopPropagation();
                                onSelectVoucher(voucher.name);
                              }}
                            >
                              Áp dụng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nút Close lớn hơn ở dưới cùng */}
          <div className="pt-4 mt-auto">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
            >
              {t("account.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscountModal;

