# 🔐 Hướng Dẫn Hệ Thống Xác Thực và Phân Quyền

## 📋 Tổng Quan

Hệ thống frontend đã được cập nhật để tích hợp hoàn toàn với backend JWT authentication. Hệ thống hỗ trợ:

- ✅ JWT Token Authentication (Access Token & Refresh Token)
- ✅ Role-based Authorization (ADMIN, CUSTOMER, CUSTOMER_SERVICE, GUEST)
- ✅ Protected Routes
- ✅ Automatic Token Validation
- ✅ Secure Logout

## 🎭 Các Role Trong Hệ Thống

Backend định nghĩa 4 roles chính trong `PredefinedRole`:

| Role | Backend Value | Frontend Value | Mô tả |
|------|--------------|----------------|-------|
| Admin | `ROLE_ADMIN` | `admin` | Quản trị viên - Toàn quyền truy cập |
| Customer Service | `ROLE_CUSTOMER_SERVICE` | `customer_service` | Nhân viên CSKH |
| Customer | `ROLE_CUSTOMER` | `customer` | Khách hàng |
| Guest | `ROLE_GUEST` | `guest` | Khách (chưa đăng ký) |

## 🔑 JWT Token Structure

Backend tạo JWT với cấu trúc:

```json
{
  "sub": "user@example.com",      // Email của user
  "iat": 1699000000,               // Issued at (timestamp)
  "exp": 1699003600,               // Expiration time (timestamp)
  "jti": "uuid-string",            // JWT ID (unique)
  "type": "ACCESS_TOKEN",          // Token type
  "scope": "ROLE_CUSTOMER"         // User role
}
```

## 📁 Cấu Trúc Files Đã Cập Nhật

### 1. **`src/utils/jwtUtils.js`** (MỚI)
Utility functions để decode và validate JWT tokens:

```javascript
import { decodeJWT, getRoleFromToken, isTokenExpired } from '../utils/jwtUtils';

// Decode JWT token
const decoded = decodeJWT(token);

// Get user role from token
const role = getRoleFromToken(token); // Returns: 'admin', 'customer', etc.

// Check if token is expired
const expired = isTokenExpired(token); // Returns: true/false
```

### 2. **`src/services/LoginServices.jsx`** (CẬP NHẬT)
Xử lý login và decode JWT:

```javascript
// Login response từ backend
{
  "code": 1000,
  "message": null,
  "result": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

// Frontend tự động:
// 1. Lưu tokens vào localStorage
// 2. Decode JWT để lấy email và role
// 3. Fetch full user info từ /users/email/{email}
// 4. Trả về user object với đầy đủ thông tin
```

### 3. **`src/context/UserContext.jsx`** (CẬP NHẬT)
Context lưu trữ user state và role:

```javascript
const { 
  user,           // User object
  getUserRole,    // Get role: 'admin', 'customer', etc.
  isAdmin,        // Check if admin
  isCustomer,     // Check if customer
  isCustomerService, // Check if customer service
  login,          // Login function
  logout          // Logout function
} = useContext(UserContext);
```

### 4. **`src/services/ProtectedRoute.jsx`** (CẬP NHẬT)
Component bảo vệ routes theo role:

```javascript
// Bảo vệ route với role cụ thể
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminPage />
</ProtectedRoute>

// Chỉ yêu cầu đăng nhập (không check role)
<ProtectedRoute requireAuth={true} requiredRoles={[]}>
  <ProfilePage />
</ProtectedRoute>
```

### 5. **`src/router/AppRouter.jsx`** (CẬP NHẬT)
Routes với phân quyền:

- `/admin/*` - Chỉ cho **ADMIN**
- `/minigame` - Yêu cầu **đăng nhập**
- `/shopping_card_checkout` - Yêu cầu **đăng nhập**
- `/shopping_payment` - Yêu cầu **đăng nhập**
- `/profile` - Yêu cầu **đăng nhập**

## 🛡️ Cách Sử Dụng Protected Routes

### 1. Bảo vệ route theo role cụ thể

```jsx
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>
```

**Kết quả:**
- ✅ User có role `admin` → Truy cập được
- ❌ User có role `customer` → Redirect về `/`
- ❌ User chưa đăng nhập → Redirect về `/login`

### 2. Chỉ yêu cầu đăng nhập (bất kỳ role nào)

