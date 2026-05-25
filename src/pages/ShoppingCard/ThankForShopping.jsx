import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Check,
  Package,
  ChevronRight,
  Truck,
  XCircle,
  ReceiptText,
  CalendarClock,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCart } from "../../utils/redux/cartSlice";
import { useTranslation } from "react-i18next";
import {
  createOrderWithDetails,
  updatePlaysAllowedAfterOrder,
} from "../../apis/orderApi";
import notify from "../../utils/notify";
import { redeemLoyaltyPoints } from "../../apis/loyaltyApi";
import { confirmPaymentTransaction } from "../../apis/paymentGatewayApi";

const ONLINE_PAYMENT_METHODS = new Set([
  "VNPAY",
  "MOMO",
  "ZALOPAY",
  "ONLINE_BANKING",
  "BANK_TRANSFER",
]);

const firstNonBlank = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
};

const hasGatewayCallbackSignal = params => {
  return Boolean(
    firstNonBlank(
      params.get("transactionId"),
      params.get("gateway"),
      params.get("vnp_ResponseCode"),
      params.get("responseCode"),
      params.get("code"),
      params.get("resultCode"),
      params.get("return_code"),
      params.get("returnCode"),
      params.get("status")
    )
  );
};

const resolveResultFromQuery = params => {
  const explicitStatus = firstNonBlank(params.get("status"), params.get("result")).toUpperCase();
  let status = "PENDING";

  if (["SUCCESS", "OK", "PAID"].includes(explicitStatus)) {
    status = "SUCCESS";
  } else if (["FAILED", "FAIL", "ERROR"].includes(explicitStatus)) {
    status = "FAILED";
  } else if (["CANCELLED", "CANCELED"].includes(explicitStatus)) {
    status = "CANCELLED";
  } else {
    const vnpCode = firstNonBlank(
      params.get("vnp_ResponseCode"),
      params.get("responseCode"),
      params.get("code")
    );
    const momoCode = firstNonBlank(params.get("resultCode"));
    const zaloCode = firstNonBlank(params.get("return_code"), params.get("returnCode"));

    if (vnpCode) {
      status = vnpCode === "00" ? "SUCCESS" : "FAILED";
    } else if (momoCode) {
      status = momoCode === "0" ? "SUCCESS" : "FAILED";
    } else if (zaloCode) {
      status = zaloCode === "1" ? "SUCCESS" : "FAILED";
    }
  }

  const isCOD = !hasGatewayCallbackSignal(params);

  const vnpAmount = firstNonBlank(params.get("vnp_Amount"));
  let amount = 0;
  if (vnpAmount) {
    amount = (Number(vnpAmount) || 0) / 100;
  } else {
    const rawAmount = firstNonBlank(
      params.get("amount"),
      params.get("transAmount"),
      params.get("zp_trans_amount")
    );
    const parsedAmount = Number(rawAmount) || 0;
    if (rawAmount && params.get("gateway") && params.get("code")) {
      amount = parsedAmount / 100;
    } else {
      amount = parsedAmount;
    }
  }

  const success = isCOD || status === "SUCCESS";
  const message = success
    ? isCOD
      ? "Order placed successfully! Please prepare cash for delivery."
      : "Payment successful!"
    : status === "CANCELLED"
    ? "Payment cancelled."
    : "Payment failed or cancelled.";

  return {
    status,
    success,
    isCOD,
    amount,
    code: firstNonBlank(
      params.get("vnp_ResponseCode"),
      params.get("responseCode"),
      params.get("code"),
      params.get("resultCode"),
      params.get("return_code"),
      params.get("returnCode"),
      params.get("status")
    ),
    transactionId: firstNonBlank(params.get("transactionId")),
    message,
  };
};

