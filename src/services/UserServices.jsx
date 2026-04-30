import axiosInstance from "../custom/axios";

/**
 * Hàm lấy thông tin tài khoản người dùng từ API
 * @returns {Promise<Object>} Dữ liệu tài khoản người dùng hoặc lỗi
 */
export const getUserAccount = async () => {
  try {
    const response = await axiosInstance.get("/getUserAccount");
    return response.data.DT[0];
  } catch (error) {
    console.error("Error fetching user account:", error);
    return null;
  }
};
export const getUserByEmail = async email => {
  try {
    const response = await axiosInstance.get(`/users/email/${email}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error?.message);
    return null;
  }
};
/**
 * Hàm lấy thông tin người dùng theo email và password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Dữ liệu người dùng hoặc lỗi
 */

export const getUserByEmailAndPassword = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      "/getUserByEmailAndPassword",
      {
        email,
        password,
      }
    );
    return response.data.DT[0];
  } catch (error) {
    console.error("Error fetching user by email and password:", error);
    return null;
  }
};

//GET USER BY ID
/**
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const getUserById = async id => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

//UPDATE USER BY ID
/**
 * @param {number} id
 * @param {object} userData
 * @returns {Promise<Object|null>}
 */
export const updateUserById = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};