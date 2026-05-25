import React from "react";
import { useTranslation } from "react-i18next";

/**
 * ProfileHeader — Avatar + User Info + Quick Stats
 */
const ProfileHeader = ({ accountInfo, user, stats = {}, tierData = null }) => {
  const { t } = useTranslation();

  const initials = (accountInfo.fullName || user?.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const points = accountInfo.cumulativePoints || 0;
  const tierName = tierData?.tier || (points >= 20000 ? "Platinum" : points >= 5000 ? "Gold" : points >= 1000 ? "Silver" : "Bronze");
  const nextThreshold = tierData?.nextThreshold ?? (tierName === "Bronze" ? 1000 : tierName === "Silver" ? 5000 : tierName === "Gold" ? 20000 : points);
  const prevThreshold = tierName === "Bronze" ? 0 : tierName === "Silver" ? 1000 : tierName === "Gold" ? 5000 : 20000;
  const progress = nextThreshold > prevThreshold
    ? Math.min(100, Math.round(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100;
  const perks = Array.isArray(tierData?.perks) ? tierData.perks : [];
  const tier =
    tierName === "Platinum"
      ? { name: "Platinum", color: "from-cyan-400 to-blue-600", textColor: "text-cyan-600" }
      : tierName === "Gold"
      ? { name: "Gold", color: "from-amber-400 to-orange-500", textColor: "text-amber-600" }
      : tierName === "Silver"
      ? { name: "Silver", color: "from-gray-300 to-gray-500", textColor: "text-gray-500" }
      : { name: "Bronze", color: "from-orange-300 to-orange-500", textColor: "text-orange-500" };

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary-700)] via-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white p-6 md:p-8 shadow-lg mb-6">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg">
          {initials}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {accountInfo.fullName || user?.fullName || t("account.user", { defaultValue: "Người dùng" })}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${tier.color} text-white shadow-sm`}>
              ⭐ {tier.name}
            </span>
          </div>
          <p className="text-violet-100 text-sm truncate">
            {accountInfo.email || user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
            <p className="text-xs text-violet-200">{t("account.orders", { defaultValue: "Đơn hàng" })}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{(points || 0).toLocaleString("vi-VN")}</p>
            <p className="text-xs text-violet-200">{t("account.points", { defaultValue: "Điểm" })}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.pendingOrders || 0}</p>
            <p className="text-xs text-violet-200">{t("account.in_delivery", { defaultValue: "Đang giao" })}</p>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-violet-100">
          <span>Tien do hang thanh vien</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {perks.length > 0 && (
          <p className="mt-2 text-xs text-violet-100 truncate">
            Uu dai: {perks.join(" | ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
