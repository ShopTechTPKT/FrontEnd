import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../context/UserContext";
import { changePassword } from "../../apis/userApi";
import Support from "../../components/Support/Support";
import UserOrders from "../../components/UserOrder/UserOder";
import UserFavorites from "../../components/UserFavorites/UserFavorites";
import OrderTracking from "../../components/OrderTracking/OrderTracking";
import UserDiscounts from "../../components/UserDiscounts/UserDiscounts";
import path from "../../constant/path";
import {
  getUserById,
  getUserByEmail,
  updateUserById,
} from "../../services/UserServices";

function UserProfile() {
  const { t } = useTranslation();

  const location = useLocation();
  const { user, updateUser } = useContext(UserContext);

  // Lấy tab từ query parameter nếu có
  const searchParams = new URLSearchParams(location.search);
  const tabFromQuery = searchParams.get("tab");
  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    birthDate: "",
  });
  //   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAccountInfo, setEditAccountInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    birthDate: "",
  });
  // State để theo dõi trạng thái chỉnh sửa địa chỉ
  //   const [isEditingAddress, setIsEditingAddress] = useState(false);
  // State cho giá trị đang chỉnh sửa
  //   const [editingAddressValue, setEditingAddressValue] = useState("");
  //   const addressInputRef = useRef(null);

  // state quản lý đổi mật khẩu
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  // State để quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState(tabFromQuery || "account-info");

  // Cập nhật activeTab khi có query parameter
  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  // Hàm để điều hướng đến tab theo dõi đơn hàng
  const navigateToOrderTracking = () => {
    setActiveTab("order-tracking");
  };

  // State để lưu userId thực tế sau khi resolve
  const [resolvedUserId, setResolvedUserId] = useState(null);

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(!isChangePasswordModalOpen);
    if (!isChangePasswordModalOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setChangePasswordError("");
      setChangePasswordSuccess(false);
    }
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handlePasswordInputChange = e => {
    const { name, value } = e.target;
    if (name === "currentPassword") setCurrentPassword(value);
    else if (name === "newPassword") setNewPassword(value);
    else if (name === "confirmNewPassword") setConfirmNewPassword(value);
  };

  const handleChangePasswordSubmit = async () => {
    setChangePasswordError("");
    setChangePasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      if (!resolvedUserId) {
        setChangePasswordError(
          "Không thể đổi mật khẩu. Vui lòng đăng nhập lại để lấy thông tin đầy đủ."
        );
        return;
      }

      // Gọi API thật thay vì mock
      await changePassword(resolvedUserId, {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      setChangePasswordSuccess(true);
      setTimeout(handleCloseChangePasswordModal, 1500); // Đóng modal sau khi thành công
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      // Xử lý lỗi từ backend
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      setChangePasswordError(errorMessage);
    }
  };

  console.log("Full user object:", user);
  console.log("user.id:", user?.id);
  console.log("user.customerID:", user?.customerID);
  console.log("user.userId:", user?.userId);
  console.log("All user keys:", user ? Object.keys(user) : "No user");

  let userId = null;

  if (user) {
    userId =
      user.id || user.customerID || user.userId || user.customerId || user.ID;

    if (!userId) {
      const userKeys = Object.keys(user);
      const idKey = userKeys.find(
        key =>
          key.toLowerCase().includes("id") &&
          typeof user[key] === "number" &&
          user[key] > 0
      );
      if (idKey) {
        userId = user[idKey];
        console.log(`Found userId in field: ${idKey} = ${userId}`);
      }
    }

    //  dùng email để tìm user
    if (!userId && user.email) {
      console.log(
        "No userId found, will try to find user by email:",
        user.email
      );
      // set userId = "email" để trigger việc tìm user bằng email
      userId = "find_by_email";
    }
  }

  console.log("Final userId:", userId);

  useEffect(() => {
    console.log("=== useEffect TRIGGERED ===");
    console.log("Current userId:", userId);
    console.log("Current user email:", user?.email);
    console.log("Current resolvedUserId:", resolvedUserId);

    const fetchUser = async () => {
      // Kiểm tra xem có userId không (người dùng đã đăng nhập)
      if (!userId) {
        console.log("Không tìm thấy userId, người dùng chưa đăng nhập");
        return;
      }

      // Tránh fetch lại nếu đã có resolvedUserId và userId không phải là "find_by_email"
      if (
        resolvedUserId &&
        userId !== "find_by_email" &&
        userId === resolvedUserId
      ) {
        console.log(
          "Already have resolvedUserId, skipping fetch:",
          resolvedUserId
        );
        return;
      }

      try {
        let data = null;

        // Nếu userId là "find_by_email", thử tìm user bằng email từ API
        if (userId === "find_by_email" && user?.email) {
          console.log("Trying to find user by email from API:", user.email);
          data = await getUserByEmail(user.email);

          if (data) {
            console.log("Found user by email:", data);
            // Cập nhật userId thực tế từ API response
            setResolvedUserId(data.id);
            console.log("Updated userId from API:", data.id);
          } else {
            console.log("User not found by email, using fallback data");
            // Fallback nếu không tìm thấy user
            data = {
              id: null,
              fullName: user.fullName || user.email,
              email: user.email,
              phoneNumber: user.phoneNumber || "",
              address: user.address || "",
              gender: user.gender || "MALE",
              dob: user.birthDate || user.dob || "",
              status: "ACTIVE",
              cumulativePoints: 0,
              roleId: null,
            };
          }
        } else if (userId && userId !== "find_by_email") {
          // Sử dụng getUserById như bình thường
          data = await getUserById(userId);
          setResolvedUserId(userId);
        }

        if (data) {
          setAccountInfo({
            fullName: data.fullName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            gender: data.gender || "",
            birthDate: data.dob || "",
            status: data.status || "ACTIVE",
            cumulativePoints: data.cumulativePoints || 0,
            roleId: data.roleId || null,
          });

          setEditAccountInfo({
            fullName: data.fullName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            gender: data.gender || "",
            birthDate: data.dob || "",
          });

          //dung voi useContext
          //   updateUser({
          //     id: data.id,
          //     fullName: data.fullName,
          //     email: data.email,
          //     phoneNumber: data.phoneNumber,
          //     address: data.address,
          //     gender: data.gender,
          //     birthDate: data.dob,
          //   });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUser();
  }, [userId, user?.email]); // Thêm user?.email để tránh loop khi user object thay đổi

  // Đồng bộ form chỉnh sửa với thông tin tài khoản hiện có để hỗ trợ chỉnh sửa trực tiếp
  useEffect(() => {
    setEditAccountInfo({
      fullName: accountInfo.fullName || "",
      email: accountInfo.email || "",
      phoneNumber: accountInfo.phoneNumber || "",
      address: accountInfo.address || "",
      gender:
        typeof accountInfo.gender === "boolean"
          ? accountInfo.gender
          : accountInfo.gender || "",
      birthDate: accountInfo.birthDate || "",
    });
  }, [
    accountInfo.fullName,
    accountInfo.email,
    accountInfo.phoneNumber,
    accountInfo.address,
    accountInfo.gender,
    accountInfo.birthDate,
  ]);


  const handleEditInputChange = e => {
    const { name, value } = e.target;
    setEditAccountInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAccountInfo = async () => {
    // Kiểm tra xem có resolvedUserId không
    if (!resolvedUserId) {
      alert(
        "Không thể cập nhật thông tin. Vui lòng đăng nhập lại để lấy thông tin đầy đủ."
      );
      return;
    }

    try {
      const updatedData = {
        ...accountInfo, // giữ lại các trường khác như status, cumulativePoints, role, v.v.
        fullName: editAccountInfo.fullName,
        email: editAccountInfo.email,
        phoneNumber: editAccountInfo.phoneNumber,
        address: editAccountInfo.address,
        gender: editAccountInfo.gender,
        dob: editAccountInfo.birthDate,
      };

      console.log("=== SAVING ACCOUNT INFO ===");
      console.log("Updating user ID:", resolvedUserId);
      console.log("Updated data:", updatedData);

      const response = await updateUserById(resolvedUserId, updatedData);

      if (response) {
        alert("Thông tin tài khoản đã được cập nhật thành công!");
        setAccountInfo(updatedData);
        console.log("Account info updated successfully, local state updated");

        // Cập nhật UserContext một cách an toàn - chỉ cập nhật các trường cần thiết
        // và không thay đổi id để tránh trigger useEffect
        setTimeout(() => {
          updateUser({
            ...user,
            fullName: updatedData.fullName,
            phoneNumber: updatedData.phoneNumber,
            address: updatedData.address,
            gender: updatedData.gender,
            // Không cập nhật email và id để tránh conflict
          });
        }, 100);
      } else {
        alert("Có lỗi xảy ra khi cập nhật thông tin.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin tài khoản:", error);
      alert("Lỗi khi cập nhật thông tin.");
    }
  };

  // Hiển thị thông báo nếu người dùng chưa đăng nhập hoặc không có userId hợp lệ
  if (!user || (!userId && userId !== "find_by_email") || userId === 1) {
    return (
      <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-md shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {!user ? "Vui lòng đăng nhập" : "Lỗi thông tin người dùng"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!user
              ? "Bạn cần đăng nhập để xem thông tin tài khoản."
              : "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại."}
          </p>
          <Link
            to={path.login}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            {!user ? "Đăng nhập" : "Đăng nhập lại"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 mb-6">
          <Link to={path.home} className="text-blue-500 hover:underline">
            {t("product.home")}
          </Link>
          {" / "}
          {location.pathname === path.profile && "My Dashboard"}
        </p>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          My Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-md shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4"></h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("account-info")}
                  className={`block text-left w-full text-blue-500 font-medium hover:text-blue-700 ${
                    activeTab === "account-info" ? "font-bold" : ""
                  }`}
                >
                  {t("account.account_information")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("address-book")}
                  className={`block text-left w-full text-gray-700 hover:text-gray-900 ${
                    activeTab === "address-book"
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                >
                  {t("account.address_book")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("my-orders")}
                  className={`block text-left w-full text-gray-700 hover:text-gray-900 ${
                    activeTab === "my-orders" ? "font-bold text-blue-600" : ""
                  }`}
                >
                  {t("account.my_orders")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`block text-left w-full text-gray-700 hover:text-gray-900 ${
                    activeTab === "favorites" ? "font-bold text-blue-600" : ""
                  }`}
                >
                  {t("account.favourite_products")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("order-tracking")}
                  className={`block text-left w-full text-gray-700 hover:text-gray-900 ${
                    activeTab === "order-tracking"
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                >
                  {t("account.order_tracking")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("my-discounts")}
                  className={`block text-left w-full text-gray-700 hover:text-gray-900 ${
                    activeTab === "my-discounts"
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                >
                  {t("account.my_discounts") || "Mã giảm giá"}
                </button>
              </li>
            </ul>

            <div className="mt-6 bg-gray-100 rounded-md p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {t("product.compare_products")}
              </h3>
              <p className="text-gray-500 text-sm">
                {t("account.you_have_no_items")}
              </p>
            </div>

            <div className="mt-4 bg-gray-100 rounded-md p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {t("common.my_wish_list")}
              </h3>
              <p className="text-gray-500 text-sm">
                {t("common.you_have_no_items")}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-white rounded-md shadow-md p-6">
            {activeTab === "account-info" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {t("account.account_information")}
                </h2>

                {/* Contact Information - Inline editable form */}
                <div className="mb-6 border-b pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("account.full_name")}
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={editAccountInfo.fullName}
                        onChange={handleEditInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("cart.email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editAccountInfo.email}
                        onChange={handleEditInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("account.phone_number")}
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={editAccountInfo.phoneNumber}
                        onChange={handleEditInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("account.address")}
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={editAccountInfo.address}
                        onChange={handleEditInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("account.gender") || "Giới tính"}
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={editAccountInfo.gender}
                        onChange={e =>
                          setEditAccountInfo(prev => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="birthDate"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        {t("account.birth_date") || "Ngày sinh"}
                      </label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={(editAccountInfo.birthDate || "").slice(0, 10)}
                        onChange={handleEditInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      className={`px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 cursor-pointer ${
                        resolvedUserId
                          ? "bg-gradient-to-r from-black via-gray-900 to-purple-950 hover:opacity-90 focus:ring-purple-950"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      onClick={handleSaveAccountInfo}
                      disabled={!resolvedUserId}
                    >
                      {t("common.save")}
                    </button>

                    <div className="mt-2">
                      <button
                        className={`text-sm font-medium flex items-center gap-2 ${
                          resolvedUserId
                            ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={handleOpenChangePasswordModal}
                        disabled={!resolvedUserId}
                      >
                        {t("account.change_password")}
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isChangePasswordModalOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Expandable form section */}
                      {isChangePasswordModalOpen && resolvedUserId && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6 transition-all duration-300 ease-in-out">
                          <h3 className="text-base font-medium text-gray-900 mb-4">{t("account.i_mt_khu")}</h3>
                          
                          <div className="space-y-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t("account.mt_khu_hin_ti")}</label>
                              <input
                                type="password"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition bg-white"
                                placeholder="Nhập mật khẩu hiện tại"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t("account.mt_khu_mi")}</label>
                              <input
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition bg-white"
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t("account.xc_nhn_mt_khu")}</label>
                              <input
                                type="password"
                                name="confirmNewPassword"
                                value={confirmNewPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-950 focus:border-purple-950 transition bg-white"
                                placeholder="Nhập lại mật khẩu mới"
                              />
                            </div>
                          </div>

                          {changePasswordError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                              <p className="text-red-700 text-sm">{changePasswordError}</p>
                            </div>
                          )}

                          {changePasswordSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                              <p className="text-green-700 text-sm">{t("account.i_mt_khu_thnh")}</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              onClick={handleChangePasswordSubmit}
                              className="px-6 py-2 bg-gradient-to-r from-black via-gray-900 to-purple-950 text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
                            >
                              {t("account.lu_thay_i")}
                            </button>
                            <button
                              onClick={handleCloseChangePasswordModal}
                              className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!resolvedUserId && (
                      <p className="text-sm text-orange-600">
                        Một số chức năng bị hạn chế do không tìm thấy ID người
                        dùng.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "my-orders" &&
              (!resolvedUserId ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {t("account.my_orders")}
                  </h2>
                  <p className="text-gray-500">
                    Không thể hiển thị đơn hàng. Vui lòng đăng nhập lại để lấy
                    thông tin đầy đủ.
                  </p>
                </div>
              ) : (
                <UserOrders userId={resolvedUserId} />
              ))}

            {activeTab === "favorites" &&
              (!resolvedUserId ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {t("account.favourite_products")}
                  </h2>
                  <p className="text-gray-500">
                    Không thể hiển thị danh sách yêu thích. Vui lòng đăng nhập
                    lại để lấy thông tin đầy đủ.
                  </p>
                </div>
              ) : (
                <UserFavorites userId={resolvedUserId} />
              ))}

            {activeTab === "order-tracking" &&
              (!resolvedUserId ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {t("account.order_tracking")}
                  </h2>
                  <p className="text-gray-500">
                    Không thể hiển thị theo dõi đơn hàng. Vui lòng đăng nhập lại
                    để lấy thông tin đầy đủ.
                  </p>
                </div>
              ) : (
                <OrderTracking
                  userId={resolvedUserId}
                  onNavigateToTracking={navigateToOrderTracking}
                />
              ))}

            {activeTab === "address-book" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {t("account.address_book")}
                </h2>
                <p className="text-gray-500">
                  Tính năng sổ địa chỉ đang được phát triển...
                </p>
              </div>
            )}

            {activeTab === "my-discounts" &&
              (!resolvedUserId ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {t("account.my_discounts") || "Mã giảm giá của tôi"}
                  </h2>
                  <p className="text-gray-500">
                    Không thể hiển thị mã giảm giá. Vui lòng đăng nhập lại để
                    lấy thông tin đầy đủ.
                  </p>
                </div>
              ) : (
                <UserDiscounts userId={resolvedUserId} />
              ))}
          </div>
        </div>
      </div>

      <Support></Support>
    </div>
  );
}

export default UserProfile;
