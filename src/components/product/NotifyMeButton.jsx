import { useEffect, useState } from "react";
import notify from "../../utils/notify";
import {
  getStockAlertWaitingCount,
  subscribeStockAlert,
} from "../../apis/stockAlertApi";

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? parsed?.customerId ?? parsed?.customerID ?? null;
  } catch {
    return null;
  }
};

export default function NotifyMeButton({ productId, className = "" }) {
  const [submitting, setSubmitting] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    getStockAlertWaitingCount(productId)
      .then((count) => setWaitingCount(count))
      .catch(() => setWaitingCount(0));
  }, [productId]);

  const handleSubscribe = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      notify.warning("Vui lòng đăng nhập để nhận thông báo khi có hàng.");
      return;
    }

    try {
      setSubmitting(true);
      await subscribeStockAlert({ userId, productId });
      notify.success("Đăng ký thông báo thành công.");
      const latestCount = await getStockAlertWaitingCount(productId);
      setWaitingCount(latestCount);
    } catch (error) {
      notify.error("Không thể đăng ký thông báo. Vui lòng thử lại.");
      console.error("Stock alert subscribe error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={submitting || !productId}
        className="w-full rounded-lg border border-violet-200 bg-violet-50 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-60"
      >
        {submitting ? "Đang đăng ký..." : "Thông báo khi có hàng"}
      </button>
      <p className="text-xs text-gray-500">
        {waitingCount > 0
          ? `${waitingCount} người đang chờ sản phẩm này`
          : "Chưa có người đăng ký chờ"}
      </p>
    </div>
  );
}
