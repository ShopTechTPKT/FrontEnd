# 💬 Customer Service Dashboard - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Trang **Customer Service Dashboard** được thiết kế để nhân viên hỗ trợ khách hàng có thể:
- ✅ Chat real-time với khách hàng
- ✅ Đặt lịch hẹn nhanh trong khi chat
- ✅ Xem thông tin khách hàng
- ✅ Quản lý nhiều cuộc chat cùng lúc

---

## 📍 Cách Truy Cập

### **1. URL Trực Tiếp**
```
http://localhost:5173/customer-service
```

### **2. Qua Menu Header**
1. Hover vào **"Support"** trên thanh navigation
2. Click **"💬 Customer Service"** (mục cuối cùng)

---

## 🎨 Giao Diện Layout

### **Layout 2 Cột (50/50):**

```
┌─────────────────────────────────────────────────────────┐
│            Hero Section (Purple Gradient)               │
│  💬 Customer Service Dashboard + Stats                  │
└─────────────────────────────────────────────────────────┘
        ▼                                ▼
┌──────────────────────────┐  ┌───────────────────────────┐
│   CHATBOX REAL-TIME      │  │   FORM ĐẶT LỊCH TO        │
│   (Bên Trái - 800px)     │  │   (Bên Phải - 800px)      │
│                          │  │                           │
│  • Customer Header       │  │  • Header với info        │
│  • Quick Info Cards      │  │  • Tên khách hàng         │
│  • Message History       │  │  • Số điện thoại          │
│  • Typing Indicator      │  │  • Email                  │
│  • Message Input         │  │  • Chọn dịch vụ (5)      │
│                          │  │  • Ngày hẹn               │
│  • Chat List (dưới)      │  │  • Giờ hẹn                │
│                          │  │  • Ghi chú                │
│                          │  │  • Button xác nhận        │
│                          │  │                           │
│                          │  │  • Quick Actions (dưới)   │
└──────────────────────────┘  └───────────────────────────┘
```

---

## 💬 CHATBOX REAL-TIME (Bên Trái)

### **Cấu trúc:**

#### 1️⃣ **Chat Header**
- 🎨 **Màu**: Purple gradient (from-purple-900 to-purple-950)
- 👤 **Avatar**: Chữ cái đầu của tên khách hàng
- 🟢 **Online Status**: "Đang online" với indicator xanh
- 🔧 **Tools Button**: Truy cập nhanh các công cụ

#### 2️⃣ **Customer Info Quick View**
```
┌─────────────────────────────────────────┐
│  📱 0901234567  │  📧 Email  │  📅 3 Apt │
└─────────────────────────────────────────┘
```
- Nền: Purple-50
- 3 cards: Phone, Email, Total Appointments
- Hover: Scale + shadow

#### 3️⃣ **Messages Area**
- **Nền**: Gray-50 (dễ nhìn)
- **Messages khách hàng**: 
  - Màu trắng + border gray
  - Alignment: Bên trái
  - Corner: Rounded-bl-none
  
- **Messages nhân viên**:
  - Purple gradient (from-purple-900 to-purple-950)
  - Alignment: Bên phải
  - Corner: Rounded-br-none

- **Typing Indicator**: 
  - 3 dots bounce animation
  - Hiện khi khách hàng đang gõ

#### 4️⃣ **Message Input**
- Paperclip icon: Đính kèm file
- Smile icon: Emoji
- Input field: TO, dễ gõ
- Send button: Purple gradient

#### 5️⃣ **Chat List (Dưới Chatbox)**
- Danh sách tất cả khách hàng đang chat
- Hiển thị: Avatar, tên, tin nhắn cuối, unread count
- Click để switch chat
- Selected chat: Purple background + border-left

---

## 📝 FORM ĐẶT LỊCH TO (Bên Phải)

### **Cấu trúc:**

#### 1️⃣ **Header**
- 🎨 **Màu**: Purple gradient
- 📅 **Icon**: Calendar Plus (size 4xl)
- 👤 **Info strip**: Hiển thị tên khách hàng đang chat

#### 2️⃣ **Form Fields (Scrollable - 800px height):**

**A. Thông Tin Khách Hàng:**
```jsx
✅ Tên Khách Hàng * (required)
   - Input TO (py-4, text-lg)
   - Icon: FaUser
   
✅ Số Điện Thoại * (required)
   - Input TO (py-4, text-lg)
   - Icon: FaPhone
   
📧 Email (optional)
   - Input TO (py-4, text-lg)
   - Icon: FaEnvelope
```

**B. Chọn Dịch Vụ * (required):**

5 dịch vụ hiển thị dạng **full-width cards**:
```
┌───────────────────────────────────────────┐
│  🔧  Laptop/PC Repair              ✓      │
├───────────────────────────────────────────┤
│  ⚡  Hardware Upgrade                     │
├───────────────────────────────────────────┤
│  💡  Tech Consultation                    │
├───────────────────────────────────────────┤
│  🛡️  Warranty Check                       │
├───────────────────────────────────────────┤
│  💻  Software Setup                       │
└───────────────────────────────────────────┘
```

