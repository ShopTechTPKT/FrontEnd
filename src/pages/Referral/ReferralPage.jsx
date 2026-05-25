import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { applyReferralCode, generateReferralCode, getReferralStats } from "../../apis/referralApi";
import notify from "../../utils/notify";
import { Share2, Users, Trophy, Gift, ArrowRight, RefreshCw, Copy, Check } from "lucide-react";

export default function ReferralPage() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [stats, setStats] = useState({ totalInvites: 0, successfulInvites: 0, totalReward: 0, items: [] });
  const [copied, setCopied] = useState(false);

  const userId = useMemo(() => user?.id || user?.userId || user?.customerId || null, [user]);
  const referralLink = useMemo(() => (myCode ? `${window.location.origin}/referral?code=${myCode}` : ""), [myCode]);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const generated = await generateReferralCode(userId);
      setMyCode(generated?.code || "");
      const data = await getReferralStats(userId);
      setStats(data || { totalInvites: 0, successfulInvites: 0, totalReward: 0, items: [] });
    } catch (error) {
      notify.error(error?.response?.data?.message || "Không thể tải dữ liệu chương trình giới thiệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingCode = (params.get("code") || "").trim();
    if (incomingCode) {
      setCode(incomingCode);
    }
  }, []);

  const onApplyCode = async () => {
    if (!userId) {
      notify.error("Vui lòng đăng nhập để áp dụng mã giới thiệu.");
      return;
    }
    if (!code.trim()) {
      notify.error("Vui lòng nhập mã giới thiệu.");
      return;
    }
    try {
      const res = await applyReferralCode({ userId, code: code.trim().toUpperCase() });
      notify.success(res?.message || "Áp dụng mã giới thiệu thành công!");
      await loadData();
    } catch (error) {
      notify.error(error?.response?.data?.message || "Áp dụng mã giới thiệu thất bại.");
    }
  };

  const onCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      notify.success("Đã sao chép liên kết giới thiệu!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      notify.error("Không thể sao chép liên kết.");
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--color-primary-)] to-indigo-700 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-bl-full pointer-events-none" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
            <Gift className="h-3.5 w-3.5" />
            <span>Mời Bạn Nhận Quà Khủng</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Chương trình Giới thiệu Bạn bè</h1>
          <p className="mt-2 text-sm text-[var(--color-primary-)] sm:text-base leading-relaxed">
            Chia sẻ niềm vui mua sắm PC chất lượng! Nhận ngay <span className="font-bold text-yellow-300">50.000đ</span> vào tài khoản cho mỗi lượt giới thiệu thành công, và người được giới thiệu cũng sẽ nhận ngay <span className="font-bold text-yellow-300">30.000đ</span>.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left column: Referral sharing options & stats */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual statistics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-)] text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/40 dark:text-[var(--color-primary-)] shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Đã giới thiệu</p>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-0.5">{stats.totalInvites} người</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Thành công</p>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-0.5">{stats.successfulInvites} người</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tổng tiền thưởng</p>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-0.5">{Number(stats.totalReward || 0).toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          </div>

          {/* Interactive Share Panel */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[var(--color-primary-)]" />
              <span>Chia sẻ liên kết của bạn</span>
            </h2>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-950 dark:border-gray-800">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mã giới thiệu của tôi</span>
              <p className="text-2xl font-black tracking-widest text-[var(--color-primary-)] dark:text-[var(--color-primary-)]">{myCode || "-"}</p>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-)] py-3 text-sm font-bold text-white shadow-md shadow-[var(--color-primary-)]/10 hover:bg-[var(--color-primary-)] transition-all"
                onClick={onCopy}
                disabled={!myCode}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Đã sao chép liên kết" : "Sao chép mã liên kết"}</span>
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 flex items-center gap-2"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Làm mới dữ liệu</span>
              </button>
            </div>

            {referralLink && (
              <div className="mt-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Đường dẫn giới thiệu trực tiếp</span>
                <p className="break-all rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-100 dark:bg-gray-950 dark:border-gray-800">
                  {referralLink}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Guide & Apply Code Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apply Incoming Referral Code */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-950 dark:text-gray-100 mb-3">Kích hoạt mã giới thiệu</h2>
            <p className="text-xs text-gray-400 mb-3">
              Nếu bạn được bạn bè mời, hãy nhập mã giới thiệu của họ bên dưới để kích hoạt gói quà tặng 30.000đ.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-mono text-center outline-none uppercase transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                placeholder="Ví dụ: REF-12345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                className="w-full rounded-xl bg-gray-950 py-3 text-sm font-bold text-white hover:bg-gray-850 dark:bg-[var(--color-primary-)] dark:hover:bg-[var(--color-primary-)] transition-all"
                onClick={onApplyCode}
              >
                <span>Xác nhận áp dụng</span>
              </button>
            </div>
          </div>

          {/* How it works block */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-950 dark:text-gray-100 mb-4 border-b border-gray-50 pb-2 dark:border-gray-800">
              Quy trình nhận thưởng
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-)] text-xs font-bold text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/40 dark:text-[var(--color-primary-)]">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Lấy liên kết & Mã</p>
                  <p className="text-[10px] text-gray-400">Sao chép mã giới thiệu hoặc link gửi trực tiếp từ trang này.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-)] text-xs font-bold text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/40 dark:text-[var(--color-primary-)]">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Bạn bè đăng ký</p>
                  <p className="text-[10px] text-gray-400">Bạn bè của bạn đăng ký tài khoản Shop PC và áp dụng mã giới thiệu.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-)] text-xs font-bold text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/40 dark:text-[var(--color-primary-)]">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Nhận quà tặng tức thì</p>
                  <p className="text-[10px] text-gray-400">Cả hai tài khoản sẽ tự động nhận số tiền thưởng tương ứng vào tài khoản ví mua sắm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
