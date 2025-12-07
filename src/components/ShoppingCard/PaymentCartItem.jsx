import React from "react";
import { useTranslation } from "react-i18next";

const PaymentCartItem = ({ item }) => {
  const { t } = useTranslation();

  const formatCurrency = value =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const itemTotal = (item.price || item.unitPrice || 0) * (item.quantity || 0);
  const imageUrl =
    item.image ||
    item.imageUrl ||
    item.product?.imageUrl ||
    item.product?.image ||
    "/images/placeholder.png";
  const productName =
    item.productName || item.name || item.product?.name || "Product";

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover rounded-md"
          onError={e => {
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {productName}
        </h3>

        <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
          <span>
            {t("payment.thank_you.quantity")}:{" "}
            <span className="font-medium">{item.quantity || 0}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            {formatCurrency(item.price || item.unitPrice || 0)} /{" "}
            {t("payment.thank_you.item")}
          </span>
        </div>
      </div>

      {/* Item Total */}
      <div className="flex-shrink-0 text-right">
        <p className="text-lg font-bold text-indigo-600">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    </div>
  );
};

export default PaymentCartItem;
