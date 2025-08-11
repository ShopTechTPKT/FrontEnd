# 🔄 Migration Guide - Chuyển từ Hệ Thống Cũ sang JWT

## 📋 Tổng Quan

Hướng dẫn này giúp bạn hiểu những thay đổi và cách cập nhật code hiện có.

## 🔀 So Sánh: Cũ vs Mới

### Role Names

| Cũ | Mới | Lý Do |
|----|-----|-------|
| `manager` | `admin` | Phù hợp với backend `ROLE_ADMIN` |
| `employee` | `customer_service` | Rõ nghĩa hơn và match backend |
| `customer` | `customer` | Giữ nguyên |
| N/A | `guest` | Role mới cho user chưa đăng ký |

### Context Functions

| Cũ | Mới |
|----|-----|
| `isManager()` | `isAdmin()` |
| `isEmployee()` | `isCustomerService()` |
| `isCustomer()` | `isCustomer()` *(không đổi)* |
| N/A | `isGuest()` |

### ProtectedRoute Props

| Cũ | Mới | Thay Đổi |
|----|-----|-----------|
| `requiredRoles={["manager"]}` | `requiredRoles={["admin"]}` | Role name thay đổi |
| N/A | `requireAuth={true}` | Prop mới cho việc chỉ cần auth |

## 📝 Checklist Cập Nhật Code

### 1. Update Context Calls

```jsx
// ❌ CŨ
const { isManager, isEmployee } = useContext(UserContext);

if (isManager()) {
  // Admin logic
}

// ✅ MỚI
const { isAdmin, isCustomerService } = useContext(UserContext);

if (isAdmin()) {
  // Admin logic
}
```

### 2. Update Route Protection

```jsx
// ❌ CŨ
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={["manager"]}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>

// ✅ MỚI
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### 3. Update Role Checks in Components

```jsx
// ❌ CŨ
const userRole = getUserRole();
if (userRole === 'manager' || userRole === 'quản lý cửa hàng') {
  // Show admin UI
}

// ✅ MỚI
const { isAdmin } = useContext(UserContext);
if (isAdmin()) {
  // Show admin UI
}
```

### 4. Update String Comparisons

```jsx
// ❌ CŨ
if (user.position === 'manager') {
  // Logic
}

// ✅ MỚI
if (user.role === 'admin') {
  // Logic
}
```

### 5. Update User Object Access

```jsx
// ❌ CŨ
console.log(user.position); // undefined in new system

// ✅ MỚI
console.log(user.role); // 'admin', 'customer', etc.
```

## 🔍 Tìm và Thay Thế Toàn Bộ Project

### Trong VS Code

1. Press `Ctrl + Shift + F` (Windows) hoặc `Cmd + Shift + F` (Mac)
2. Tìm và thay thế:

```
Find: isManager\(\)
Replace: isAdmin()

Find: isEmployee\(\)
Replace: isCustomerService()

Find: requiredRoles={\["manager"\]}
Replace: requiredRoles={["admin"]}

Find: requiredRoles={\["employee"\]}
Replace: requiredRoles={["customer_service"]}

Find: user\.position
Replace: user.role

Find: 'manager'
Replace: 'admin' (⚠️ Check context first!)

Find: "manager"
Replace: "admin" (⚠️ Check context first!)
```

## 📂 Files Cần Kiểm Tra

### Priority 1 - Critical Files (ĐÃ CẬP NHẬT)
- ✅ `src/services/ProtectedRoute.jsx`
- ✅ `src/context/UserContext.jsx`
- ✅ `src/router/AppRouter.jsx`
- ✅ `src/services/LoginServices.jsx`
- ✅ `src/custom/axios.jsx`

### Priority 2 - Component Files (CẦN KIỂM TRA)
- `src/components/Header.jsx`
- `src/components/Footer.jsx`
- `src/pages/AdminLayout/AdminLayout.jsx`
- `src/pages/Profile/Profile.jsx`

### Priority 3 - Other Pages (CẦN KIỂM TRA)
- All files in `src/pages/*/` that might check user role
- All files in `src/components/*/` that might check user role

## 🔎 Cách Tìm Code Cần Update

### 1. Tìm tất cả isManager/isEmployee
```bash
# In terminal
grep -r "isManager\|isEmployee" src/
```

### 2. Tìm tất cả requiredRoles với "manager"
```bash
grep -r 'requiredRoles.*manager' src/
```

### 3. Tìm tất cả user.position
```bash
grep -r "user\.position\|user\['position'\]" src/
```

## ⚠️ Breaking Changes

### 1. Role Values Changed
```javascript
// CŨ: Backend trả về Vietnamese
user.position = "Quản lý cửa hàng"

