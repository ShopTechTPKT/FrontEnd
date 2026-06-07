import { useEffect, useState } from "react";
import { getOrdersByUser } from "../../../apis/orderApi";
import {
  createUserReturnRequest,
  getUserReturnRequests,
  uploadReturnRequestImages,
} from "../../../apis/returnsApi";
import notify from "../../../utils/notify";
import { RotateCcw, AlertTriangle, FileText, Camera, CheckCircle2, History } from "lucide-react";

const defaultForm = {
  orderId: "",
  reason: "",
  description: "",
};

export default function ReturnRequestTab({ userId }) {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    try {
      const [userOrders, userRequests] = await Promise.all([
        getOrdersByUser(userId),
        getUserReturnRequests(userId),
      ]);
      setOrders(Array.isArray(userOrders) ? userOrders : []);
      setRequests(userRequests);
    } catch (error) {
      console.error("Failed to load return request data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.reason.trim()) {
      notify.error("Vui lòng chọn đơn hàng và nhập lý do đổi trả.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createUserReturnRequest({
        userId,
        orderId: Number(form.orderId),
        reason: form.reason.trim(),
        description: form.description.trim(),
      });

      if (files.length > 0 && created?.id) {
        await uploadReturnRequestImages(created.id, files);
      }

      notify.success("Đã gửi yêu cầu đổi trả hàng thành công.");
      setForm(defaultForm);
      setFiles([]);
      await loadData();
    } catch (error) {
      console.error("Submit return request failed:", error);
      notify.error("Không thể gửi yêu cầu đổi trả lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
      <div className="mb-6 border-b border-gray-50 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <RotateCcw className="h-5.5 w-5.5 text-indigo-600" />
          <span>Yêu cầu Đổi trả sản phẩm</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Hỗ trợ khách hàng tự tạo yêu cầu đổi trả sản phẩm bị lỗi phần cứng hoặc sai quy cách đóng gói trong thời gian bảo hành.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Chọn Đơn hàng *</label>
            <select
              value={form.orderId}
              onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
            >
              <option value="">-- Chọn đơn hàng để đổi trả --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Đơn #{order.id} - Trạng thái: {order.status || "Chờ xử lý"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Lý do đổi trả *</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
              placeholder="VD: Sản phẩm bị móp méo, Lỗi RAM..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mô tả chi tiết tình trạng hàng hóa</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 min-h-24"
            placeholder="Mô tả cụ thể biểu hiện lỗi hoặc sự cố của thiết bị để kỹ thuật viên hỗ trợ nhanh nhất..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Đính kèm ảnh minh chứng sản phẩm lỗi</label>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 hover:bg-gray-50/50 transition-all dark:border-gray-800">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Camera className="mx-auto h-6 w-6 text-gray-400" />
              <p className="mt-1 text-xs font-medium text-gray-600">Chọn hoặc Kéo thả nhiều ảnh minh chứng</p>
              <p className="text-[10px] text-gray-400">Chấp nhận định dạng file hình ảnh phổ biến (.png, .jpg)</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-medium">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 transition-all disabled:opacity-60"
        >
          <span>{submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đổi trả hàng"}</span>
        </button>
      </form>

      {/* Lịch sử yêu cầu */}
      <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-600" />
          <span>Lịch sử gửi yêu cầu đổi trả</span>
        </h4>
        <div className="space-y-3">
          {requests.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">Bạn chưa có yêu cầu đổi trả nào được ghi nhận.</p>
          )}
          {requests.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-50 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/20">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Yêu cầu đổi trả #{item.id} - Đơn hàng #{item.orderId}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Lý do: <span className="font-medium text-gray-600 dark:text-gray-300">{item.reason}</span></p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                    item.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-amber-50 text-amber-700 animate-pulse"
                  }`}
                >
                  {item.status || "PENDING"}
                </span>
              </div>
              {item.adminNote && (
                <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50/50 p-2.5 text-xs text-amber-800 border border-amber-100/50 dark:bg-amber-950/15 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span><strong>Ghi chú từ quản trị viên:</strong> {item.adminNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
