import { useContext, useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../context/UserContext";
import { getUserById, getUserByEmail, updateUserById } from "../../services/UserServices";
import { getLoyaltyTier } from "../../apis/loyaltyApi";
import { getUserAnalytics } from "../../apis/userApi";
import { SidebarNav } from "../../components/ui";
import notify from "../../utils/notify";
import path from "../../constant/path";

import ProfileHeader from "./components/ProfileHeader";
import AccountInfoTab from "./components/AccountInfoTab";
import AddressBookTab from "./components/AddressBookTab";
import NotificationTab from "./components/NotificationTab";
import ReviewHistoryTab from "./components/ReviewHistoryTab";

import { lazy, Suspense } from "react";
const UserOrders = lazy(() => import("../../components/UserOrder/UserOder"));
const UserFavorites = lazy(() => import("../../components/UserFavorites/UserFavorites"));
const OrderTracking = lazy(() => import("../../components/OrderTracking/OrderTracking"));
const UserDiscounts = lazy(() => import("../../components/UserDiscounts/UserDiscounts"));
const LoyaltyHistory = lazy(() => import("../../components/UserProfile/LoyaltyHistory"));
const Support = lazy(() => import("../../components/Support/Support"));
const ReturnRequestTab = lazy(() => import("./components/ReturnRequestTab"));
const SpendingDashboardTab = lazy(() => import("./components/SpendingDashboardTab"));
const AchievementsTab = lazy(() => import("./components/AchievementsTab"));
const DailyCheckIn = lazy(() => import("./components/DailyCheckIn"));
const PriceAlertsTab = lazy(() => import("./components/PriceAlertsTab"));

const TabLoader = () => (
  <div className="profile-card flex items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
  </div>
);

const Icons = {
  user: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  mapPin: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  orders: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  heart: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  truck: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  rotate: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 005.3 7M4 14a8 8 0 0014.7 3" /></svg>,
  tag: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  star: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  support: <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

function UserProfile() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, updateUser } = useContext(UserContext);

  const tabFromQuery = new URLSearchParams(location.search).get("tab");
  const [activeTab, setActiveTab] = useState(tabFromQuery || "account-info");
  const [touchStartX, setTouchStartX] = useState(null);
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const [accountInfo, setAccountInfo] = useState({ fullName: "", email: "", phoneNumber: "", address: "", gender: "", birthDate: "", cumulativePoints: 0 });
  const [editAccountInfo, setEditAccountInfo] = useState({ fullName: "", email: "", phoneNumber: "", address: "", gender: "", birthDate: "" });
  const [tierData, setTierData] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0 });

  useEffect(() => {
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  let userId = null;
  if (user) {
    userId = user.id || user.customerID || user.userId || user.customerId || user.ID;
    if (!userId) {
      const idKey = Object.keys(user).find((k) => k.toLowerCase().includes("id") && typeof user[k] === "number" && user[k] > 0);
      if (idKey) userId = user[idKey];
    }
    if (!userId && user.email) userId = "find_by_email";
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      if (resolvedUserId && userId !== "find_by_email" && userId === resolvedUserId) return;
      try {
        let data = null;
        if (userId === "find_by_email" && user?.email) {
          data = await getUserByEmail(user.email);
          if (data) setResolvedUserId(data.id);
          else data = { fullName: user.fullName || user.email, email: user.email, phoneNumber: "", address: "", gender: "MALE", dob: "", cumulativePoints: 0 };
        } else if (userId && userId !== "find_by_email") {
          data = await getUserById(userId);
          setResolvedUserId(userId);
        }
        if (data) {
          const info = { fullName: data.fullName || "", email: data.email || "", phoneNumber: data.phoneNumber || "", address: data.address || "", gender: data.gender || "", birthDate: data.dob || "", status: data.status || "ACTIVE", cumulativePoints: data.cumulativePoints || 0, roleId: data.roleId || null };
          setAccountInfo(info);
          setEditAccountInfo({ fullName: info.fullName, email: info.email, phoneNumber: info.phoneNumber, address: info.address, gender: info.gender, birthDate: info.birthDate });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId, user?.email]);

  useEffect(() => {
    const loadSummary = async () => {
      if (!resolvedUserId) return;
      try {
        const [tier, analytics] = await Promise.all([getLoyaltyTier(resolvedUserId), getUserAnalytics(resolvedUserId)]);
        setTierData(tier);
        setStats((prev) => ({ ...prev, totalOrders: Number(analytics?.totalOrders || 0) }));
      } catch (error) {
        console.error("Error loading profile summary:", error);
      }
    };
    loadSummary();
  }, [resolvedUserId]);

  useEffect(() => {
    setEditAccountInfo({ fullName: accountInfo.fullName || "", email: accountInfo.email || "", phoneNumber: accountInfo.phoneNumber || "", address: accountInfo.address || "", gender: accountInfo.gender || "", birthDate: accountInfo.birthDate || "" });
  }, [accountInfo.fullName, accountInfo.email, accountInfo.phoneNumber, accountInfo.address, accountInfo.gender, accountInfo.birthDate]);

  const handleSaveAccountInfo = async () => {
    if (!resolvedUserId) {
      notify.error("Không thể cập nhật. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const updatedData = { ...accountInfo, fullName: editAccountInfo.fullName, email: editAccountInfo.email, phoneNumber: editAccountInfo.phoneNumber, address: editAccountInfo.address, gender: editAccountInfo.gender, dob: editAccountInfo.birthDate };
      const response = await updateUserById(resolvedUserId, updatedData);
      if (response) {
        notify.success(t("account.updated_success", { defaultValue: "Cập nhật thành công!" }));
        setAccountInfo(updatedData);
        setTimeout(() => {
          updateUser({ ...user, fullName: updatedData.fullName, phoneNumber: updatedData.phoneNumber, address: updatedData.address, gender: updatedData.gender });
        }, 100);
      }
    } catch (err) {
      console.error("Update error:", err);
      notify.error("Lỗi cập nhật thông tin");
    }
  };

  const navItems = useMemo(
    () => [
      { section: "Tài khoản" },
      { id: "account-info", label: t("account.account_information"), icon: Icons.user },
      { id: "address-book", label: t("account.address_book"), icon: Icons.mapPin },
      { id: "notifications", label: "Thông báo", icon: Icons.support, badge: 0 },
      { divider: true },
      { section: "Mua sắm" },
      { id: "my-orders", label: t("account.my_orders"), icon: Icons.orders },
      { id: "favorites", label: t("account.favourite_products"), icon: Icons.heart },
      { id: "order-tracking", label: t("account.order_tracking"), icon: Icons.truck },
      { id: "return-requests", label: "Yêu cầu đổi trả", icon: Icons.rotate },
      { divider: true },
      { section: "Ưu đãi" },
      { id: "my-discounts", label: t("account.my_discounts") || "Mã giảm giá", icon: Icons.tag },
      { id: "loyalty-history", label: "Lịch sử điểm thưởng", icon: Icons.star },
      { id: "achievements", label: "Thành tựu", icon: Icons.star },
      { id: "spending-dashboard", label: "Thống kê chi tiêu", icon: Icons.star },
      { id: "price-alerts", label: "Báo động giá", icon: Icons.support },
      { id: "review-history", label: "Lịch sử đánh giá", icon: Icons.star },
      { id: "daily-checkin", label: "Điểm danh hằng ngày", icon: Icons.star },
      { divider: true },
      { id: "support", label: t("nav.support", { defaultValue: "Hỗ trợ" }), icon: Icons.support },
    ],
    [t]
  );

  if (!user || (!userId && userId !== "find_by_email")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="profile-card max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-3xl">🔒</div>
          <h2 className="mb-2 text-lg font-bold text-[var(--color-text)]">{t("account.please_login", { defaultValue: "Vui lòng đăng nhập" })}</h2>
          <p className="mb-5 text-sm text-[var(--color-text-muted)]">Bạn cần đăng nhập để xem thông tin tài khoản.</p>
          <Link to={path.login} className="btn-primary">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    if (!resolvedUserId && activeTab !== "account-info" && activeTab !== "address-book") {
      return (
        <div className="profile-card py-12 text-center">
          <p className="text-[var(--color-text-muted)]">Đang tải thông tin người dùng...</p>
          <div className="mx-auto mt-3 h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        </div>
      );
    }

    switch (activeTab) {
      case "account-info":
        return <AccountInfoTab accountInfo={accountInfo} editAccountInfo={editAccountInfo} setEditAccountInfo={setEditAccountInfo} onSave={handleSaveAccountInfo} resolvedUserId={resolvedUserId} />;
      case "address-book":
        return <AddressBookTab userId={resolvedUserId} />;
      case "my-orders":
        return <Suspense fallback={<TabLoader />}><UserOrders userId={resolvedUserId} /></Suspense>;
      case "favorites":
        return <Suspense fallback={<TabLoader />}><UserFavorites userId={resolvedUserId} /></Suspense>;
      case "order-tracking":
        return <Suspense fallback={<TabLoader />}><OrderTracking userId={resolvedUserId} onNavigateToTracking={() => setActiveTab("order-tracking")} /></Suspense>;
      case "my-discounts":
        return <Suspense fallback={<TabLoader />}><UserDiscounts userId={resolvedUserId} /></Suspense>;
      case "return-requests":
        return <Suspense fallback={<TabLoader />}><ReturnRequestTab userId={resolvedUserId} /></Suspense>;
      case "loyalty-history":
        return <Suspense fallback={<TabLoader />}><LoyaltyHistory userId={resolvedUserId} /></Suspense>;
      case "achievements":
        return <Suspense fallback={<TabLoader />}><AchievementsTab userId={resolvedUserId} /></Suspense>;
      case "spending-dashboard":
        return <Suspense fallback={<TabLoader />}><SpendingDashboardTab userId={resolvedUserId} /></Suspense>;
      case "price-alerts":
        return <Suspense fallback={<TabLoader />}><PriceAlertsTab userId={resolvedUserId} /></Suspense>;
      case "notifications":
        return <NotificationTab userId={resolvedUserId} />;
      case "review-history":
        return <ReviewHistoryTab userId={resolvedUserId} />;
      case "daily-checkin":
        return <Suspense fallback={<TabLoader />}><DailyCheckIn userId={resolvedUserId} /></Suspense>;
      case "support":
        return <Suspense fallback={<TabLoader />}><Support /></Suspense>;
      default:
        return <AccountInfoTab accountInfo={accountInfo} editAccountInfo={editAccountInfo} setEditAccountInfo={setEditAccountInfo} onSave={handleSaveAccountInfo} resolvedUserId={resolvedUserId} />;
    }
  };

  const mobileTabs = navItems.filter((i) => i.id);
  const activeTabIndex = mobileTabs.findIndex((i) => i.id === activeTab);

  const onTabsTouchStart = (e) => {
    setTouchStartX(e.touches?.[0]?.clientX ?? null);
  };

  const onTabsTouchEnd = (e) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = touchStartX - endX;
    const threshold = 48;

    if (Math.abs(delta) >= threshold && activeTabIndex >= 0) {
      if (delta > 0 && activeTabIndex < mobileTabs.length - 1) {
        setActiveTab(mobileTabs[activeTabIndex + 1].id);
      } else if (delta < 0 && activeTabIndex > 0) {
        setActiveTab(mobileTabs[activeTabIndex - 1].id);
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="container-app animate-pageIn py-6 lg:py-8">
      <ProfileHeader accountInfo={accountInfo} user={user} stats={stats} tierData={tierData} />

      <div className="mb-4 lg:hidden">
        <div className="profile-tabs rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {mobileTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`profile-tab rounded-xl border-0 px-3 py-2 text-xs sm:text-sm ${
                activeTab === item.id ? "active bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-layout">
        <div className="hidden lg:block">
          <SidebarNav items={navItems} activeId={activeTab} onChange={setActiveTab} />
        </div>

        <div className="min-w-0" onTouchStart={onTabsTouchStart} onTouchEnd={onTabsTouchEnd}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
