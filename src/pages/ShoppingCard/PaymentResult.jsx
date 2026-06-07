import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import path from "../../constant/path";
import { confirmPaymentTransaction } from "../../apis/paymentGatewayApi";

const mapQueryToStatus = (params) => {
  const rawStatus = (params.get("status") || params.get("result") || "").toUpperCase();
  if (["SUCCESS", "OK", "PAID"].includes(rawStatus)) return "SUCCESS";
  if (["FAILED", "FAIL", "ERROR"].includes(rawStatus)) return "FAILED";
  if (["CANCELLED", "CANCELED"].includes(rawStatus)) return "CANCELLED";

  const vnpCode =
    params.get("vnp_ResponseCode") ||
    params.get("responseCode") ||
    params.get("code");
  if (vnpCode) return vnpCode === "00" ? "SUCCESS" : "FAILED";

  const momoCode = params.get("resultCode");
  if (momoCode) return momoCode === "0" ? "SUCCESS" : "FAILED";

  const zaloCode = params.get("return_code") || params.get("returnCode");
  if (zaloCode) return zaloCode === "1" ? "SUCCESS" : "FAILED";

  return "PENDING";
};

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const transactionId = searchParams.get("transactionId");
  const gateway = (searchParams.get("gateway") || "PAYMENT").toUpperCase();
  const orderId = searchParams.get("orderId");
  const status = useMemo(() => mapQueryToStatus(searchParams), [searchParams]);

  useEffect(() => {
    if (!transactionId) return;
    const run = async () => {
      try {
        setLoading(true);
        const result = await confirmPaymentTransaction(transactionId, {
          status,
          orderId: orderId ? Number(orderId) : null,
          gatewayResponse: searchParams.toString(),
        });
        setConfirmed(result);
      } catch (e) {
        console.error("Payment confirm error:", e);
        setError(e?.response?.data?.message || "Không thể xác nhận giao dịch.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [transactionId, status, orderId, searchParams]);

  const finalStatus = (confirmed?.status || status || "PENDING").toUpperCase();
  const isSuccess = finalStatus === "SUCCESS";
  const isFailed = finalStatus === "FAILED" || finalStatus === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Kết quả thanh toán</h1>
        <p className="mt-1 text-sm text-gray-500">Cổng thanh toán: {gateway}</p>

        <div className="mt-5 rounded-xl border border-gray-200 p-4">
          {loading ? (
            <p className="text-sm text-gray-600">Đang xác nhận giao dịch...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <p className={`text-sm font-semibold ${isSuccess ? "text-emerald-600" : isFailed ? "text-red-600" : "text-amber-600"}`}>
                Trạng thái: {finalStatus}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Mã giao dịch: {transactionId || "N/A"}
              </p>
              {confirmed?.orderId && (
                <p className="mt-1 text-sm text-gray-600">Đơn hàng: #{confirmed.orderId}</p>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Link
            to="/userProfile?tab=my-orders"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Xem đơn hàng
          </Link>
          <Link
            to={path.home}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentResult;
