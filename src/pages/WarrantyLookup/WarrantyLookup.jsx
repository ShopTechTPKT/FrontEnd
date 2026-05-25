import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import BarcodeScanner from "../../components/header/BarcodeScanner";
import { activateWarranty, lookupWarranty } from "../../apis/warrantyApi";
import notify from "../../utils/notify";
import { ShieldCheck, ShieldAlert, Scan, Calendar, Check, Search, Keyboard } from "lucide-react";

export default function WarrantyLookup() {
  const { user } = useContext(UserContext);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activateForm, setActivateForm] = useState({
    productId: "",
    orderId: "",
    serialNumber: "",
  });

  const userId = user?.id || user?.userId || user?.customerId || null;

  const onLookup = async (inputCode = code) => {
    if (!inputCode?.trim()) {
      notify.error("Vui lòng nhập mã bảo hành hoặc mã đơn hàng.");
      return;
    }
    setLoading(true);
    try {
      const data = await lookupWarranty(inputCode.trim());
      setResult(data);
    } catch (error) {
      setResult(null);
      notify.error(error?.response?.data?.message || "Không tìm thấy thông tin bảo hành.");
    } finally {
      setLoading(false);
    }
  };

  const onActivate = async () => {
    if (!userId) {
      notify.error("Vui lòng đăng nhập để kích hoạt bảo hành.");
      return;
    }
    if (!activateForm.productId || (!activateForm.orderId && !activateForm.serialNumber)) {
      notify.error("Vui lòng nhập Product ID và số Serial hoặc Mã Đơn hàng.");
      return;
    }
    try {
      const res = await activateWarranty({
        userId,
        productId: Number(activateForm.productId),
        orderId: activateForm.orderId ? Number(activateForm.orderId) : null,
        serialNumber: activateForm.serialNumber || null,
      });
      notify.success(res?.message || "Kích hoạt bảo hành thành công!");
      if (activateForm.serialNumber) {
        setCode(activateForm.serialNumber);
        onLookup(activateForm.serialNumber);
      }
    } catch (error) {
      notify.error(error?.response?.data?.message || "Kích hoạt bảo hành thất bại.");
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 animate-fadeIn">
      {/* Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-bl-full pointer-events-none" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Chính Hãng 100%</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Tra cứu & Kích hoạt Bảo hành</h1>
          <p className="mt-2 text-sm text-emerald-100 sm:text-base leading-relaxed">
            Tra cứu thời hạn bảo hành linh kiện, cấu hình PC trực tuyến hoặc quét mã barcode in trên tem phụ sản phẩm nhanh chóng. Kích hoạt quyền lợi bảo hành điện tử tức thì.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Area: Lookup form and Result details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-950 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              <span>Tra cứu thời hạn</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Nhập số Serial sản phẩm (S/N) hoặc Mã đơn hàng của bạn để hệ thống tự động kiểm tra thời hạn và điều khoản bảo hành đi kèm.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã bảo hành hoặc số Serial (S/N)..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-4 pr-10 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <Keyboard className="h-4 w-4" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLookup(code)}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 shrink-0 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Đang tra cứu..." : "Tra cứu ngay"}</span>
              </button>
              <div className="shrink-0 flex items-center">
                <BarcodeScanner
                  onDetected={(val) => {
                    setCode(val);
                    onLookup(val);
                  }}
                />
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/10 p-6 shadow-sm dark:border-emerald-950/20 dark:bg-emerald-950/5 animate-fadeIn">
              <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Thông tin bảo hành chính xác</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Số Serial (S/N)</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200 font-bold mt-1 block">{result.serialNumber || "N/A"}</span>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sản phẩm ID (Product ID)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 mt-1 block">#{result.productId}</span>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trạng thái thiết bị</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 mt-1 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                    <span>{result.status || "Hoạt động"}</span>
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mã đơn hàng liên kết</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 mt-1 block">Đơn #{result.orderId || "N/A"}</span>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ngày kích hoạt bảo hành</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 mt-1 block flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    {result.registeredAt ? new Date(result.registeredAt).toLocaleString("vi-VN") : "Chưa kích hoạt"}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-50 dark:bg-gray-900 dark:border-gray-850">
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ngày hết hạn dự kiến</span>
                  <span className="font-medium text-rose-600 mt-1 block flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    {result.expiryDate || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Activate warranty form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-950 dark:text-gray-100 mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 animate-pulse" />
              <span>Kích hoạt bảo hành điện tử</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Kích hoạt bảo hành tức thì cho sản phẩm mới nhận của bạn để đảm bảo quyền lợi sửa chữa, đổi mới chính hãng nhanh nhất.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mã Sản phẩm (Product ID) *</label>
                <input
                  type="number"
                  value={activateForm.productId}
                  onChange={(e) => setActivateForm((prev) => ({ ...prev, productId: e.target.value }))}
                  placeholder="Ví dụ: 1045"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mã đơn hàng liên kết (Order ID)</label>
                <input
                  type="number"
                  value={activateForm.orderId}
                  onChange={(e) => setActivateForm((prev) => ({ ...prev, orderId: e.target.value }))}
                  placeholder="Nhập mã đơn hàng mua sản phẩm (tùy chọn)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Số Serial thiết bị (Serial Number)</label>
                <input
                  type="text"
                  value={activateForm.serialNumber}
                  onChange={(e) => setActivateForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Nhập dãy ký tự in trên vỏ hoặc tem sản phẩm"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                />
              </div>

              <button
                type="button"
                onClick={onActivate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-700 transition-all mt-4"
              >
                <span>Xác nhận kích hoạt trực tuyến</span>
              </button>
            </div>
          </div>

          {/* Quy định bảo hành chung */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xs font-bold text-gray-950 dark:text-gray-100 mb-3 uppercase tracking-wide border-b border-gray-50 pb-2 dark:border-gray-800">
              Quy định bảo hành PC & Linh kiện
            </h2>
            <ul className="space-y-2.5 text-[11px] text-gray-500 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Bảo hành phần cứng 1 đổi 1 trong vòng 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Không bảo hành các trường hợp cháy nổ IC, sứt mẻ linh kiện do lắp đặt sai quy cách hoặc thiên tai.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Thời hạn sửa chữa hoàn tất từ 3 đến 7 ngày làm việc kể từ thời điểm tiếp nhận thiết bị lỗi.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