export default function ThankYouPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [result, setResult] = useState({});
  const [orderNumber, setOrderNumber] = useState("N/A");
  const [countdown, setCountdown] = useState(30);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false); // â­ Flag ngÄƒn duplicate
  const [displayData, setDisplayData] = useState(null); // Chuyá»ƒn thÃ nh state

  // Helper: láº¥y userId tá»« localStorage
  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;
    } catch (e) {
      console.error("Lá»—i khi Ä‘á»c user tá»« localStorage:", e);
      return null;
    }
  };

  // Load displayData vÃ  orderID cho COD
  useEffect(() => {
    try {
      const data = localStorage.getItem("orderDisplay");
      if (data) {
        setDisplayData(JSON.parse(data));
      }

      if (!hasGatewayCallbackSignal(searchParams)) {
        const lastOrderId = localStorage.getItem("lastOrderId");
        if (lastOrderId) {
          setOrderNumber(lastOrderId);
        }
      }
    } catch (e) {
      console.error("Lá»—i khi Ä‘á»c orderDisplay:", e);
    }
  }, [searchParams]);

  const subtotal = Number(displayData?.subtotal || 0);
  const tax = Number(displayData?.tax || 0);
  const shippingCost = Number(displayData?.shippingCost || 0);
  const discountAmount = Number(displayData?.discountAmount || 0);
  const discount = discountAmount > 0
    ? discountAmount * -1
    : displayData?.discount
    ? (Number(subtotal) + Number(tax) + Number(shippingCost)) * Number(displayData.discount) * -1
    : 0;
  const total = Number(displayData?.total || 0);
  const orderItems = Array.isArray(displayData?.items) ? displayData.items : [];
  const paymentMethodCode = String(displayData?.paymentMethod || "").toUpperCase();
  const isOnlinePayment = ONLINE_PAYMENT_METHODS.has(paymentMethodCode);

  // Xá»­ lÃ½ callback thanh toÃ¡n vÃ  táº¡o order sau khi thanh toÃ¡n thÃ nh cÃ´ng
  useEffect(() => {
    const resolved = resolveResultFromQuery(searchParams);
    const {
      code,
      amount,
      success: paymentSuccess,
      isCOD,
      status,
      transactionId,
      message,
    } = resolved;

    setResult({
      code,
      amount,
      message,
      success: paymentSuccess,
      status,
    });
    if (!paymentSuccess && transactionId) {
      confirmPaymentTransaction(transactionId, {
        status: status === "CANCELLED" ? "CANCELLED" : "FAILED",
        gatewayResponse: searchParams.toString(),
      }).catch((error) => console.error("confirm failed payment error:", error));
    }

    // â­ CLEAR CART NGAY khi thanh toÃ¡n thÃ nh cÃ´ng (khÃ´ng Ä‘á»£i táº¡o order)
    if (paymentSuccess && !orderCreated) {
      const userId = getCurrentUserId();


      // Clear cart trong Redux
      dispatch(clearCart(userId))
        .then(result => {


          // Clear localStorage Ä‘á»ƒ Ä‘áº£m báº£o
          localStorage.removeItem("guestCart");

          // Force reload cart Ä‘á»ƒ cáº­p nháº­t UI
          window.dispatchEvent(new Event("cartCleared"));
        })
        .catch(err => {
          console.error("âŒ Failed to clear cart:", err);
        });
    }

    // Táº¡o order cho cÃ¡c giao dá»‹ch online thÃ nh cÃ´ng
    // â­ Check orderCreated flag vÃ  sessionStorage lock Ä‘á»ƒ trÃ¡nh duplicate
    const orderLock = sessionStorage.getItem("orderCreationLock");

    const shouldCreateOnlineOrder = paymentSuccess && !isCOD;
    if (shouldCreateOnlineOrder && !isCreatingOrder && !orderCreated && !orderLock) {
      setIsCreatingOrder(true);
      setOrderCreated(true); // â­ ÄÃ¡nh dáº¥u Ä‘Ã£ táº¡o order
      sessionStorage.setItem("orderCreationLock", "true"); // â­ Lock táº¡o order

      const pendingOrder = sessionStorage.getItem("pendingOrder");
      if (!pendingOrder) {

        setIsCreatingOrder(false);
        sessionStorage.removeItem("orderCreationLock");
        return;
      }

      const orderPayload = JSON.parse(pendingOrder);

      // Láº¥y userId trÆ°á»›c khi táº¡o order
      const userId = getCurrentUserId();

      // Gá»i API táº¡o order
      createOrderWithDetails(orderPayload)
        .then(response => {

          const createdOrder = response.data || response;
          setOrderNumber(createdOrder.orderID || createdOrder.id || "N/A");

          const savedLoyalty = JSON.parse(
            localStorage.getItem("loyaltyRedemption") || "{}"
          );
          if ((Number(savedLoyalty?.points) || 0) > 0 && userId) {
            redeemLoyaltyPoints({
              userId: Number(userId),
              points: Number(savedLoyalty.points),
              orderId: Number(createdOrder.orderID || createdOrder.id),
            })
              .then(() => localStorage.removeItem("loyaltyRedemption"))
              .catch((error) =>
                console.error("Lá»—i redeem loyalty points:", error)
              );
          }

          // LÆ°u orderID vÃ o localStorage Ä‘á»ƒ dÃ¹ng sau
          localStorage.setItem(
            "lastOrderId",
            createdOrder.orderID || createdOrder.id
          );

          if (transactionId) {
            confirmPaymentTransaction(transactionId, {
              status: "SUCCESS",
              orderId: Number(createdOrder.orderID || createdOrder.id),
              gatewayResponse: searchParams.toString(),
            }).catch((error) => console.error("confirm transaction error:", error));
          }

          // â­ Cart Ä‘Ã£ Ä‘Æ°á»£c clear á»Ÿ trÃªn rá»“i, khÃ´ng cáº§n clear láº¡i

          // â­ ThÃªm 3 lÆ°á»£t chÆ¡i cho user khi táº¡o order thÃ nh cÃ´ng
          updatePlaysAllowedAfterOrder(userId)
            .then(updatedUser => {
              // Update localStorage user
              if (updatedUser) {
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }
            })
            .catch(err => console.error("Failed to update plays:", err));

          // Clear pendingOrder vÃ  lock (giá»¯ orderDisplay Ä‘á»ƒ hiá»ƒn thá»‹)
          sessionStorage.removeItem("pendingOrder");
          sessionStorage.removeItem("orderCreationLock"); // â­ Remove lock

          notify.success(t("payment.thank_you.order_success"));
          setIsCreatingOrder(false);
        })
        .catch(error => {
          console.error("âŒ Failed to create order:", error);

          // Handle error codes
          const errorCode = error.response?.data?.code;
          const errorMessage = error.response?.data?.message || error.message;

          if (errorCode === 1302) {
            notify.error(t("payment.thank_you.stock_insufficient"), {
              autoClose: 7000,
            });
          } else if (errorCode === 1303) {
            notify.error(t("payment.thank_you.product_out_of_stock"), {
              autoClose: 7000,
            });
          } else if (errorCode === 1301) {
            notify.error(t("payment.thank_you.product_not_exist"), {
              autoClose: 7000,
            });
          } else {
            notify.error(
              `${t("payment.thank_you.order_failed")}: ${errorMessage}`,
              { autoClose: 7000 }
            );
          }

          setIsCreatingOrder(false);
          sessionStorage.removeItem("orderCreationLock"); // â­ Remove lock on error
          // Redirect vá» cart sau 3 giÃ¢y
          setTimeout(() => {
            navigate("/shopping_card");
          }, 3000);
        });
    }
  }, [searchParams, isCreatingOrder, orderCreated, dispatch, navigate]);

  // Countdown logic vá»›i cleanup khi redirect
  useEffect(() => {
    if (result.success && !isCreatingOrder && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && result.success && !isCreatingOrder) {
      // Clear localStorage trÆ°á»›c khi redirect
      localStorage.removeItem("lastOrderId");
      localStorage.removeItem("orderDisplay");
      sessionStorage.removeItem("pendingOrder");

      navigate("/");
    }
  }, [countdown, result.success, isCreatingOrder, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-)]/40 via-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-500">
            {t("payment.thank_you.order_number")}
            {orderNumber}
            {isCreatingOrder && (
              <span className="ml-2 text-yellow-600">
                ({t("payment.thank_you.creating_order")})
              </span>
            )}
          </div>
        </div>

        {/* Payment Result Message */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className={`p-3 rounded-full mb-4 ${
                result.success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.success ? (
                <Check className="text-green-600 w-8 h-8" />
              ) : (
                <XCircle className="text-red-600 w-8 h-8" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {result.success
                ? isCreatingOrder
                  ? t("payment.thank_you.processing_order")
                  : t("payment.thank_you.thank_you")
                : t("payment.thank_you.payment_failed")}
            </h1>
            {isOnlinePayment && (
              <p className="text-lg text-gray-600 max-w-lg">{result.message}</p>
            )}

            {result.amount > 0 &&
              (isOnlinePayment ? (
                result.success &&
                !isCreatingOrder && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t("payment.thank_you.paid_amount")}{" "}
                    <strong>{result.amount.toLocaleString()} VND</strong>
                  </p>
                )
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  {t("payment.thank_you.prepare_cash")}{" "}
                  <strong>{result.amount.toLocaleString()} VND</strong>{" "}
                  {t("payment.thank_you.for_payment")}
                </p>
              ))}
          </div>

          {result.success && !isCreatingOrder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border border-[var(--color-primary-)] bg-[var(--color-primary-)]/70 p-4">
                  <p className="text-xs text-[var(--color-primary-)]">{t("payment.thank_you.order_number")}</p>
                  <p className="text-sm font-semibold text-[var(--color-primary-)] mt-1">#{orderNumber}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs text-emerald-700">{t("order.total") || "Tá»•ng thanh toÃ¡n"}</p>
                  <p className="text-sm font-semibold text-emerald-800 mt-1">
                    {Number(total || result.amount || 0).toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                  <p className="text-xs text-gray-600">ETA</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {t("payment.thank_you.prepare_delivery")}
                  </p>
                </div>
              </div>

              {/* Order Status */}
              <div className="border-t border-b border-gray-200 py-6 my-6">
                <div className="relative max-w-2xl mx-auto px-4">
                  <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 z-0"></div>
                  <div className="absolute top-5 left-10 right-1/2 h-1 bg-[var(--color-primary-)] z-10"></div>

                  <div className="relative z-20 flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-[var(--color-primary-)] rounded-full p-2 mb-2 z-10">
                        <Check className="text-white w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {t("payment.thank_you.order_placed")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-[var(--color-primary-)] rounded-full p-2 mb-2 z-10">
                        <Package className="text-[var(--color-primary-)] w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        {t("payment.thank_you.processing")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-200 rounded-full p-2 mb-2 z-10">
                        <Truck className="text-gray-400 w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        {t("payment.thank_you.shipped")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {orderItems.length > 0 && (
                <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
                  <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-[var(--color-primary-)]" />
                    {t("cart.order_summary") || "TÃ³m táº¯t Ä‘Æ¡n hÃ ng"}
                  </h2>
                  <div className="space-y-3 mb-5">
                    {orderItems.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.productName || item.name}
                          </p>
                          <p className="text-xs text-gray-500">x{item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {(Number(item.totalPrice) || Number(item.price) || 0).toLocaleString("vi-VN")} VND
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("order.subtotal")}</span>
                      <span className="font-medium">{subtotal.toLocaleString("vi-VN")} VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("payment.checkout.shipping")}</span>
                      <span className="font-medium">{shippingCost.toLocaleString("vi-VN")} VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("order.tax_10")}</span>
                      <span className="font-medium">{tax.toLocaleString("vi-VN")} VND</span>
                    </div>
                    {discount !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-emerald-600">{t("cart.discount") || "Giáº£m giÃ¡"}</span>
                        <span className="font-semibold text-emerald-600">{discount.toLocaleString("vi-VN")} VND</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="font-semibold text-gray-800">{t("order.total")}</span>
                      <span className="font-bold text-[var(--color-primary-)]">{total.toLocaleString("vi-VN")} VND</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Next Steps (only if success) */}
        {result.success && !isCreatingOrder && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t("payment.thank_you.whats_next")}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-[var(--color-primary-)] p-2 rounded-full mr-4">
                  <CalendarClock className="text-[var(--color-primary-)] w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {t("payment.thank_you.track_order")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("payment.thank_you.track_order_desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[var(--color-primary-)] p-2 rounded-full mr-4">
                  <Package className="text-[var(--color-primary-)] w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {t("payment.thank_you.prepare_delivery")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("payment.thank_you.prepare_delivery_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redirect Notice */}
        {!isCreatingOrder && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t("payment.thank_you.redirecting")}{" "}
              <span className="font-medium text-[var(--color-primary-)]">{countdown}</span>{" "}
              {t("payment.thank_you.seconds")}
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[var(--color-primary-)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-)] transition-colors"
            >
              {t("payment.thank_you.continue_shopping")}
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