- **Selected**: Purple gradient + checkmark
- **Hover**: Scale + shadow + purple border

**C. Ngày & Giờ Hẹn:**
```jsx
📅 Ngày Hẹn * (required)
   - Date picker TO
   - Min: Hôm nay
   
🕐 Giờ Hẹn * (required)
   - Select dropdown TO
   - 12 time slots: 09:00-15:30
```

**D. Ghi Chú:**
```jsx
💬 Ghi Chú (optional)
   - Textarea TO (5 rows)
   - Placeholder: "Ghi chú từ cuộc trò chuyện..."
```

#### 3️⃣ **Submit Button**
```jsx
┌──────────────────────────────────────────┐
│  ✓  Xác Nhận Đặt Lịch                    │
└──────────────────────────────────────────┘
```
- Purple gradient
- Font bold XL
- Icon: FaCheckCircle (3xl)
- Hover: Scale 105% + shadow-2xl

#### 4️⃣ **Quick Actions (Dưới Form)**
```
┌──────────────────┐  ┌──────────────────┐
│  📅 View Calendar│  │  🔧 Service Hist │
└──────────────────┘  └──────────────────┘
```

---

## 🎨 Color Scheme

### **Màu Chính:**
- **Nền**: Trắng (`bg-white`)
- **Header/Quan trọng**: Purple gradient (`from-purple-900 to-purple-950`)
- **Hover**: Purple-600 borders
- **Input Focus**: Purple-600 ring
- **Online Status**: Green-400
- **Unread Badge**: Red-500

### **Transitions:**
- Duration: 300ms
- Hover effects: scale, shadow, border-color
- Smooth animations

---

## 🔄 Workflow Sử Dụng

### **Quy Trình Chuẩn:**

1️⃣ **Nhân viên nhận chat mới**
   - Thông báo unread badge màu đỏ
   - Click vào chat từ Chat List

2️⃣ **Chat với khách hàng**
   - Gõ tin nhắn trong input box
   - Click send hoặc Enter
   - Xem typing indicator khi khách trả lời

3️⃣ **Khách hàng muốn đặt lịch**
   - Trong khi chat, nhân viên fill form bên phải
   - Auto-fill tên khách hàng từ chat header
   - Điền số điện thoại, email
   - Chọn dịch vụ
   - Chọn ngày & giờ hẹn
   - Thêm ghi chú từ cuộc chat

4️⃣ **Xác nhận đặt lịch**
   - Click "Xác Nhận Đặt Lịch"
   - Form reset
   - Tiếp tục chat hoặc chuyển sang khách khác

---

## ⚡ Tính Năng Nổi Bật

### **1. Real-time Chat**
- ✅ Message history đầy đủ
- ✅ Typing indicator
- ✅ Timestamp cho mỗi tin nhắn
- ✅ Avatar động từ tên khách hàng

### **2. Multi-tasking**
- ✅ Chat bên trái + Form bên phải
- ✅ Không cần switch tabs
- ✅ Vừa chat vừa điền form

### **3. Quick Access**
- ✅ Customer info cards (phone, email, appointments)
- ✅ Quick actions buttons
- ✅ Chat list để switch nhanh

### **4. Responsive UI**
- ✅ Fixed height (800px) để không bị scroll dài
- ✅ Scrollable messages & form
- ✅ Hover effects mượt mà
- ✅ Purple theme nhất quán

---

## 🧪 Testing Checklist

### **Chat Functionality:**
- [ ] Gõ tin nhắn và send
- [ ] Typing indicator xuất hiện
- [ ] Messages hiển thị đúng alignment
- [ ] Timestamp hiển thị chính xác
- [ ] Switch giữa các chat
- [ ] Unread badges update

### **Form Functionality:**
- [ ] Required fields validation
- [ ] Date picker (min = today)
- [ ] Service selection (radio-like)
- [ ] Submit và form reset
- [ ] Hover effects hoạt động
- [ ] Auto-focus on inputs

### **UI/UX:**
- [ ] Purple gradient hiển thị đúng
- [ ] Hover scale smooth
- [ ] Border color transitions
- [ ] Chat list selection highlight
- [ ] Quick actions hover
- [ ] Responsive trên mobile

---

## 📱 Responsive Breakpoints

```css
/* Desktop (1600px+): Full 2-column layout */
lg:grid-cols-2

/* Tablet (768px-1599px): Stacked layout */
md:grid-cols-1

/* Mobile (<768px): Stacked với full width */
grid-cols-1
```

---

## 🚀 Future Enhancements (Đề xuất)

1. **WebSocket Integration**
   - Real-time message sync
   - Push notifications

2. **File Upload**
   - Attach images trong chat
   - Document sharing

3. **Voice/Video Call**
   - Integration với calling API

4. **Chat History**
   - Load previous conversations
   - Search trong chat

5. **Auto-fill từ Chat**
   - Parse phone number từ tin nhắn
   - Detect service từ keywords

6. **Calendar Integration**
   - Show available slots
   - Prevent double-booking

---

## 📞 Contact & Support

Nếu có bug hoặc feature request, liên hệ team dev!

**Happy Chatting! 💬✨**
