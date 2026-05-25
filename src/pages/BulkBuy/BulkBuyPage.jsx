import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { createQuoteRequest, getUserQuoteRequests } from "../../apis/quoteApi";
import notify from "../../utils/notify";

export default function BulkBuyPage() {
  const [searchParams] = useSearchParams();
  const { user } = useContext(UserContext);
  const userId = useMemo(() => user?.id || user?.userId || user?.customerId || null, [user]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    quantity: 10,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const productIdFromQuery = searchParams.get("productId") || "";
  const productNameFromQuery = searchParams.get("productName") || "";

  const loadData = async () => {
    if (!userId) return;
    try {
      const data = await getUserQuoteRequests(userId);
      setRows(data);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (!productIdFromQuery) return;
    setForm((prev) => ({
      ...prev,
      productId: prev.productId || productIdFromQuery,
    }));
  }, [productIdFromQuery]);

  const onSubmit = async () => {
    if (!userId) return notify.error("Vui lòng đăng nhập để gửi yêu cầu báo giá");
    if (!form.productId || !form.contactName || !form.contactPhone) {
      return notify.error("Vui lòng nhập đủ thông tin bắt buộc");
    }
    setLoading(true);
    try {
      await createQuoteRequest({
        userId,
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        note: form.note,
      });
      notify.success("Đã gửi yêu cầu báo giá thành công");
      setForm({
        productId: "",
        quantity: 10,
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        note: "",
      });
      await loadData();
    } catch (error) {
      notify.error(error?.response?.data?.message || "Không thể gửi yêu cầu báo giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">Mua số lượng lớn / Báo giá B2B</h1>
        <p className="mt-1 text-sm text-gray-600">Mua trên 10 sản phẩm để nhận báo giá tốt hơn cho doanh nghiệp.</p>

        {productNameFromQuery ? (
          <p className="mt-2 inline-flex rounded-lg bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
            Sản phẩm đang chọn: {productNameFromQuery}
          </p>
        ) : null}

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Gửi yêu cầu báo giá</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Product ID *" value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))} />
            <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Số lượng * (tối thiểu 10)" type="number" min={10} value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
            <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Tên liên hệ *" value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} />
            <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Số điện thoại *" value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} />
            <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Email liên hệ" value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
            <textarea className="rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-2" rows={4} placeholder="Ghi chú yêu cầu (cấu hình, thời gian cần hàng...)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
          </div>
          <button onClick={onSubmit} disabled={loading} className="mt-3 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white">
            {loading ? "Đang gửi..." : "Gửi yêu cầu báo giá"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Lịch sử yêu cầu của bạn</h2>
          {rows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">Bạn chưa có yêu cầu báo giá nào.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-2">ID</th>
                    <th className="py-2">Sản phẩm</th>
                    <th className="py-2">Số lượng</th>
                    <th className="py-2">Trạng thái</th>
                    <th className="py-2">Phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-2">{r.id}</td>
                      <td className="py-2">{r.productId}</td>
                      <td className="py-2">{r.quantity}</td>
                      <td className="py-2">{r.status}</td>
                      <td className="py-2">{r.adminResponse || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
