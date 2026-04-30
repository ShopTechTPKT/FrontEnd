import React from "react";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";

const PaymentCartItem = ({ item }) => {
  const { t } = useTranslation();


  const unit = Number(item.price || item.unitPrice || 0);
  const qty = Number(item.quantity) || 0;
  const itemTotal = unit * qty;
  const imageUrl =
    item.image ||
    item.imageUrl ||
    item.product?.imageUrl ||
    item.product?.image ||
    "/images/placeholder.png";
  const productName =
    item.productName || item.name || item.product?.name || "Product";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-100 sm:h-20 sm:w-20">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-contain"
          onError={e => {
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {productName}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span>
            {t("payment.thank_you.quantity")}:{" "}
            <span className="font-medium text-gray-700">{qty}</span>
          </span>
          <span className="hidden text-gray-300 sm:inline" aria-hidden>
            •
          </span>
          <span className="tabular-nums">
            {formatCurrency(unit)} / {t("payment.thank_you.item")}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-violet-700 tabular-nums sm:text-base">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    </div>
  );
};

export default PaymentCartItem;
