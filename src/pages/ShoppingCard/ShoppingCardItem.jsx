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
import formatCurrency from "../../utils/formatCurrency";
import ConfirmModal from "../../components/ConfirmModal";
import {
  createOrder,
  createOrderDetail,
  createOrderWithDetails,
  deleteOrder,
  updatePlaysAllowedAfterOrder,
} from "../../apis/orderApi";
import {
  createMomoPayment,
  createVnpayPayment,
  createZalopayPayment,
} from "../../apis/paymentGatewayApi";
import {
  getUserActiveDiscounts,
  useUserDiscount as callUseUserDiscount,
} from "../../apis/discountApi";
import { redeemLoyaltyPoints } from "../../apis/loyaltyApi";
import { validateCouponCode } from "../../apis/couponApi";
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
  const [enteredDiscountCode, setEnteredDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
  const [loyaltyRedemption, setLoyaltyRedemption] = useState({
    points: 0,
    discountAmount: 0,
  });
  const [couponFeedback, setCouponFeedback] = useState({
    status: "idle",
    message: "",
  });

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const selectedShippingCost = Number.parseInt(
    localStorage.getItem("selectedShippingCost") || "0"
  );
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("loyaltyRedemption") || "{}");
      setLoyaltyRedemption({
        points: Number(saved?.points) || 0,
        discountAmount: Number(saved?.discountAmount) || 0,
      });
    } catch {
      setLoyaltyRedemption({ points: 0, discountAmount: 0 });
    }
  }, []);
  useEffect(() => {
    // Lấy userId từ nhiều nguồn (giống UserDiscounts component)
    const userId = user?.id || user?.customerID || user?.customerId || user?.userId || getCurrentUserId();
    
    if (isDiscountModalOpen && userId) {
      getUserActiveDiscounts(userId).then(data => {
        
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
        

        
        // Filter chỉ lấy những discount chưa dùng và chưa hết hạn
        // UserDiscountDTO đã flatten, không có nested discount object
        const unusedDiscounts = discountArray.filter(ud => {
          const notUsed = !ud.isUsed;
          const hasDiscountInfo = ud.discountId && ud.discountName;
          const notExpired = !isExpired(ud.expiresAt);
          

          
          return notUsed && hasDiscountInfo && notExpired;
        });
        

        
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

      setDiscounts([]);
    }
  }, [isDiscountModalOpen, user]);
  const availablePaymentMethods = [
    { id: 7, name: "Cash on Delivery", value: "CASH_ON_DELIVERY" },
    { id: 8, name: "VNPAY", value: "VNPAY" },
    { id: 9, name: "MoMo", value: "MOMO" },
    { id: 10, name: "ZaloPay", value: "ZALOPAY" },
    { id: 11, name: "Bank Transfer", value: "BANK_TRANSFER" },
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
    ? typeof selectedDiscount.fixedAmount === "number"
      ? selectedDiscount.fixedAmount
      : selectedDiscount.type === "PERCENTAGE"
      ? orderTotalBeforeDiscount * (selectedDiscount.discountRate || 0)
      : selectedDiscount.type === "FIXED_AMOUNT"
      ? selectedDiscount.discountRate || 0
      : (orderTotalBeforeDiscount * (selectedDiscount.discount || 0)) / 100
    : discountValue;

  const discountedTotal = Math.max(
    orderTotalBeforeDiscount - discountAmount - loyaltyRedemption.discountAmount,
    0
  );

  const formatCurrency = value =>
    formatCurrency(value);

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

  // Apply discount by backend coupon validator (blur/enter/click)
  const handleApplyDiscountCode = async () => {
    if (selectedDiscount) {
      return notify.warning(
        "Bạn chỉ được áp dụng 1 mã giảm giá tại một thời điểm."
      );
    }
    const code = enteredDiscountCode.trim();
    if (!code) {
      setCouponFeedback({ status: "idle", message: "" });
      return notify.error("Vui lòng nhập mã giảm giá.");
    }
    try {
      const data = await validateCouponCode({
        code,
        orderTotal: orderTotalBeforeDiscount,
      });

      if (!data?.valid) {
        setCouponFeedback({
          status: "error",
          message: data?.message || "Mã giảm giá không hợp lệ.",
        });
        return notify.error(data?.message || "Mã giảm giá không hợp lệ.");
      }

      const discountAmount = Number(data.discountAmount) || 0;
      const discountPercent = Number(data.discountPercent) || 0;
      const normalizedDiscountRate =
        discountPercent > 1 ? discountPercent / 100 : discountPercent;

      setSelectedDiscount({
        id: `coupon-${code.toUpperCase()}`,
        name: code.toUpperCase(),
        code: code.toUpperCase(),
        type: "PERCENTAGE",
        discountRate: normalizedDiscountRate,
        fixedAmount: discountAmount,
        source: "coupon",
      });
      setDiscountValue(discountAmount);
      setCouponFeedback({
        status: "success",
        message:
          data?.message ||
          `Áp dụng thành công: giảm ${formatCurrency(discountAmount
          )}đ`,
      });
      notify.success(
        data?.message ||
          `Áp dụng thành công: giảm ${formatCurrency(discountAmount
          )}đ`
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Không thể áp dụng mã giảm giá lúc này.";
      setCouponFeedback({ status: "error", message });
      notify.error(message);
    }
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


    // Check if user is authenticated
    if (!user) {

      notify.error("Vui lòng đăng nhập để đặt hàng!");
      navigate("/login");
      return;
    }



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


        const orderResponse = await createOrderWithDetails(
          orderWithDetailsData
        );
        createdOrderId = orderResponse.id || orderResponse.orderID;

        if (loyaltyRedemption.points > 0) {
          try {
            await redeemLoyaltyPoints({
              userId: Number(userId),
              points: Number(loyaltyRedemption.points),
              orderId: Number(createdOrderId),
            });
            localStorage.removeItem("loyaltyRedemption");
          } catch (redeemError) {
            console.error("Lỗi redeem loyalty points:", redeemError);
          }
        }

        // ✅ Lưu orderID vào localStorage để hiển thị ở trang thank you
        localStorage.setItem("lastOrderId", String(createdOrderId));

        // ✅ Đặt hàng thành công (userId đã được khai báo ở trên)
        dispatch(clearCart(userId));

        // ⭐ Thêm 3 lượt chơi cho user khi tạo order thành công (COD)
        updatePlaysAllowedAfterOrder(userId)
          .then(updatedUser => {

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
            "Rất tiếc! Sản phẩm trong giỏ hàng của bạn không đủ số lượng tồn kho. " +
              "Vui lòng kiểm tra lại số lượng sản phẩm và thử lại.",
            { autoClose: 5000 }
          );
          // Refresh cart để cập nhật số lượng tồn kho
          // Có thể thêm logic reload products ở đây
        } else if (errorCode === 1303) {
          // PRODUCT_OUT_OF_STOCK
          notify.error(
            "Rất tiếc! Một số sản phẩm trong giỏ hàng đã hết hàng. " +
              "Vui lòng xóa sản phẩm đã hết hàng và thử lại.",
            { autoClose: 5000 }
          );
        } else if (errorCode === 1301) {
          // PRODUCT_NOT_FOUND
          notify.error(
            "Một số sản phẩm không tồn tại. Vui lòng làm mới trang và thử lại.",
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
        paymentMethod: paymentMethod,
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


          return {
            productId: Number(productId),
            amount: Number(item.quantity),
            unitPrice: parseFloat(String(item.price || item.unitPrice || 0)),
          };
        }),
      };

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

      let gatewayRes;
      const gatewayPayload = {
        amount: Math.round(discountedTotal),
        orderInfo: `Thanh toan don hang ${Date.now()}`,
      };
      if (selectedPaymentName === "MoMo") {
        gatewayRes = await createMomoPayment(gatewayPayload);
      } else if (selectedPaymentName === "ZaloPay") {
        gatewayRes = await createZalopayPayment(gatewayPayload);
      } else {
        gatewayRes = await createVnpayPayment(gatewayPayload);
      }

      // Chuyển hướng sang trang thanh toán tương ứng mà không tạo order trước
      openConfirm(`Bạn có chắc chắn muốn thanh toán qua ${selectedPaymentName}?`, () => {
        setIsProcessingPayment(true);
        setTimeout(() => {
          window.location.href = gatewayRes.paymentUrl;
        }, 1500); // UI delay 1.5s then redirect
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
      {/* VNPAY Processing Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 mb-6 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-100 flex-shrink-0 relative">
              <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-spin text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chuyển hướng đến VNPAY...</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Vui lòng không đóng trình duyệt.<br/>Hệ thống đang thiết lập kết nối mã hóa an toàn.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-gray-50/90 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link
            to={path.home}
            className="text-violet-600 hover:text-violet-700 transition-colors"
          >
            {t("product.home")}
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to={path.card}
            className="text-violet-600 hover:text-violet-700 transition-colors"
          >
            {t("cart.title")}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-700">{t("cart.purchase")}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
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
            <span className="text-sm font-medium">
              {t("payment.checkout.step_shipping")}
            </span>
          </div>
          <div className="hidden h-px w-10 bg-gray-200 sm:block" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white shadow-sm">
              2
            </div>
            <span className="text-sm font-medium text-violet-700">
              {t("payment.checkout.step_payment_review")}
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
          {t("payment.checkout.complete_purchase")}
        </h1>

        {!customerInfo ? (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-4 sm:px-5"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-amber-900/90 leading-relaxed">
                  {t("payment.checkout.please_complete_shipping")}{" "}
                  <Link
                    to={path.shopping_card_checkout}
                    className="font-medium text-violet-700 underline decoration-violet-200 underline-offset-2 hover:text-violet-800"
                  >
                    {t("payment.checkout.go_to_shipping")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
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

              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
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
              <div className="sticky top-28 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
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
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-left text-sm text-gray-800 shadow-sm transition-colors hover:border-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    onClick={() => setIsPaymentOptionsOpen(s => !s)}
                  >
                    {selectedPaymentName ||
                      t("payment.payment_summary.select_payment")}
                  </button>

                  {isPaymentOptionsOpen && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                      {getDisplayedPaymentMethods().map(method => (
                        <button
                          key={method.id}
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-800"
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
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
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
                          onChange={e => {
                            setEnteredDiscountCode(e.target.value.toUpperCase());
                            if (couponFeedback.status !== "idle") {
                              setCouponFeedback({ status: "idle", message: "" });
                            }
                          }}
                          onBlur={() => {
                            if (enteredDiscountCode.trim()) handleApplyDiscountCode();
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyDiscountCode();
                            }
                          }}
                          placeholder={t("payment.payment_summary.enter_discount_code") || "Nhập mã giảm giá"}
                          className={`flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            couponFeedback.status === "success"
                              ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-300/30"
                              : couponFeedback.status === "error"
                              ? "border-red-300 focus:border-red-400 focus:ring-red-300/30"
                              : "border-gray-200 focus:border-violet-400 focus:ring-violet-400/30"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscountCode}
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                        >
                          {t("payment.payment_summary.apply") || "Áp dụng"}
                        </button>
                      </div>
                    )}
                    {couponFeedback.message && !selectedDiscount && (
                      <div
                        className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                          couponFeedback.status === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center">
                          {couponFeedback.status === "success" ? (
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                        <span>{couponFeedback.message}</span>
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
                                ? `${formatCurrency(selectedDiscount.discountRate
                                  )} VND OFF`
                                : `${selectedDiscount.discount}% OFF`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDiscount(null);
                            setDiscountValue(0);
                            setCouponFeedback({ status: "idle", message: "" });
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
                        className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-violet-200 hover:bg-violet-50/50"
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
                          {formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-4 border-t text-lg font-bold">
                    <span>{t("order.total")}</span>
                    <span className="text-violet-700 tabular-nums">
                      {formatCurrency(discountedTotal)}
                    </span>
                  </div>
                </div>

                {/* Hiển thị nút thanh toán dựa trên phương thức được chọn */}
                {!paymentMethod ? (
                  <button
                    className="mt-4 w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 px-6 text-sm font-medium text-gray-500"
                    disabled
                  >
                    {t("payment.buttons.select_payment_first")}
                  </button>
                ) : ["VNPAY", "MOMO", "ZALOPAY"].includes(paymentMethod) ? (
                  <button
                    className="mt-4 w-full rounded-xl bg-amber-400 py-3 px-6 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    onClick={handleVNPAYPayment}
                  >
                    {selectedPaymentName === "MoMo"
                      ? "Thanh toan voi MoMo"
                      : selectedPaymentName === "ZaloPay"
                      ? "Thanh toan voi ZaloPay"
                      : t("payment.buttons.pay_with_vnpay")}
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteOrder}
                    className="mt-4 w-full rounded-xl bg-violet-600 py-3 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                  >
                    {t("payment.buttons.complete_order")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
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


