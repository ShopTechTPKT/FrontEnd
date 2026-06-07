import React, { useEffect, useState } from "react";
import { fetchUserPriceAlerts } from "../../../apis/aiApi";
import axiosInstance from "../../../custom/axios";
import formatCurrency from "../../../utils/formatCurrency";
import notify from "../../../utils/notify";
import { Bell, BellOff, Loader2, TrendingDown } from "lucide-react";

export default function PriceAlertsTab({ userId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadAlerts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await fetchUserPriceAlerts(userId);
      setAlerts(data || []);
    } catch (error) {
      console.error("Failed to fetch price alerts:", error);
      notify.error("Không thể tải danh sách báo động giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [userId]);

  const handleDeleteAlert = async (alertId) => {
    setProcessingId(alertId);
    try {
      await axiosInstance.delete(`/price-alerts/${alertId}`);
      notify.success("Đã xóa báo động giá thành công.");
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error("Failed to delete price alert:", error);
      notify.error("Không thể xóa báo động giá.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="profile-card flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-gray-500">Đang tải danh sách báo động giá...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="profile-card">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Báo động giá</h3>
        </div>
        <p className="text-xs text-gray-500">Nhận thông báo ngay khi sản phẩm yêu thích của bạn giảm xuống mức giá mong muốn.</p>
      </div>

      {alerts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {alerts.map((alert) => {
            const product = alert.product || {};
            const curPrice = product.unitPrice || product.price || 0;
            const target = alert.targetPrice || 0;
            const savings = curPrice - target;

            return (
              <div 
                key={alert.id} 
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={product.imageUrl || product.image || "/placeholder.svg"} 
                    alt={product.name || "Sản phẩm"} 
                    className="h-14 w-14 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">{product.name || "Sản phẩm"}</h4>
                    
                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs text-gray-400">Hiện tại:</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(curPrice)}</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs text-gray-400">Mục tiêu:</span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-500">{formatCurrency(target)}</span>
                    </div>

                    {savings > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <TrendingDown className="h-3 w-3" />
                        <span>Cần giảm thêm {formatCurrency(savings)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  disabled={processingId === alert.id}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-colors disabled:opacity-50"
                  title="Hủy báo động"
                >
                  {processingId === alert.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="profile-card flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Chưa có báo động giá nào được tạo</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Hãy truy cập trang chi tiết sản phẩm và nhập mức giá mong muốn để nhận thông báo.</p>
        </div>
      )}
    </div>
  );
}
