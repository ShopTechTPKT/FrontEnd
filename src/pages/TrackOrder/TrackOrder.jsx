import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getOrderTracking } from "../../apis/orderApi";
import useOrderTracking from "../../hooks/useOrderTracking";

const STATUS_STEPS = [
  "PENDING",
  "PROCESSING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const STATUS_LABELS = {
  PENDING: "Đã đặt",
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  RETURNED: "Đã trả",
};

const parseOrderId = (input) => {
  const digits = String(input || "").match(/\d+/g);
  if (!digits?.length) return null;
  return Number(digits.join(""));
};

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id ?? user?.customerId ?? user?.customerID ?? null;
  } catch {
    return null;
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("vi-VN");
};

const TrackOrder = () => {
  const { t } = useTranslation();
  const [orderInput, setOrderInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const { latestEvent, timeline, connected, hasRecentUpdate } =
    useOrderTracking(activeOrderId);

  const currentStatus = latestEvent?.status || trackingData?.status || "PENDING";
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);

  const mergedTimeline = useMemo(() => {
    const initial = [];
    if (trackingData?.createdDate) {
      initial.push({
        status: "PENDING",
        updatedAt: trackingData.createdDate,
        message: "Đơn hàng đã được tạo",
      });
    }
    if (trackingData?.status && trackingData.status !== "PENDING") {
      initial.push({
        status: trackingData.status,
        updatedAt: trackingData.shippedDate || trackingData.createdDate,
        message: trackingData.trackingStatus || "",
      });
    }
    return [...initial, ...timeline];
  }, [timeline, trackingData]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    const userId = getCurrentUserId();
    const orderId = parseOrderId(orderInput);

    if (!userId) {
      setError("Vui lòng đăng nhập để theo dõi đơn hàng.");
      return;
    }
    if (!orderId) {
      setError("Mã đơn hàng không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const response = await getOrderTracking(userId, orderId);
      const payload = response?.DT || response?.data?.DT || response?.result || response;
      if (!payload || payload.orderId == null) {
        throw new Error("Không tìm thấy dữ liệu đơn hàng.");
      }
      setTrackingData(payload);
      setActiveOrderId(payload.orderId);
    } catch (err) {
      const message =
        err?.response?.data?.EM ||
        err?.response?.data?.message ||
        "Không thể tải thông tin đơn hàng.";
      setTrackingData(null);
      setActiveOrderId(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-5xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("order.track_your_order") || "Theo dõi đơn hàng"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Nhập mã đơn hàng để nhận cập nhật trạng thái theo thời gian thực.
        </p>

        <form
          onSubmit={handleTrack}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder={t("order.eg_ord2025123456") || "VD: ORD-2025-123"}
              className="h-11 flex-1 rounded-lg border border-gray-200 px-4 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-lg bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
            >
              {loading ? "Đang kiểm tra..." : "Theo dõi"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>

        {trackingData && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn</p>
                  <p className="text-xl font-bold text-gray-900">
                    #{trackingData.orderId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Trạng thái hiện tại</p>
                  <p className="text-lg font-semibold text-violet-700">
                    {STATUS_LABELS[currentStatus] || currentStatus}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {connected ? "Realtime connected" : "Realtime reconnecting"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-500">Địa chỉ giao:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {trackingData.deliveryAddress || "-"}
                  </span>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-500">Dự kiến giao:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {formatDateTime(trackingData.estimatedDeliveryDate)}
                  </span>
                </div>
              </div>

              {hasRecentUpdate && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Vừa cập nhật
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Timeline đơn hàng
              </h2>
              <div className="space-y-3">
                {STATUS_STEPS.map((step, idx) => {
                  const completed =
                    currentStepIndex >= 0
                      ? idx <= currentStepIndex
                      : step === currentStatus;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-full border flex items-center justify-center ${
                          completed
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-3.5 w-3.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            completed ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {mergedTimeline.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Lịch sử cập nhật
                </h2>
                <div className="space-y-3">
                  {mergedTimeline.map((event, idx) => (
                    <div
                      key={`${event.status}-${event.updatedAt}-${idx}`}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {STATUS_LABELS[event.status] || event.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(event.updatedAt)}
                      </p>
                      {event.message && (
                        <p className="mt-1 text-xs text-gray-600">{event.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