// MỚI: Frontend parse từ JWT scope
user.role = "admin" // from ROLE_ADMIN
```

### 2. Context Function Names Changed
```javascript
// CŨ
const { isManager, isEmployee } = useContext(UserContext);

// MỚI
const { isAdmin, isCustomerService } = useContext(UserContext);
```

### 3. User Object Structure
```javascript
// CŨ
{
  position: "manager",
  userRole: "Quản lý"
}

// MỚI
{
  role: "admin", // Extracted from JWT
  email: "admin@example.com" // From JWT sub claim
}
```

## 🧪 Testing Migration

### Step 1: Clear Old Data
```javascript
localStorage.clear();
sessionStorage.clear();
// Refresh page
```

### Step 2: Test Login
```javascript
// Login với admin account
// Check console logs:
console.log('Role from JWT token:', getRoleFromToken(token));
// Should show: "admin"
```

### Step 3: Test Route Access
```
1. Test /admin access as admin → ✅ Should work
2. Test /admin access as customer → ❌ Should redirect
3. Test /minigame without login → ❌ Should redirect to login
4. Test /minigame after login → ✅ Should work
```

### Step 4: Test UI Elements
```
1. Check navbar for admin buttons (admin only)
2. Check profile page shows correct info
3. Check role-based features work correctly
```

## 📊 Migration Checklist

### Backend
- [ ] Backend JWT working correctly
- [ ] Backend returns proper role in scope claim
- [ ] Backend endpoints accessible with JWT

### Frontend Core
- [x] jwtUtils.js created
- [x] LoginServices.jsx updated
- [x] UserContext.jsx updated
- [x] ProtectedRoute.jsx updated
- [x] AppRouter.jsx updated
- [x] axios.jsx updated

### Frontend Components (TODO)
- [ ] Header.jsx - Update role checks
- [ ] Footer.jsx - Update role checks
- [ ] AdminLayout.jsx - Update role checks
- [ ] Profile.jsx - Update user.position → user.role
- [ ] Any component with isManager/isEmployee
- [ ] Any component checking user.position

### Testing
- [ ] Login as admin works
- [ ] Login as customer works
- [ ] Admin can access /admin
- [ ] Customer cannot access /admin
- [ ] Unauthenticated users redirected to /login
- [ ] Minigame requires authentication
- [ ] Checkout requires authentication
- [ ] Logout clears all data
- [ ] Token expiration handled correctly

### Documentation
- [x] AUTHENTICATION_GUIDE.md created
- [x] CHANGES_SUMMARY.md created
- [x] QUICK_REFERENCE.md created
- [x] MIGRATION_GUIDE.md created (this file)

## 🚨 Common Issues After Migration

### Issue 1: "Cannot read property 'role' of undefined"
**Cause:** Trying to access user.role before user is loaded  
**Fix:**
```jsx
const { user } = useContext(UserContext);

// ❌ BAD
console.log(user.role); // Error if user is null

// ✅ GOOD
console.log(user?.role); // Safe access
```

### Issue 2: "isManager is not a function"
**Cause:** Using old function name  
**Fix:**
```jsx
// ❌ CŨ
const { isManager } = useContext(UserContext);

// ✅ MỚI
const { isAdmin } = useContext(UserContext);
```

### Issue 3: Role check always fails
**Cause:** Comparing wrong values  
**Fix:**
```jsx
// ❌ BAD
if (user.role === 'ROLE_ADMIN') // Wrong - this is backend value

// ✅ GOOD
if (user.role === 'admin') // Correct - frontend parsed value
```

### Issue 4: Redirect loop after login
**Cause:** Token expired or invalid  
**Fix:**
```javascript
// Clear everything and try again
resetAuth();
// Refresh page
// Login again
```

## 💡 Tips

1. **Use Search & Replace carefully** - Always check context before replacing
2. **Test after each change** - Don't change everything at once
3. **Check console logs** - They have emoji markers to help debug
4. **Keep old code commented** - In case you need to rollback
5. **Update gradually** - Start with critical files, then move to components

## 📞 Need Help?

Check these resources:
- [Full Guide](./AUTHENTICATION_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Changes Summary](./CHANGES_SUMMARY.md)
- [Test Cases](./src/utils/testCases.js)

---

**Created:** November 4, 2025  
**Version:** 2.0.0  
**Last Updated:** November 4, 2025