```jsx
<ProtectedRoute requireAuth={true} requiredRoles={[]}>
  <MinigamePage />
</ProtectedRoute>
```

**Kết quả:**
- ✅ User đã đăng nhập (bất kỳ role) → Truy cập được
- ❌ User chưa đăng nhập → Redirect về `/login`

### 3. Route công khai (không cần protection)

```jsx
<Route path="/about" element={<AboutPage />} />
```

## 🔄 Luồng Xác Thực

### Login Flow

```
1. User nhập email & password
   ↓
2. POST /api/auth/login
   ↓
3. Backend xác thực và trả về JWT tokens
   ↓
4. Frontend decode JWT để lấy email & role
   ↓
5. Fetch full user info từ /api/users/email/{email}
   ↓
6. Lưu user object vào UserContext & localStorage
   ↓
7. Redirect đến trang phù hợp với role
```

### Access Control Flow

```
1. User truy cập protected route
   ↓
2. ProtectedRoute kiểm tra:
   - User có đăng nhập? (check localStorage token)
   - Token có hết hạn? (check exp claim)
   - User có role phù hợp? (check scope claim)
   ↓
3. Nếu đủ điều kiện → Render component
   ↓
4. Nếu không đủ → Redirect về trang phù hợp
```

## 🚨 Xử Lý Errors

### 401 Unauthorized

Khi token hết hạn hoặc không hợp lệ:

```javascript
// axios interceptor tự động:
1. Clear tokens từ localStorage
2. Redirect về /login
3. Show toast notification
```

### 403 Forbidden

Khi user không có quyền truy cập:

```javascript
// ProtectedRoute tự động:
1. Kiểm tra role
2. Redirect về trang phù hợp:
   - admin → /admin
   - customer_service → /customer-service
   - customer/guest → /
```

## 📝 Backend Endpoints Reference

### Authentication

```
POST /api/auth/login
Body: { email, password }
Response: { code, message, result: { accessToken, refreshToken } }

POST /api/auth/logout
Header: Authorization: Bearer {token}
Response: void
```

### User Management

```
GET /api/users/email/{email}
Header: Authorization: Bearer {token}
Response: { code, message, result: UserDTO }

POST /api/users/register
Body: UserDTO
Response: { code, message, result: UserDTO }
```

## 🎯 Best Practices

### 1. Luôn kiểm tra quyền trước khi render component

```jsx
const MyComponent = () => {
  const { isAdmin } = useContext(UserContext);
  
  return (
    <div>
      {isAdmin() && <AdminButton />}
      <NormalButton />
    </div>
  );
};
```

### 2. Sử dụng ProtectedRoute cho sensitive pages

```jsx
// ❌ BAD - Không bảo vệ
<Route path="/admin" element={<AdminPage />} />

// ✅ GOOD - Có bảo vệ
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### 3. Check authentication trước khi gọi API

```jsx
const buyProduct = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    toast.error('Vui lòng đăng nhập để mua hàng!');
    navigate('/login');
    return;
  }
  
  // Proceed with purchase
  await axiosInstance.post('/orders', orderData);
};
```

## 🐛 Troubleshooting

### Issue: Token không được lưu sau khi login

**Giải pháp:**
1. Kiểm tra console logs xem có error không
2. Verify backend response có đúng structure không
3. Clear localStorage và thử lại

### Issue: Redirect loop giữa /login và protected route

**Giải pháp:**
1. Check token có hết hạn không (`isTokenExpired()`)
2. Verify role trong JWT có đúng không
3. Check ProtectedRoute có `requiredRoles` đúng không

### Issue: User có quyền nhưng vẫn bị block

**Giải pháp:**
1. Log ra `getUserRole()` để xem role hiện tại
2. So sánh với `requiredRoles` trong ProtectedRoute
3. Đảm bảo so sánh lowercase (`admin` vs `ADMIN`)

## 📞 Support

Nếu gặp vấn đề, check console logs với emoji để debug:

- 🛡️ ProtectedRoute logs
- 🔐 Authentication logs
- 🎭 Role checking logs
- ✅ Success logs
- ❌ Error logs

---

**Last Updated:** November 4, 2025
**Version:** 2.0.0
**Backend Compatible:** Spring Boot 3.x with JWT
