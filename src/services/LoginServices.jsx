import axiosInstance from "../custom/axios";
import { decodeJWT, getRoleFromToken, getEmailFromToken } from "../utils/jwtUtils";

// Error Message Helpers

const parseErrorMessage = (error) => {
  let errorMessage = "Đăng nhập thất bại";
  const errorData = error.response?.data;
  const status = error.response?.status;
  const contentType = error.response?.headers?.["content-type"];

  if (!errorData) {
    if (!error.response) return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    if (status === 401) return "Email hoặc mật khẩu không chính xác";
    if (status === 404) return "Email không tồn tại trong hệ thống";
    if (status === 403) return "Tài khoản đã bị khóa";
    if (status === 500) return "Lỗi hệ thống, vui lòng thử lại sau";
    return errorMessage;
  }

  // Spring Boot might return HTML error page
  if (contentType && contentType.includes("text/html")) {
    if (status === 401) return "Email hoặc mật khẩu không chính xác";
    if (status === 404) return "Email không tồn tại trong hệ thống";
    if (status === 403) return "Tài khoản đã bị khóa";
    return errorMessage;
  }

  if (typeof errorData === "string") {
    if (errorData.trim().startsWith("<")) {
      if (status === 401) return "Email hoặc mật khẩu không chính xác";
      if (status === 404) return "Email không tồn tại trong hệ thống";
      return errorMessage;
    }
    return translateErrorMessage(errorData);
  }

  const backendMessage =
    errorData.message || errorData.error || errorData.msg || errorData.detail || errorData.error_description;

  if (backendMessage) errorMessage = translateErrorMessage(backendMessage);

  if (errorData.code) {
    const codeMessage = translateErrorCode(errorData.code);
    if (codeMessage) errorMessage = codeMessage;
  }

  if (errorMessage === "Đăng nhập thất bại") {
    if (status === 401) errorMessage = "Email hoặc mật khẩu không chính xác";
    if (status === 404) errorMessage = "Email không tồn tại trong hệ thống";
    if (status === 403) errorMessage = "Tài khoản đã bị khóa";
    if (status === 500) errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
  }

  return errorMessage;
};

const translateErrorMessage = (message) => {
  const msg = String(message).toLowerCase();

  if (
    msg.includes("user_not_existed") ||
    msg.includes("user not existed") ||
    msg.includes("user does not exist") ||
    msg.includes("not found") ||
    msg.includes("does not exist") ||
    msg.includes("no value present")
  ) {
    return "Email không tồn tại trong hệ thống";
  }
  if (
    msg.includes("bad credentials") ||
    msg.includes("invalid credentials") ||
    msg.includes("wrong password") ||
    msg.includes("incorrect password") ||
    msg.includes("authentication failed")
  ) {
    return "Email hoặc mật khẩu không chính xác";
  }
  if (msg.includes("unauthenticated") || msg.includes("unauthorized") || msg.includes("access denied")) {
    return "Thông tin đăng nhập không hợp lệ";
  }
  if (msg.includes("uncategorized") || msg.includes("authentication error") || msg === "error") {
    return "Email hoặc mật khẩu không chính xác";
  }

  return String(message).replace(/^Error:\s*/i, "").replace(/^Exception:\s*/i, "");
};

const translateErrorCode = (code) => {
  const errorCodeMap = {
    1001: "Invalid key",
    1002: "User already exists",
    1003: "Email không tồn tại trong hệ thống",
    1004: "Full name is required",
    1005: "Password is required",
    1006: "Mật khẩu xác nhận không khớp",
    1007: "Confirm password is required",
    1008: "Phone number is required",
    1009: "Số điện thoại không hợp lệ",
    1010: "Email is required",
    1011: "Email không hợp lệ",
    1012: "Email hoặc mật khẩu không chính xác",
    1110: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng tạo mới hoặc liên hệ số điện thoại 0901234567 để mở khóa.",
  };
  return errorCodeMap[code] || null;
};

