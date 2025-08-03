# Hệ Thống Giỏ Hàng Backend

## Tổng Quan

Hệ thống giỏ hàng đã được cập nhật để sử dụng backend API thay vì localStorage/sessionStorage. Điều này giúp:

- Lưu trữ giỏ hàng trên server
- Đồng bộ giỏ hàng giữa các thiết bị
- Hỗ trợ nhiều người dùng
- Dữ liệu không bị mất khi đóng trình duyệt

## Cấu Trúc Backend

### Entities

1. **Cart** - Giỏ hàng của người dùng
   - `id`: ID giỏ hàng
   - `userId`: ID người dùng
   - `totalAmount`: Tổng tiền
   - `totalItems`: Tổng số sản phẩm
   - `createdAt`, `updatedAt`: Thời gian tạo/cập nhật

2. **CartItem** - Sản phẩm trong giỏ hàng
   - `id`: ID cart item
   - `cartId`: ID giỏ hàng
   - `productId`: ID sản phẩm
   - `quantity`: Số lượng
   - `unitPrice`: Giá đơn vị
   - `totalPrice`: Tổng giá
   - `createdAt`, `updatedAt`: Thời gian tạo/cập nhật

### API Endpoints

#### Cart API (`/api/cart`)

- `GET /api/cart/user/{userId}` - Lấy giỏ hàng theo user ID
- `GET /api/cart/user/{userId}/items` - Lấy danh sách sản phẩm trong giỏ hàng
- `POST /api/cart/user/{userId}/add` - Thêm sản phẩm vào giỏ hàng
- `PUT /api/cart/user/{userId}/update` - Cập nhật số lượng sản phẩm
- `DELETE /api/cart/user/{userId}/remove` - Xóa sản phẩm khỏi giỏ hàng
- `DELETE /api/cart/user/{userId}/clear` - Xóa toàn bộ giỏ hàng
- `GET /api/cart/user/{userId}/summary` - Lấy tóm tắt giỏ hàng

#### CartItem API (`/api/cart-items`)

- `GET /api/cart-items` - Lấy tất cả cart items
- `GET /api/cart-items/{id}` - Lấy cart item theo ID
- `GET /api/cart-items/cart/{cartId}` - Lấy cart items theo cart ID
- `POST /api/cart-items` - Tạo cart item mới
- `PUT /api/cart-items/{id}` - Cập nhật cart item
- `DELETE /api/cart-items/{id}` - Xóa cart item theo ID
- `DELETE /api/cart-items/cart/{cartId}` - Xóa tất cả cart items theo cart ID

## Cấu Trúc Frontend

### Redux Store

```javascript
// cartSlice.jsx
const initialState = {
  carts: [],           // Danh sách sản phẩm trong giỏ hàng
  cartSummary: null,   // Tóm tắt giỏ hàng (tổng tiền, tổng số lượng)
  loading: false,      // Trạng thái loading
  error: null         // Lỗi nếu có
};
```

### Async Thunks

- `loadCartItems(userId)` - Tải giỏ hàng từ backend
- `addToCart({userId, productId, quantity})` - Thêm sản phẩm vào giỏ hàng
- `updateCartItemQuantity({userId, productId, quantity})` - Cập nhật số lượng
- `removeFromCart({userId, productId})` - Xóa sản phẩm khỏi giỏ hàng
- `clearCart(userId)` - Xóa toàn bộ giỏ hàng

### Components

1. **ShoppingCart** - Trang giỏ hàng chính
2. **CartDropdown** - Dropdown giỏ hàng trong header
3. **AddToCartButton** - Nút thêm vào giỏ hàng
4. **useCart Hook** - Hook để quản lý giỏ hàng

## Cách Sử Dụng

### 1. Thêm sản phẩm vào giỏ hàng

```javascript
import { useDispatch } from 'react-redux';
import { addToCart } from '../utils/redux/cartSlice';

const dispatch = useDispatch();
const userId = getCurrentUserId(); // Lấy từ localStorage

// Thêm sản phẩm
dispatch(addToCart({ 
  userId, 
  productId: 123, 
  quantity: 2 
}));
```

### 2. Cập nhật số lượng

```javascript
import { updateCartItemQuantity } from '../utils/redux/cartSlice';

// Cập nhật số lượng (nếu quantity <= 0 sẽ tự động xóa)
dispatch(updateCartItemQuantity({ 
  userId, 
  productId: 123, 
  quantity: 5 
}));
```

### 3. Xóa sản phẩm

```javascript
import { removeFromCart } from '../utils/redux/cartSlice';

// Xóa sản phẩm
dispatch(removeFromCart({ 
  userId, 
  productId: 123 
}));
```

### 4. Sử dụng Hook

```javascript
import { useCart } from '../hooks/useCart';

const MyComponent = () => {
  const userId = getCurrentUserId();
  const {
    cartItems,
    cartSummary,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart(userId);

  // Sử dụng các function và state
};
```

## Tính Năng Đặc Biệt

### 1. Tự động xóa khi quantity = 0

Khi cập nhật số lượng về 0 hoặc âm, sản phẩm sẽ tự động bị xóa khỏi giỏ hàng.

### 2. Tính toán tổng tiền tự động

Backend tự động tính toán và cập nhật:
- `totalPrice` cho mỗi CartItem
- `totalAmount` và `totalItems` cho Cart

### 3. Đồng bộ real-time

Mọi thay đổi trong giỏ hàng đều được lưu vào database ngay lập tức.

### 4. Xử lý lỗi

- Hiển thị loading state khi đang xử lý
- Hiển thị error message nếu có lỗi
- Fallback về dữ liệu cũ nếu API fail

## Migration từ localStorage

Hệ thống cũ sử dụng localStorage/sessionStorage đã được thay thế hoàn toàn. Tất cả dữ liệu giỏ hàng giờ đây được lưu trữ trên backend và đồng bộ qua API.

## Lưu Ý

1. **User Authentication**: Cần đăng nhập để sử dụng giỏ hàng
2. **Data Format**: Dữ liệu từ backend có cấu trúc khác với localStorage cũ
3. **Error Handling**: Luôn kiểm tra error state và hiển thị thông báo phù hợp
4. **Performance**: Sử dụng loading state để cải thiện UX

## Testing

Để test hệ thống:

1. Đăng nhập với user có ID trong database
2. Thêm sản phẩm vào giỏ hàng
3. Kiểm tra dữ liệu trong database
4. Refresh trang và kiểm tra giỏ hàng vẫn còn
5. Test các chức năng: thêm, sửa, xóa, clear cart
