# 🚀 Quick Reference - JWT Authentication System

## 📌 TL;DR - Những Điều Quan Trọng Nhất

### Backend Roles → Frontend Roles
```
ROLE_ADMIN           → admin
ROLE_CUSTOMER        → customer  
ROLE_CUSTOMER_SERVICE → customer_service
ROLE_GUEST           → guest
```

### Protected Routes
```jsx
// Chỉ admin
<ProtectedRoute requiredRoles={["admin"]}>

// Chỉ cần login (bất kỳ role)
<ProtectedRoute requireAuth={true} requiredRoles={[]}>

// Public (không cần gì)
<Route path="/about" element={<About />} />
```

### Check Role trong Component
```jsx
const { isAdmin, isCustomer } = useContext(UserContext);

if (isAdmin()) {
  // Show admin features
}
```

### Decode JWT Token
```jsx
import { decodeJWT, getRoleFromToken } from '../utils/jwtUtils';

const token = localStorage.getItem('authToken');
const role = getRoleFromToken(token); // 'admin', 'customer', etc.
```

---

## 🔐 Authentication Quick Commands

### Login
```javascript
// Handled by LoginServices.jsx
const user = await loginContext({ email, password });
// Returns: { email, role, fullName, id, ... }
```

### Logout
```javascript
// Handled by UserContext
const { logout } = useContext(UserContext);
await logout();
// Clears: authToken, refreshToken, user from localStorage
```

### Check if Logged In
```javascript
const { user } = useContext(UserContext);
if (user) {
  // User is logged in
}
```

---

## 🎭 Role Checking

### In Components
```jsx
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const MyComponent = () => {
  const { isAdmin, isCustomer, getUserRole } = useContext(UserContext);
  
  return (
    <div>
      {isAdmin() && <AdminButton />}
      {isCustomer() && <CustomerButton />}
      
      {/* Or check directly */}
      {getUserRole() === 'admin' && <AdminPanel />}
    </div>
  );
};
```

### In Routes
```jsx
// Admin only
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>

// Any authenticated user
<Route 
  path="/minigame" 
  element={
    <ProtectedRoute requireAuth={true} requiredRoles={[]}>
      <MinigamePage />
    </ProtectedRoute>
  } 
/>
```

---

## 🛠️ Debug Tools

### Console Commands
```javascript
// View current token
inspectToken()

// Clear all auth
resetAuth()

// Check current user
const { user } = useContext(UserContext);
console.log(user);
```

### Console Logs to Look For
```
🛡️ ProtectedRoute Debug Info    - Route protection logs
🔐 === LOGIN REQUEST ===        - Login attempt
✅ Saving accessToken           - Token saved
🎭 User role from token         - Role extracted
❌ Access denied                - Permission denied
```

---

## 📝 Common Tasks

### 1. Protect a New Route
```jsx
// In AppRouter.jsx
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute requiredRoles={["admin"]}>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

### 2. Check Permission Before Action
```jsx
const handlePurchase = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    toast.error('Vui lòng đăng nhập!');
    navigate('/login');
    return;
  }
  
  // Proceed with purchase
};
```

### 3. Show/Hide UI Based on Role
```jsx
const { isAdmin } = useContext(UserContext);

return (
  <nav>
    <Link to="/">Home</Link>
    {isAdmin() && <Link to="/admin">Admin</Link>}
  </nav>
);
```

### 4. Get Current User Info
```jsx
const { user } = useContext(UserContext);

console.log(user.email);      // user@example.com
console.log(user.role);        // 'admin', 'customer', etc.
console.log(user.fullName);    // John Doe
console.log(user.id);          // 1
```

---

## 🐛 Troubleshooting

### Token không được lưu
```javascript
// Check console for:
"✅ Saving accessToken to localStorage"

// If not found, check backend response structure
console.log(response.data.result);
```

### Redirect loop
```javascript
// Check if token is expired
import { isTokenExpired } from '../utils/jwtUtils';
const token = localStorage.getItem('authToken');
console.log('Token expired?', isTokenExpired(token));
```

### Access denied dù đã login
```javascript
// Check role
const { getUserRole } = useContext(UserContext);
console.log('Current role:', getUserRole());
console.log('Required roles:', requiredRoles);
```

### 401 Error on API call
```javascript
// Token might be expired or invalid
// Check axios interceptor logs in console
// Solution: Clear auth and login again
resetAuth();
```

---

## 📊 Response Structures

### Login Response (Backend)
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

### User Data (Frontend)
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "customer",
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "address": "123 Street",
  "gender": "MALE",
  "dob": "1990-01-01",
  "status": "ACTIVE",
  "cumulativePoints": 100
}
```

### JWT Payload (Decoded)
```json
{
  "sub": "user@example.com",
  "iat": 1699000000,
  "exp": 1699003600,
  "jti": "uuid-string",
  "type": "ACCESS_TOKEN",
  "scope": "ROLE_CUSTOMER"
}
```

---

## ⚡ Performance Tips

1. **Don't decode token on every render**
   ```jsx
   // ❌ BAD
   const MyComponent = () => {
     const role = getRoleFromToken(localStorage.getItem('authToken'));
     // ...
   };
   
   // ✅ GOOD
   const { getUserRole } = useContext(UserContext);
   ```

2. **Use context for user state**
   ```jsx
   // ✅ GOOD - Uses cached value
   const { user } = useContext(UserContext);
   ```

3. **Batch role checks**
   ```jsx
   const { isAdmin, isCustomer } = useContext(UserContext);
   const isAdminUser = isAdmin();
   const isCustomerUser = isCustomer();
   // Use isAdminUser and isCustomerUser multiple times
   ```

---

## 🔗 Related Files

- `src/utils/jwtUtils.js` - JWT utility functions
- `src/services/LoginServices.jsx` - Login/logout logic
- `src/context/UserContext.jsx` - User state management
- `src/services/ProtectedRoute.jsx` - Route protection
- `src/router/AppRouter.jsx` - Route definitions
- `src/custom/axios.jsx` - HTTP interceptors

---

## 📚 Documentation Links

- [Full Guide](./AUTHENTICATION_GUIDE.md)
- [Changes Summary](./CHANGES_SUMMARY.md)
- [Test Cases](./src/utils/testCases.js)

---

**Last Updated:** November 4, 2025  
**Version:** 2.0.0