// Login

export const loginContext = async (credentials) => {
  try {
    const loginPayload = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await axiosInstance.post("/auth/login", loginPayload);

    if (response.status === 200 && response.data) {
      const result = response.data.result || response.data;
      const accessToken = result.accessToken || result.token;
      const refreshToken = result.refreshToken || result.refresh_token;

      if (!accessToken) {
        throw new Error("Không nhận được token từ server");
      }

      localStorage.setItem("authToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const decoded = decodeJWT(accessToken);
      const userRole = getRoleFromToken(accessToken);
      const userEmail = getEmailFromToken(accessToken);

      const userData = {
        email: userEmail,
        role: userRole,
        fullName: userEmail,
      };

      // Fetch full user details from backend
      try {
        const userResponse = await axiosInstance.get("/users/email/" + userEmail);
        const fullUserData = userResponse.data.result || userResponse.data;
        if (fullUserData) {
          Object.assign(userData, {
            id: fullUserData.id,
            fullName: fullUserData.fullName,
            phoneNumber: fullUserData.phoneNumber,
            address: fullUserData.address,
            gender: fullUserData.gender,
            dob: fullUserData.dob,
            status: fullUserData.status,
            cumulativePoints: fullUserData.cumulativePoints,
            numberOfGamesPlayed: fullUserData.numberOfGamesPlayed,
            numberOfPlaysAllowed: fullUserData.numberOfPlaysAllowed,
          });
        }
      } catch (userError) {
        console.warn("Could not fetch full user details:", userError.message);
      }

      return userData;
    }

    throw new Error("Login failed");
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    const errorMessage = parseErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Logout

export const logoutContext = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      await axiosInstance.post("/auth/logout");
    }
  } catch (error) {
    console.error("Logout error:", error.message);
  } finally {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
};

// Register

export const registerUser = async (userData) => {
  try {
    const registerPayload = {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    };

    const response = await axiosInstance.post("/users/register", registerPayload);

    if (response.status === 200 && response.data) {
      const result = response.data.result || response.data;
      return { success: true, data: result };
    }

    throw new Error("Registration failed");
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    const errorData = error.response?.data;
    let errorMessage = "Đăng ký thất bại";

    if (errorData?.message) {
      const m = errorData.message;
      if (m === "USER_EXISTED" || m.includes("already exists")) errorMessage = "Email đã được đăng ký";
      else if (m === "PASSWORD_MISMATCH" || m.includes("do not match")) errorMessage = "Mật khẩu xác nhận không khớp";
      else if (m === "EMAIL_INVALID" || m.includes("Email format")) errorMessage = "Email không hợp lệ";
      else if (m === "EMAIL_REQUIRED" || m.includes("Email is required")) errorMessage = "Vui lòng nhập email";
      else if (m === "PASSWORD_REQUIRED") errorMessage = "Vui lòng nhập mật khẩu";
      else if (m === "CONFIRM_PASSWORD_REQUIRED") errorMessage = "Vui lòng nhập xác nhận mật khẩu";
      else if (m === "FULLNAME_REQUIRED") errorMessage = "Vui lòng nhập họ tên";
      else if (m === "PHONE_REQUIRED") errorMessage = "Vui lòng nhập số điện thoại";
      else if (m === "PHONE_INVALID") errorMessage = "Số điện thoại không hợp lệ";
      else errorMessage = m;
    }

    throw new Error(errorMessage);
  }
};

// Misc

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await axiosInstance.get("/auth/me");
    if (response.status === 200 && response.data) return response.data;
    throw new Error("Failed to get user data");
  } catch (error) {
    console.error("Get current user error:", error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    return null;
  }
};

export const hasRole = (user, role) => {
  if (!user || !user.position) return false;
  return user.position.toLowerCase() === role.toLowerCase();
};

export const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
