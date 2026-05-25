import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { getReceivedGiftCards, getSentGiftCards, purchaseGiftCard, redeemGiftCard } from "../../apis/giftCardApi";
import notify from "../../utils/notify";
import { Gift, CreditCard, Send, PlusCircle, CheckCircle, RefreshCw, Calendar, Tag } from "lucide-react";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const CARD_TEMPLATES = [
  { id: "gaming", label: "Gaming Special 🎮", bgClass: "bg-gradient-to-br from-[var(--color-primary-)] to-indigo-900 text-white" },
  { id: "birthday", label: "Sinh nhật 🎂", bgClass: "bg-gradient-to-br from-[var(--color-primary-)] to-rose-600 text-white" },
  { id: "thankyou", label: "Cảm ơn 💖", bgClass: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white" },
  { id: "holiday", label: "Lễ hội 🎄", bgClass: "bg-gradient-to-br from-red-600 to-amber-600 text-white" },
];

export default function GiftCardPage() {
  const { user } = useContext(UserContext);
  const userId = useMemo(() => user?.id || user?.userId || user?.customerId || null, [user]);

  const [amount, setAmount] = useState(QUICK_AMOUNTS[0]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("gaming");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeTemplate = useMemo(() => {
    return CARD_TEMPLATES.find((t) => t.id === selectedTemplate) || CARD_TEMPLATES[0];
  }, [selectedTemplate]);

  const loadCards = async () => {
    if (!userId) return;
    try {
      const [sentRows, receivedRows] = await Promise.all([getSentGiftCards(userId), getReceivedGiftCards(userId)]);
      setSent(sentRows);
      setReceived(receivedRows);
    } catch (error) {
      notify.error(error?.response?.data?.message || "Không thể tải danh sách thẻ quà tặng.");
    }
  };

  useEffect(() => {
    loadCards();
  }, [userId]);

  const onPurchase = async () => {
    if (!userId) return notify.error("Vui lòng đăng nhập trước khi mua thẻ quà tặng.");
    setLoading(true);
    try {
      const res = await purchaseGiftCard({ senderUserId: userId, amount, recipientEmail, message });
      notify.success(`${res?.message || "Tạo thẻ quà tặng thành công!"} (${res?.giftCard?.code || ""})`);
      setRecipientEmail("");
      setMessage("");
      await loadCards();
    } catch (error) {
      notify.error(error?.response?.data?.message || "Không thể tạo thẻ quà tặng lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const onRedeem = async () => {
    if (!userId) return notify.error("Vui lòng đăng nhập trước khi redeem.");
    if (!redeemCode.trim()) return notify.error("Vui lòng nhập mã thẻ quà tặng.");
    setLoading(true);
    try {
      const res = await redeemGiftCard({ userId, code: redeemCode.trim() });
      notify.success(`${res?.message || "Redeem thành công!"} +${Number(res?.amount || 0).toLocaleString("vi-VN")}đ vào tài khoản.`);
      setRedeemCode("");
      await loadCards();
    } catch (error) {
      notify.error(error?.response?.data?.message || "Đổi mã thẻ quà tặng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 animate-fadeIn">
      {/* Header section */}
      <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Gift className="h-7 w-7 text-[var(--color-primary-)]" />
          <span>Thẻ quà tặng & E-Voucher</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Mua và gửi e-voucher cho bạn bè với thiết kế cá nhân hóa, hoặc kích hoạt thẻ quà tặng để nhận điểm mua sắm.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Purchase & Customize Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[var(--color-primary-)]" />
              <span>Thiết kế & Mua thẻ quà tặng</span>
            </h2>

            {/* Quick Amount Choices */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Chọn mệnh giá</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                      amount === v
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    {v.toLocaleString("vi-VN")}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Templates */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Chọn mẫu thiết kế</label>
              <div className="flex flex-wrap gap-2">
                {CARD_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                      selectedTemplate === t.id
                        ? "border-[var(--color-primary-)] bg-[var(--color-primary-)] text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/20 dark:text-[var(--color-primary-)]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient info & message */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email người nhận</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  placeholder="Nhập email người nhận (Không bắt buộc)"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Lời nhắn gửi kèm</label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  rows={3}
                  placeholder="Nhập lời chúc tốt đẹp nhất gửi tới người nhận..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-)] py-3.5 text-base font-bold text-white shadow-md shadow-[var(--color-primary-)]/10 hover:bg-[var(--color-primary-)] transition-all"
                disabled={loading}
                onClick={onPurchase}
              >
                <Send className="h-4 w-4" />
                <span>{loading ? "Đang xử lý giao dịch..." : "Mua & gửi thẻ quà tặng"}</span>
              </button>
            </div>
          </div>

          {/* User Gift Cards Sent and Received History */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 dark:border-gray-800">
                <CreditCard className="h-4 w-4 text-[var(--color-primary-)]" />
                <span>Thẻ quà tặng đã gửi ({sent.length})</span>
              </h3>
              <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {sent.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-950">
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{item.code}</p>
                      <p className="text-[10px] text-gray-400">Trạng thái: <span className="text-[var(--color-primary-)] font-bold">{item.status}</span></p>
                    </div>
                    <span className="text-xs font-bold text-gray-850 dark:text-gray-200">
                      {Number(item.originalAmount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </li>
                ))}
                {sent.length === 0 && (
                  <li className="text-xs text-gray-400 text-center py-6">Bạn chưa gửi thẻ quà tặng nào.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 dark:border-gray-800">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Thẻ quà tặng đã nhận ({received.length})</span>
              </h3>
              <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {received.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-950">
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{item.code}</p>
                      <p className="text-[10px] text-gray-400">Trạng thái: <span className="text-emerald-600 font-bold">{item.status}</span></p>
                    </div>
                    <span className="text-xs font-bold text-gray-850 dark:text-gray-200">
                      {Number(item.originalAmount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </li>
                ))}
                {received.length === 0 && (
                  <li className="text-xs text-gray-400 text-center py-6">Bạn chưa nhận hay kích hoạt thẻ nào.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Live Preview & Redeem Sidebars */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Live Preview Panel */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Xem trước thẻ quà tặng</h2>
            <div className={`relative h-44 w-full rounded-2xl p-5 shadow-md flex flex-col justify-between overflow-hidden transition-all duration-300 ${activeTemplate.bgClass}`}>
              <div className="absolute top-0 right-0 h-28 w-28 bg-white/10 rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold tracking-tight">Shop PC E-Gift</h4>
                  <p className="text-[10px] text-white/70">{activeTemplate.label}</p>
                </div>
                <Gift className="h-6 w-6 text-white/80" />
              </div>

              <div>
                <p className="text-[10px] text-white/60 mb-0.5">Mệnh giá</p>
                <h3 className="text-2xl font-black">{amount.toLocaleString("vi-VN")}đ</h3>
              </div>

              <div className="flex justify-between items-center text-[10px] text-white/85">
                <span className="truncate max-w-[150px] font-bold">{recipientEmail || "Đến: Bạn của tôi"}</span>
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded">XXXX-XXXX-XXXX</span>
              </div>
            </div>
            {message && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100 italic dark:bg-gray-950 dark:border-gray-800">
                "{message}"
              </div>
            )}
          </div>

          {/* Quick Redeem Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-950 dark:text-gray-100 mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[var(--color-primary-)]" />
              <span>Kích hoạt thẻ quà tặng</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Nhập mã thẻ quà tặng gồm các ký tự chữ và số để kích hoạt nạp tiền vào ví mua sắm.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-mono text-center outline-none uppercase transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                placeholder="Ví dụ: SP-GIFT-12345"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="w-full rounded-xl bg-gray-950 py-3 text-sm font-bold text-white hover:bg-gray-850 dark:bg-[var(--color-primary-)] dark:hover:bg-[var(--color-primary-)] transition-all"
                disabled={loading}
                onClick={onRedeem}
              >
                <span>{loading ? "Đang xử lý..." : "Xác nhận nạp ví"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
