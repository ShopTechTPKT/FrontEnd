"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import path from "../../constant/path";
import DiscountModal from "../../components/DiscountModal";
import CartItem from "../../components/ShoppingCard/ShoppingCardItem";
import PaymentCartItem from "../../components/ShoppingCard/PaymentCartItem";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  loadCartItems,
} from "../../utils/redux/cartSlice";
import notify from "../../utils/notify";
import { addOrder } from "../../utils/redux/orderSlice";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../components/ConfirmModal";
import {
  createOrder,
  createOrderDetail,
  createOrderWithDetails,
  deleteOrder,
  updatePlaysAllowedAfterOrder,
} from "../../apis/orderApi";
import {
  getUserActiveDiscounts,
  useUserDiscount as callUseUserDiscount,
  getActiveDiscounts,
} from "../../apis/discountApi";
const ShoppingCardItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const { user } = useContext(UserContext);
  // Helper: lấy userId từ localStorage
  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;
    } catch (e) {
      console.error("Lỗi khi đọc user từ localStorage:", e);
      return null;
    }
  };
  const { carts, cartSummary, loading } = useSelector(state => state.cart);
  // Get cart items from Redux
  const reduxCartItems = useSelector(state => state.cart || []);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [enteredDiscountCode, setEnteredDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentOptionsOpen, setIsPaymentOptionsOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [note, setNote] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const [discounts, setDiscounts] = useState([]);
  const [selectedPaymentName, setSelectedPaymentName] = useState("");

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const selectedShippingCost = Number.parseInt(
    localStorage.getItem("selectedShippingCost") || "0"
  );
  useEffect(() => {
    // Lấy userId từ nhiều nguồn (giống UserDiscounts component)
    const userId = user?.id || user?.customerID || user?.customerId || user?.userId || getCurrentUserId();
    
    if (isDiscountModalOpen && userId) {
      console.log("🔍 Loading discounts for userId:", userId);
      getUserActiveDiscounts(userId).then(data => {
        console.log("📦 User Discounts from DB:", data);
        
        // Đảm bảo data là mảng
        let discountArray = [];
        if (Array.isArray(data)) {
          discountArray = data;
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.content)) {
            discountArray = data.content;
          } else if (Array.isArray(data.data)) {
            discountArray = data.data;
          } else if (Array.isArray(data.discounts)) {
            discountArray = data.discounts;
          }
        }
        
        // Helper function để check expired
        const isExpired = (expiresAt) => {
          if (!expiresAt) return false;
          try {
            return new Date(expiresAt) < new Date();
          } catch (e) {
            console.error("Error parsing expiresAt:", expiresAt, e);
            return false;
          }
        };
        
        console.log("🔍 Raw discountArray items:", discountArray);
        console.log("🔍 First item structure:", discountArray[0]);
        
        // Filter chỉ lấy những discount chưa dùng và chưa hết hạn
        // UserDiscountDTO đã flatten, không có nested discount object
        const unusedDiscounts = discountArray.filter(ud => {
          const notUsed = !ud.isUsed;
          const hasDiscountInfo = ud.discountId && ud.discountName;
          const notExpired = !isExpired(ud.expiresAt);
          
          console.log(`🔍 Filtering item ${ud.id}:`, {
            notUsed,
            hasDiscountInfo,
            notExpired,
            isUsed: ud.isUsed,
            expiresAt: ud.expiresAt,
            discountId: ud.discountId,
            discountName: ud.discountName
          });
          
          return notUsed && hasDiscountInfo && notExpired;
        });
        
        console.log("📊 Total unused and active vouchers:", unusedDiscounts?.length || 0);
        if (unusedDiscounts && unusedDiscounts.length > 0) {
          console.log("🎫 First voucher:", unusedDiscounts[0]);
        } else {
          console.log("⚠️ No valid vouchers found. All items:", discountArray.map(ud => ({
            id: ud.id,
            isUsed: ud.isUsed,
            expiresAt: ud.expiresAt,
            discountId: ud.discountId,
            discountName: ud.discountName
          })));
        }
        
        // Map UserDiscountDTO thành format discount để hiển thị
        // DTO đã flatten, dùng trực tiếp các field
        const formattedDiscounts = unusedDiscounts.map(ud => ({
          id: ud.id, // userDiscountId để dùng khi mark as used
          discountId: ud.discountId,
          name: ud.discountName,
          code: ud.discountName,
          description: ud.discountDescription,
          discountRate: ud.discountRate,
          type: ud.discountType,
          endDate: ud.expiresAt,
          isUsed: ud.isUsed,
          expiresAt: ud.expiresAt,
          point: ud.point, // Thêm point nếu có
        }));
        
        setDiscounts(formattedDiscounts);
      }).catch(error => {
        console.error("❌ Error fetching user discounts:", error);
        setDiscounts([]);
      });
    } else if (isDiscountModalOpen && !userId) {
      // Nếu chưa đăng nhập thì không có discount
      console.log("⚠️ No userId found, skipping discount load");
      setDiscounts([]);
    }
  }, [isDiscountModalOpen, user]);
  const availablePaymentMethods = [
    { id: 4, name: "Apple Pay", value: "ONLINE_BANKING" },
    { id: 7, name: "Cash", value: "CASH_ON_DELIVERY" },
    { id: 1, name: "Credit Card", value: "ONLINE_BANKING" },
    { id: 5, name: "Cryptocurrency", value: "ONLINE_BANKING" },
    { id: 6, name: "Gift Card", value: "ONLINE_BANKING" },
    { id: 3, name: "Google Pay", value: "ONLINE_BANKING" },
    { id: 2, name: "PayPal", value: "ONLINE_BANKING" },
    { id: 8, name: "VNPAY", value: "ONLINE_BANKING" },
  ];
  useEffect(() => {
    // Chỉ cần dispatch, thunk `loadCartItems` sẽ tự xử lý
    // việc lấy userId hoặc load guest cart.
    dispatch(loadCartItems());
  }, [dispatch]);
  // Fetch customer info from localStorage
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem("customerInfo");
    if (savedCustomerInfo) setCustomerInfo(JSON.parse(savedCustomerInfo));
  }, []);

  // Fetch mock vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const { mockVouchers } = await import("../../mockData/vouchers");
        setVouchers(mockVouchers);
      } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
      }
    };
    fetchVouchers();
  }, []);

  // Logic to read cart from sessionStorage, keyed by user/guest ID
  const sessionCart = (() => {
    try {
      const s = sessionStorage.getItem("cart");
      if (!s) return [];
      const obj = JSON.parse(s);
      // Determine user key: from URL param > from localStorage user > 'guest'
      const userKey =
        queryUserId ||
        JSON.parse(localStorage.getItem("user") || "null")?.id ||
        "guest";
      return (obj[userKey] && obj[userKey].carts) || [];
    } catch (e) {
      console.error("Lỗi khi đọc cart từ sessionStorage:", e);
      return [];
    }
  })();

  // Final cart items: prefer Redux, fallback to sessionStorage
  const cartItems =
    Array.isArray(carts) && carts.length > 0 ? carts : sessionCart;
  // Calculations
  const taxRate = 0.1;
  const subtotal = cartSummary?.totalAmount || 0 + selectedShippingCost;
  const tax = subtotal * taxRate;
  const orderTotalBeforeDiscount = subtotal + selectedShippingCost + tax;

  // Tính discount amount từ selectedDiscount
  const discountAmount = selectedDiscount
    ? selectedDiscount.type === "PERCENTAGE"
      ? orderTotalBeforeDiscount * (selectedDiscount.discountRate || 0)
      : selectedDiscount.type === "FIXED_AMOUNT"
      ? selectedDiscount.discountRate || 0
      : (orderTotalBeforeDiscount * (selectedDiscount.discount || 0)) / 100
    : discountValue;

  const discountedTotal = Math.max(
    orderTotalBeforeDiscount - discountAmount,
    0
  );

  const formatCurrency = value =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Confirm Modal Handlers
  const openConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action || (() => {}));
    setConfirmOpen(true);
  };

  const handleConfirmOk = () => {
    setConfirmOpen(false);
    try {
      confirmAction();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper: normalize code for comparison (remove spaces/punctuation, lowercase)
  const normalizeCode = str =>
    (str || "")
      .toLowerCase()
      .replace(/[%\s_-]+/g, "")
      .trim();

  // Apply discount by typing code/name (only one discount allowed)
  const handleApplyDiscountCode = async () => {
    if (selectedDiscount) {
      return notify.warn("Bạn chỉ được áp dụng 1 mã giảm giá tại một thời điểm.");
    }
    const code = enteredDiscountCode.trim().toLowerCase();
    const normalizedInput = normalizeCode(code);
    if (!code) {
      return notify.error("Vui lòng nhập mã giảm giá.");
    }

    // Luồng mã tri ân công khai, không phụ thuộc vào danh sách voucher user
    let availableDiscounts = [];
    try {
      const data = await getActiveDiscounts();

      // Normalize response to array (supports content/data/discounts)
      let discountArray = [];
      if (Array.isArray(data)) discountArray = data;
      else if (data && typeof data === "object") {
        if (Array.isArray(data.content)) discountArray = data.content;
        else if (Array.isArray(data.data)) discountArray = data.data;
        else if (Array.isArray(data.discounts)) discountArray = data.discounts;
      }

      availableDiscounts = discountArray.map(d => ({
        id: d.id,
        discountId: d.discountId || d.id,
        name: d.discountName || d.name || `Discount #${d.discountId || d.id}`,
        code:
          d.discountCode ||
          d.code ||
          d.discountName ||
          `DISCOUNT${d.discountId || d.id}`,
        discountName: d.discountName || d.name,
        discountCode: d.discountCode || d.code,
        description: d.discountDescription || d.description,
        discountRate: d.discountRate,
        type: d.discountType || d.type,
        endDate: d.expiresAt || d.endDate,
      }));
    } catch (err) {
      console.error("❌ Error fetching public discounts on apply:", err);
      return notify.error("Không thể áp dụng mã giảm giá lúc này.");
    }

    const matchDiscount = list =>
      (list || []).find(d => {
        const candidates = [
          normalizeCode(d.name),
          normalizeCode(d.code),
          normalizeCode(d.discountName),
          normalizeCode(d.discountCode),
          normalizeCode(`discount${d.discountId || d.id || ""}`),
          normalizeCode(`voucher${d.discountId || d.id || ""}`),
          normalizeCode(`${d.discountId || ""}`),
        ].filter(Boolean);
        return (
          candidates.includes(normalizedInput) ||
          candidates.some(c => c && c.replace(/%/g, "") === normalizedInput) ||
          candidates.some(c => normalizedInput && c && c.includes(normalizedInput))
        );
      });

    const found = matchDiscount(availableDiscounts);

    if (!found) {
      console.warn("⚠️ Không tìm thấy mã trong danh sách khả dụng", {
        input: normalizedInput,
        availableDiscounts,
      });
      return notify.error("Mã giảm giá không hợp lệ hoặc không khả dụng.");
    }

    // Giữ selectedDiscount nhưng không đánh dấu voucher user là đã dùng
    setSelectedDiscount({ ...found, source: "manual" });

    let amount = 0;
    if (found.type === "PERCENTAGE") {
      amount = orderTotalBeforeDiscount * (found.discountRate || 0);
    } else if (found.type === "FIXED_AMOUNT") {
      amount = found.discountRate || 0;
    } else if (found.discount) {
      amount = (orderTotalBeforeDiscount * found.discount) / 100;
    }
    setDiscountValue(amount);
    setEnteredDiscountCode("");
  };

  const handleConfirmCancel = () => setConfirmOpen(false);

  // Cart Action Handlers
  const handleContinueShopping = () => navigate("/");
  const handleClearCart = () =>
    openConfirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?", () => {
      const userId = getCurrentUserId();
      dispatch(clearCart(userId));
      setDiscountValue(0);
      setAppliedVoucher(null);
    });
  const handleRemoveItem = productId => {
    const userId = getCurrentUserId();
    openConfirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?", () =>
      dispatch(removeFromCart({ userId, productId }))
    );
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const userId = getCurrentUserId();
    dispatch(
      updateCartItemQuantity({ userId, productId, quantity: newQuantity })
    );
  };

  // Voucher/Discount Handlers
  const handleSelectVoucherFromList = voucher => {
    if (voucher && (voucher.discountRate || voucher.discount)) {
      let discountAmount = 0;

      // Xử lý theo type từ DB
      if (voucher.type === "PERCENTAGE") {
        // discountRate là số thập phân (0.3 = 30%)
        discountAmount = orderTotalBeforeDiscount * voucher.discountRate;
      } else if (voucher.type === "FIXED_AMOUNT") {
        // discountRate là số tiền cố định
        discountAmount = voucher.discountRate;
      } else if (voucher.discount) {
        // Fallback cho mock data cũ
        discountAmount = (orderTotalBeforeDiscount * voucher.discount) / 100;
      }

      setDiscountValue(discountAmount);
      setAppliedVoucher({
        id: voucher.id || voucher.voucherID,
        code: voucher.name || voucher.code,
        discount: voucher.discountRate || voucher.discount,
        type: voucher.type,
        expired: false,
      });
    } else {
      setDiscountValue(0);
      setAppliedVoucher(null);
    }
    setShowDiscountModal(false);
  };

  const handleCloseDiscountModal = () => setShowDiscountModal(false);

  // Payment Handlers
  const handlePaymentMethodSelect = method => {
    setPaymentMethod(method.value); // lưu enum cho backend
    setSelectedPaymentName(method.name); // hiển thị tên đẹp cho UI
    setIsPaymentOptionsOpen(false);
  };

  const getDisplayedPaymentMethods = () => {
    // Logic for Cash on Delivery/Pickup based on shipping cost
    if (selectedShippingCost === 0) {
      return availablePaymentMethods.filter(
        method => method.name !== "Cash on Delivery"
      );
    }
    return availablePaymentMethods.filter(
      method => method.name !== "Cash on Pickup"
    );
  };

  const selectedPaymentMethodDisplay =
    selectedPaymentName || "Select Payment Method";

  const handleCompleteOrder = async () => {
    console.log("=== DEBUG AUTHENTICATION ===");
    console.log("User object:", user);
    console.log("User type:", typeof user);
    console.log("User exists:", !!user);
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("localStorage authToken:", localStorage.getItem("authToken"));
    console.log("customerInfo", customerInfo);

    // Check if user is authenticated
    if (!user) {
      console.log("❌ No user found - redirecting to login");
      notify.error("Vui lòng đăng nhập để đặt hàng!");
      navigate("/login");
      return;
    }

    console.log("✅ User authenticated, proceeding with order...");

    if (carts.length === 0) {
      notify.error("Giỏ hàng trống!");
      return;
    }
    if (!paymentMethod) {
      notify.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    openConfirm("Bạn có chắc chắn muốn thanh toán đơn hàng này?", async () => {
      let createdOrderId = null;

      try {
        // CÁCH 1: Sử dụng createOrderWithDetails (TỐT NHẤT - Atomic transaction)
        // Tất cả order + order details được tạo trong 1 transaction
        // Nếu có sản phẩm không đủ hàng, toàn bộ sẽ rollback tự động

        // Lấy userId đúng cách từ localStorage
        const userId = getCurrentUserId();
        if (!userId) {
          alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          return;
        }

        const orderWithDetailsData = {
          userId: Number(userId),
          deliveryAddress: customerInfo.fullAddress,
          paymentMethod: paymentMethod,
          totalPrice: discountedTotal,
          paymentFee: selectedShippingCost,
          status: "PROCESSING",
          notes: note,
          createdDate: new Date().toLocaleDateString("en-CA"),
          items: carts.map(item => {
            const productId =
              item.productId || item.product?.id || item.productID || item.id;
            return {
              productId: Number(productId),
              amount: Number(item.quantity),
              unitPrice: parseFloat(String(item.price || item.unitPrice || 0)),
            };
          }),
        };

        console.log("Creating order with details:", orderWithDetailsData);
        const orderResponse = await createOrderWithDetails(
          orderWithDetailsData
        );
        createdOrderId = orderResponse.id || orderResponse.orderID;

        // ✅ Lưu orderID vào localStorage để hiển thị ở trang thank you
        localStorage.setItem("lastOrderId", String(createdOrderId));

        // ✅ Đặt hàng thành công (userId đã được khai báo ở trên)
        dispatch(clearCart(userId));

        // ⭐ Thêm 3 lượt chơi cho user khi tạo order thành công (COD)
        updatePlaysAllowedAfterOrder(userId)
          .then(updatedUser => {
            console.log("✅ Updated plays allowed for COD:", updatedUser);
            if (updatedUser) {
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          })
          .catch(err => console.error("Failed to update plays:", err));

        navigate(path.thank_you_shopping);
        notify.success("Đặt hàng thành công!");
      } catch (err) {
        console.error("Order error:", err);

        // Handle authentication errors
        if (err.response?.status === 401) {
          notify.error("Vui lòng đăng nhập để đặt hàng!");
          navigate("/login");
          return;
        }

        // Handle insufficient stock error (ErrorCode: 1302)
        const errorCode = err.response?.data?.code;
        const errorMessage = err.response?.data?.message || err.message;

        if (errorCode === 1302) {
          // INSUFFICIENT_STOCK
          notify.error(
            "⚠️ Rất tiếc! Sản phẩm trong giỏ hàng của bạn không đủ số lượng tồn kho. " +
              "Vui lòng kiểm tra lại số lượng sản phẩm và thử lại.",
            { autoClose: 5000 }
          );
          // Refresh cart để cập nhật số lượng tồn kho
          // Có thể thêm logic reload products ở đây
        } else if (errorCode === 1303) {
          // PRODUCT_OUT_OF_STOCK
          notify.error(
            "⚠️ Rất tiếc! Một số sản phẩm trong giỏ hàng đã hết hàng. " +
              "Vui lòng xóa sản phẩm đã hết hàng và thử lại.",
            { autoClose: 5000 }
          );
        } else if (errorCode === 1301) {
          // PRODUCT_NOT_FOUND
          notify.error(
            "⚠️ Một số sản phẩm không tồn tại. Vui lòng làm mới trang và thử lại.",
            { autoClose: 5000 }
          );
        } else {
          // Other errors
          notify.error(
            errorMessage || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
            { autoClose: 5000 }
          );
        }

        // Nếu đã tạo order nhưng chưa tạo order details (fallback cho cách cũ)
        // Thì xóa order đã tạo (trong trường hợp dùng cách cũ - không dùng nữa)
        if (createdOrderId) {
          try {
            await deleteOrder(createdOrderId);
            console.log("✅ Cleaned up order:", createdOrderId);
          } catch (cleanupError) {
            console.error("Failed to cleanup order:", cleanupError);
          }
        }
      }
    });
  };

  const handleVNPAYPayment = async e => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      notify.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    if (carts.length === 0) return notify.error("Giỏ hàng trống!");
    if (!customerInfo?.fullAddress)
      return notify.error("Thiếu địa chỉ giao hàng!");
    if (!paymentMethod)
      return notify.error("Vui lòng chọn phương thức thanh toán!");
    if (discountedTotal <= 0) return notify.error("Tổng tiền không hợp lệ!");

    try {
      // Debug: log cart structure
      console.log("🛒 Cart items:", carts);
      console.log("📦 First cart item:", carts[0]);

      // Chuẩn bị dữ liệu order để lưu vào sessionStorage (KHÔNG tạo order ngay)
      // Lấy userId đúng cách từ localStorage
      const userId = getCurrentUserId();
      if (!userId) {
        alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const orderWithDetailsData = {
        userId: Number(userId),
        deliveryAddress: customerInfo.fullAddress,
        paymentMethod: "ONLINE_BANKING", // Enum phía backend
        totalPrice: Number(discountedTotal),
        paymentFee: Number(selectedShippingCost),
        status: "PROCESSING",
        notes: note,
        usedPoint: 0,
        usedAt: null,
        createdDate: new Date().toLocaleDateString("en-CA"),
        items: carts.map(item => {
          // Try multiple possible field names for productId
          const productId =
            item.productId || item.product?.id || item.productID || item.id;
          console.log(`📝 Mapping item:`, {
            raw: item,
            extractedProductId: productId,
            quantity: item.quantity,
            price: item.price,
          });

          return {
            productId: Number(productId),
            amount: Number(item.quantity),
            unitPrice: parseFloat(String(item.price || item.unitPrice || 0)),
          };
        }),
      };

      console.log(
        "� Saving order data to sessionStorage for VNPAY:",
        orderWithDetailsData
      );

      // LƯU orderData vào sessionStorage để ThankForShopping sử dụng SAU khi VNPAY callback thành công
      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify(orderWithDetailsData)
      );

      // Lưu thông tin order hiển thị vào localStorage (không có orderID vì chưa tạo)
      const orderDisplayData = {
        orderDate: new Date().toISOString(),
        customer: customerInfo,
        items: carts,
        subtotal,
        tax,
        shippingCost: selectedShippingCost,
        discount: parseFloat(appliedVoucher?.discount) / 100 || 0,
        total: discountedTotal,
        paymentMethod: "VNPAY",
        shippingMethod:
          selectedShippingCost === 0
            ? "Pickup from store"
            : "Standard Shipping",
        status: "Processing",
        notes: note || null,
      };
      localStorage.setItem("orderDisplay", JSON.stringify(orderDisplayData));

      // Chuyển hướng sang trang thanh toán VNPAY KHÔNG tạo order trước
      // Sau khi thanh toán thành công, VNPAY sẽ redirect về: /thank_you_shopping?code=00&amount=...
      openConfirm("Bạn có chắc chắn muốn thanh toán qua VNPAY?", () => {
        // Tạo form để POST đến VNPAY demo
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "http://localhost:8889/demo/create_payment_url";

        // Thêm các field cần thiết
        const authToken = localStorage.getItem("authToken") || "";
        const fields = {
          amount: Math.round(discountedTotal),
          bankCode: "",
          language: "vn",
          orderType: "billpayment",
          orderInfo: `Thanh toan don hang ${Date.now()}`,
          returnUrl: `${window.location.origin}/thank_you_shopping`,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          authToken: authToken, // ⚡ Thêm token để gửi email
        };

        Object.keys(fields).forEach(key => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        console.log("🔄 Submitting VNPAY payment form:", fields);
        form.submit();
      });
    } catch (error) {
      console.error(
        "VNPAY Lỗi chi tiết:",
        error.response?.data || error.message
      );

      // Handle authentication errors
      if (error.response?.status === 401) {
        notify.error("Vui lòng đăng nhập để thanh toán!");
        navigate("/login");
        return;
      }

      // Handle insufficient stock error (ErrorCode: 1302)
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || error.message;

      if (errorCode === 1302) {
        // INSUFFICIENT_STOCK
        notify.error(
          "⚠️ Rất tiếc! Sản phẩm trong giỏ hàng của bạn không đủ số lượng tồn kho. " +
            "Vui lòng kiểm tra lại số lượng sản phẩm và thử lại.",
          { autoClose: 5000 }
        );
      } else if (errorCode === 1303) {
        // PRODUCT_OUT_OF_STOCK
        notify.error(
          "⚠️ Rất tiếc! Một số sản phẩm trong giỏ hàng đã hết hàng. " +
            "Vui lòng xóa sản phẩm đã hết hàng và thử lại.",
          { autoClose: 5000 }
        );
      } else if (errorCode === 1301) {
        // PRODUCT_NOT_FOUND
        notify.error(
          "⚠️ Một số sản phẩm không tồn tại. Vui lòng làm mới trang và thử lại.",
          { autoClose: 5000 }
        );
      } else {
        // Other errors
        notify.error(errorMessage || "Không thể xử lý thanh toán qua VNPAY!", {
          autoClose: 5000,
        });
      }
      // Note: VNPAY doesn't create order before payment, so no cleanup needed here
    }
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Link to={path.home} className="text-blue-500 hover:underline mr-1">
            {t("product.home")}
          </Link>
          <span className="mr-1">/</span>
          <Link to={path.card} className="text-blue-500 hover:underline mr-1">
            Shopping Cart
          </Link>
          <span className="mr-1">/</span>
          <span>{t("cart.purchase")}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 items-center">
          <div className=""></div>
          <div className="mt-4 flex items-center justify-center space-x-8">
            {/* Step 1: Shipping - completed */}
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                {t("payment.checkout.step_shipping")}
              </span>
            </div>

            {/* Divider line */}
            <div className="border-t-2 border-indigo-600 w-24"></div>

            {/* Step 2: Payment & Review - current step */}
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-semibold text-indigo-600">
                {t("payment.checkout.step_payment_review")}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {t("payment.checkout.complete_purchase")}
        </h1>

        {!customerInfo ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {t("payment.checkout.please_complete_shipping")}{" "}
                  <Link
                    to={path.shopping_card_checkout}
                    className="font-medium underline text-yellow-700 hover:text-yellow-600"
                  >
                    {t("payment.checkout.go_to_shipping")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {t("payment.payment_summary.title")}
                </h2>
                {carts.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    {t("cart.your_cart_is_empty")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carts.map((item, index) => (
                      <PaymentCartItem 
                        key={item.productID || item.productId || item.product?.id || item.id || `cart-item-${index}`} 
                        item={item} 
                      />
                    ))}
                  </div>
                )}

                {/* Ẩn các nút Continue Shopping và Clear Cart ở trang payment */}
                <div className="flex justify-between mt-6 opacity-50 pointer-events-none">
                  <button
                    disabled
                    className="bg-gray-200 text-gray-700 py-2 px-6 rounded-xl cursor-not-allowed"
                  >
                    {t("cart.tip_tc_mua_sm")}
                  </button>
                  <button
                    disabled
                    className="bg-gray-800 text-white py-2 px-6 rounded-xl cursor-not-allowed"
                  >
                    {t("cart.xa_gi_hng")}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {t("payment.checkout.shipping_information")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t("cart.name")}</p>
                    <p className="font-medium">
                      {customerInfo.firstName} {customerInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("cart.email")}</p>
                    <p className="font-medium">{customerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("account.phone_number") || "Số điện thoại"}
                    </p>
                    <p className="font-medium">{customerInfo.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("account.address") || "Địa chỉ"}
                    </p>
                    <p className="font-medium">{customerInfo.fullAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {t("payment.payment_summary.title")}
                </h2>

                <div className="mb-4 relative">
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("payment.payment_summary.payment_method")}
                  </label>

                  <button
                    type="button"
                    id="paymentMethod"
                    className="w-full border rounded-md p-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setIsPaymentOptionsOpen(s => !s)}
                  >
                    {selectedPaymentName ||
                      t("payment.payment_summary.select_payment")}
                  </button>

                  {isPaymentOptionsOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 z-10">
                      {getDisplayedPaymentMethods().map(method => (
                        <button
                          key={method.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => handlePaymentMethodSelect(method)}
                        >
                          {method.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <DiscountModal
                  isOpen={isDiscountModalOpen}
                  onClose={() => setIsDiscountModalOpen(false)}
                  vouchers={discounts}
                  onSelectVoucher={async voucherCode => {
                    const selected = discounts.find(
                      v => v.name === voucherCode || v.code === voucherCode
                    );
                    
                    if (!selected) {
                      console.error("Voucher not found:", voucherCode);
                      return;
                    }

                    // Mark discount as used
                    if (selected.id) {
                      try {
                        await callUseUserDiscount(selected.id);
                        console.log("✅ Discount marked as used:", selected.id);
                        
                        // Remove discount from list (ẩn nó đi)
                        setDiscounts(prevDiscounts => 
                          prevDiscounts.filter(d => d.id !== selected.id)
                        );
                      } catch (error) {
                        console.error("Error marking discount as used:", error);
                        // Vẫn cho phép dùng discount nếu API fail
                      }
                    }

                    setSelectedDiscount(selected);
                    // Tính và set discount value theo type
                    if (selected) {
                      let amount = 0;
                      if (selected.type === "PERCENTAGE") {
                        amount =
                          orderTotalBeforeDiscount * selected.discountRate;
                      } else if (selected.type === "FIXED_AMOUNT") {
                        amount = selected.discountRate;
                      } else if (selected.discount) {
                        // Fallback cho mock data
                        amount =
                          (orderTotalBeforeDiscount * selected.discount) / 100;
                      }
                      setDiscountValue(amount);
                    }
                    setIsDiscountModalOpen(false);
                  }}
                />

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("order.subtotal")}</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("order.tax_10")}</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  {/*them field nhap note*/}
                  <div className="flex flex-col mt-2">
                    <label
                      htmlFor="orderNote"
                      className="text-gray-600 text-sm font-medium mb-1"
                    >
                      {t("payment.payment_summary.order_note")}
                    </label>
                    <textarea
                      id="orderNote"
                      rows={3}
                      placeholder={t(
                        "payment.payment_summary.order_note_placeholder"
                      )}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payment.payment_summary.discount_code")}
                    </label>

                    {/* Nhập mã giảm giá thủ công */}
                    {!selectedDiscount && (
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={enteredDiscountCode}
                          onChange={e => setEnteredDiscountCode(e.target.value)}
                          placeholder={t("payment.payment_summary.enter_discount_code") || "Nhập mã giảm giá"}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscountCode}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {t("payment.payment_summary.apply") || "Áp dụng"}
                        </button>
                      </div>
                    )}

                    {selectedDiscount ? (
                      <div className="flex justify-between items-center border border-green-200 rounded-lg p-3 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full text-white text-xs">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {selectedDiscount.name || selectedDiscount.code}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              {selectedDiscount.type === "PERCENTAGE"
                                ? `${(
                                    selectedDiscount.discountRate * 100
                                  ).toFixed(0)}% OFF`
                                : selectedDiscount.type === "FIXED_AMOUNT"
                                ? `${new Intl.NumberFormat("vi-VN").format(
                                    selectedDiscount.discountRate
                                  )} VND OFF`
                                : `${selectedDiscount.discount}% OFF`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDiscount(null);
                            setDiscountValue(0);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-md transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                        >
                          {t("payment.payment_summary.remove_discount")}
                        </button>
                      </div>
                    ) : (
                      <button
                        // **FIX: This is the click handler that opens the modal**
                        onClick={() => setIsDiscountModalOpen(true)}
                        className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                      >
                        {t("payment.payment_summary.select_discount")}
                      </button>
                    )}

                    {/* Discount amount row */}
                    {selectedDiscount && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-green-600 font-medium">
                          {selectedDiscount.type === "PERCENTAGE"
                            ? `${t(
                                "payment.payment_summary.discount_percentage"
                              )} (${(
                                selectedDiscount.discountRate * 100
                              ).toFixed(0)}%)`
                            : selectedDiscount.type === "FIXED_AMOUNT"
                            ? t("payment.payment_summary.discount_fixed")
                            : `${t(
                                "payment.payment_summary.discount_percentage"
                              )} (${selectedDiscount.discount}%)`}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          -{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(discountAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-4 border-t text-lg font-bold">
                    <span>{t("order.total")}</span>
                    <span className="text-indigo-600">
                      {formatCurrency(discountedTotal)}
                    </span>
                  </div>
                </div>

                {/* Hiển thị nút thanh toán dựa trên phương thức được chọn */}
                {!paymentMethod ? (
                  <button
                    className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-md mt-4 cursor-not-allowed"
                    disabled
                  >
                    {t("payment.buttons.select_payment_first")}
                  </button>
                ) : paymentMethod === "ONLINE_BANKING" &&
                  selectedPaymentName === "VNPAY" ? (
                  <button
                    className="w-full bg-yellow-400 text-black py-3 px-6 rounded-md mt-4 hover:bg-yellow-500 font-semibold"
                    onClick={handleVNPAYPayment}
                  >
                    {t("payment.buttons.pay_with_vnpay")}
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteOrder}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md mt-4 hover:bg-indigo-700 font-semibold"
                  >
                    {t("payment.buttons.complete_order")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={t("cart.checkout")}
        message={confirmMessage}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
      />
    </>
  );
};

export default ShoppingCardItem;
