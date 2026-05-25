"use client";
import { useState, useContext, useEffect } from "react";
import Support from "../../components/Support/Support";
import { Link, useNavigate } from "react-router-dom";
import path from "../../constant/path";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../utils/redux/cartSlice";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";
import { UserContext } from "../../context/UserContext";
import AddressAutocomplete from "../../components/Orders/AddressAutocomplete";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import LoyaltyPointsPanel from "../../components/checkout/LoyaltyPointsPanel";
import { getLoyaltyBalance, redeemLoyaltyPoints } from "../../apis/loyaltyApi";
import { validateCouponCode } from "../../apis/couponApi";
import { previewOrder, createOrderWithDetails, updatePlaysAllowedAfterOrder } from "../../apis/orderApi";
import {
  createMomoPayment,
  createVnpayPayment,
  createZalopayPayment,
} from "../../apis/paymentGatewayApi";
import notify from "../../utils/notify";
import momoQr from "../../assets/images/products/product_qr_1.png";

const ONLINE_PAYMENT_METHODS = new Set(["vnpay", "momo", "zalopay"]);

const getUnitPriceFromCheckoutItem = item => {
  if (typeof item?.unitPrice === "number") return item.unitPrice;
  if (typeof item?.price === "number") return item.price;
  if (typeof item?.price === "string") {
    const parsed = parseFloat(item.price.replace(/[^\d.-]/g, "")) || 0;
    return parsed;
  }
  if (item?.totalPrice && item?.quantity) {
    const qty = Number(item.quantity) || 1;
    return Number(item.totalPrice) / qty;
  }
  return 0;
};

const mapCheckoutMethodToBackend = method => {
  switch (method) {
    case "vnpay": return "VNPAY";
    case "momo": return "MOMO";
    case "zalopay": return "ZALOPAY";
    case "bank": return "BANK_TRANSFER";
    case "cod": default: return "CASH_ON_DELIVERY";
  }
};

const OrderSummary = ({ cartItems, selectedShippingCost, loyaltyDiscount = 0, couponDiscount = 0, previewTotals = null }) => {
  const { t } = useTranslation();

  const getUnitPrice = item => {
    if (typeof item?.unitPrice === "number") return item.unitPrice;
    if (typeof item?.price === "string") {
      const parsed = parseFloat(item.price.replace(/[^\d.-]/g, "")) || 0;
      return parsed;
    }
    if (typeof item?.price === "number") return item.price;
    if (item?.totalPrice && item?.quantity) {
      const q = Number(item.quantity) || 1;
      return Number(item.totalPrice) / q;
    }
    return 0;
  };

  const subtotal = cartItems.reduce((total, item) => {
    const unit = getUnitPrice(item);
    const qty = Number(item?.quantity) || 1;
    return total + unit * qty;
  }, 0);
  const total = Math.max(0, subtotal + selectedShippingCost - loyaltyDiscount - couponDiscount);
  const displayedSubtotal = Number(previewTotals?.subtotal ?? subtotal);
  const displayedShipping = Number(previewTotals?.shipping ?? selectedShippingCost);
  const displayedTotal = Number(previewTotals?.grandTotal ?? total);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sticky top-28">
      <h2 className="mb-3 text-base font-semibold text-gray-900">
        {t("payment.thank_you.order_summary")}
      </h2>
      <div className="space-y-3">
        {cartItems.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("payment.checkout.cart_empty")}
          </p>
        ) : (
          cartItems.map(item => (
            <div
              className="flex items-center justify-between gap-4"
              key={item.productID || item.productId || item.id}
              style={{ width: "100%" }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={
                      item.image ||
                      item.imageUrl ||
                      item.product?.imageUrl ||
                      "/placeholder.svg"
                    }
                    alt={item.productName || item.product?.name}
                    className="w-full h-full object-contain"
                    onError={e => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h6 className="text-sm font-medium text-gray-800 truncate">
                    {item.productName || item.product?.name}
                  </h6>
                  <p className="text-xs text-gray-500">
                    x{Number(item.quantity) || 1}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 shrink-0">
                {formatCurrency(getUnitPrice(item) * (Number(item.quantity) || 1))}
              </span>
            </div>
          ))
        )}
        <div className="border-t border-gray-200 pt-3">
          {loyaltyDiscount > 0 && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-emerald-600">Giảm từ điểm thưởng</span>
              <span className="text-sm font-semibold text-emerald-600">
                -
                {formatCurrency(Number(previewTotals?.loyaltyDiscount ?? loyaltyDiscount))}
              </span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-emerald-600">Giảm từ mã giảm giá</span>
              <span className="text-sm font-semibold text-emerald-600">
                -{formatCurrency(Number(previewTotals?.discount ?? couponDiscount))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {t("payment.checkout.subtotal")}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(displayedSubtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">
              {t("payment.checkout.shipping")}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(displayedShipping)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {t("payment.checkout.total")}
            </span>
            <span className="text-base font-bold text-[var(--color-primary-)]">
              {formatCurrency(displayedTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ShoppingCard_CheckOut() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.carts || []);
  const [selectedShippingOption, setSelectedShippingOption] = useState("standard");
  const { user } = useContext(UserContext);

  const shippingCost = selectedShippingOption === "standard" ? 20000 : 0;

  var id = user ? user.id : 0;
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.fullName?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.fullName?.split(" ").slice(1).join(" ") || "");
  const [streetAddress, setStreetAddress] = useState(user?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [country, setCountry] = useState({ selectedOption: "vietnam" });
  const [stateProvince, setState] = useState({ selectedOption: "" });
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [loyaltyApplied, setLoyaltyApplied] = useState({ points: 0, discountAmount: 0 });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTotals, setPreviewTotals] = useState(null);
  const [note, setNote] = useState("");
  const isCartEmpty = !cartItems || cartItems.length === 0;

  const subtotal = cartItems.reduce((total, item) => {
    const unit = getUnitPriceFromCheckoutItem(item);
    const qty = Number(item?.quantity) || 1;
    return total + unit * qty;
  }, 0);
  const cartTotal = subtotal + shippingCost;
  const finalCheckoutTotal = Number(
    previewTotals?.grandTotal ?? Math.max(0, cartTotal - loyaltyApplied.discountAmount - couponDiscount)
  );

  useEffect(() => {
    if (isCartEmpty) {
      setPreviewTotals(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const payload = {
          items: cartItems.map((item) => ({
            quantity: Number(item?.quantity || 1),
            unitPrice: Number(getUnitPriceFromCheckoutItem(item)),
          })),
          shipping: Number(shippingCost),
          discount: Number(couponDiscount || 0),
          loyaltyDiscount: Number(loyaltyApplied.discountAmount || 0),
          tax: 0,
        };
        const response = await previewOrder(payload);
        setPreviewTotals(response || null);
      } catch {
        setPreviewTotals(null);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [cartItems, shippingCost, couponDiscount, loyaltyApplied.discountAmount, isCartEmpty]);

  useEffect(() => {
    const userId = user?.id || user?.customerID || user?.customerId;
    if (!userId) return;
    getLoyaltyBalance(userId).then(setLoyaltyBalance).catch(() => setLoyaltyBalance(0));
  }, [user]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage("Vui lòng nhập mã giảm giá.");
      setCouponDiscount(0);
      return;
    }
    try {
      setCouponLoading(true);
      const data = await validateCouponCode({ code, orderTotal: cartTotal });
      if (!data?.valid) {
        setCouponDiscount(0);
        setCouponMessage(data?.message || "Mã giảm giá không hợp lệ.");
        return;
      }
      setCouponDiscount(Number(data?.discountAmount || 0));
      setCouponMessage(data?.message || "Áp dụng mã giảm giá thành công.");
    } catch (error) {
      setCouponDiscount(0);
      setCouponMessage(error?.response?.data?.message || "Không thể kiểm tra mã giảm giá lúc này.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    const newErrors = {};
    if (!email.trim()) newErrors.email = t("form.email_required");
    if (!firstName.trim()) newErrors.firstName = t("form.first_name_required");
    if (!lastName.trim()) newErrors.lastName = t("form.last_name_required");
    if (!city.trim()) newErrors.city = t("form.city_required");
    const normalizedPhone = String(phoneNumber || "").replace(/\s+/g, "");
    if (!normalizedPhone) newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    else if (!/^0(?:3|5|7|8|9)[0-9]{8}$/.test(normalizedPhone)) newErrors.phoneNumber = "Số điện thoại chưa đúng định dạng VN.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }
    if (!paymentMethod) {
      notify.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);

    const provinceName = typeof stateProvince.selectedOption === 'string' ? stateProvince.selectedOption : "";
    const countryName = typeof country.selectedOption === 'string' ? country.selectedOption : "";
    
    const fullAddress = [streetAddress, city, provinceName, countryName]
      .filter(Boolean)
      .join(", ");
      
    const backendPaymentMethod = mapCheckoutMethodToBackend(paymentMethod);
    const userId = Number(id || 0);

    if (!userId) {
      notify.error("Vui lòng đăng nhập để tiếp tục.");
      navigate(path.login);
      setIsSubmitting(false);
      return;
    }

    const orderWithDetailsData = {
      userId,
      deliveryAddress: fullAddress,
      paymentMethod: backendPaymentMethod,
      totalPrice: Number(finalCheckoutTotal),
      paymentFee: Number(shippingCost),
      status: "PROCESSING",
      notes: note,
      usedPoint: 0,
      usedAt: null,
      createdDate: new Date().toLocaleDateString("en-CA"),
      items: cartItems.map(item => ({
        productId: Number(item.productId || item.product?.id || item.productID || item.id),
        amount: Number(item.quantity) || 1,
        unitPrice: Number(getUnitPriceFromCheckoutItem(item)),
      })),
    };

    if (ONLINE_PAYMENT_METHODS.has(paymentMethod)) {
      try {
        sessionStorage.setItem("pendingOrder", JSON.stringify(orderWithDetailsData));
        sessionStorage.setItem("loyaltyRedemption", JSON.stringify(loyaltyApplied));
        
        const gatewayPayload = {
          amount: Math.round(finalCheckoutTotal),
          orderInfo: `Thanh toan don hang ${Date.now()}`,
        };
        let gatewayRes;
        if (paymentMethod === "momo") gatewayRes = await createMomoPayment(gatewayPayload);
        else if (paymentMethod === "zalopay") gatewayRes = await createZalopayPayment(gatewayPayload);
        else gatewayRes = await createVnpayPayment(gatewayPayload);

        if (!gatewayRes?.paymentUrl) throw new Error("Payment URL is missing");
        window.location.href = gatewayRes.paymentUrl;
        return;
      } catch (error) {
        notify.error("Không thể khởi tạo giao dịch thanh toán.");
        setIsSubmitting(false);
        return;
      }
    } else {
      // CASH ON DELIVERY
      try {
        const orderResponse = await createOrderWithDetails(orderWithDetailsData);
        const createdOrderId = orderResponse.id || orderResponse.orderID;

        if (loyaltyApplied.points > 0) {
          try {
            await redeemLoyaltyPoints({ userId, points: Number(loyaltyApplied.points), orderId: Number(createdOrderId) });
          } catch (redeemError) {
            console.error("Lỗi redeem loyalty points:", redeemError);
          }
        }
        localStorage.setItem("lastOrderId", String(createdOrderId));
        dispatch(clearCart(userId));
        
        updatePlaysAllowedAfterOrder(userId)
          .then(updatedUser => {
            if (updatedUser) localStorage.setItem("user", JSON.stringify(updatedUser));
          }).catch(err => console.error("Failed to update plays:", err));

        notify.success("Đặt hàng thành công!");
        navigate(path.thankYou);
      } catch (err) {
        notify.error("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-)]/50 via-white to-gray-50/90 font-sans py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <Link to={path.home} className="text-[var(--color-primary-)] hover:text-[var(--color-primary-)]">{t("payment.checkout.breadcrumb_home")}</Link>
            <span className="text-gray-300">/</span>
            <Link to={path.card} className="text-[var(--color-primary-)] hover:text-[var(--color-primary-)]">{t("payment.checkout.breadcrumb_cart")}</Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-700">{t("payment.checkout.breadcrumb_checkout")}</span>
          </nav>
          <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {t("payment.checkout.checkout_title")}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">{t("payment.checkout.shipping_information")}</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.email")}</label>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.email ? "border-red-400 bg-red-50" : ""}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.first_name")}</label>
                  <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.firstName ? "border-red-500" : ""}`} />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.last_name")}</label>
                  <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.lastName ? "border-red-500" : ""}`} />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.street_address")}</label>
                  <AddressAutocomplete value={streetAddress} onChange={setStreetAddress} placeholder="Nhập số nhà, tên đường..." className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.streetAddress ? "border-red-500" : ""}`} />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.city")}</label>
                  <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.city ? "border-red-500" : ""}`} />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t("payment.checkout.phone")}</label>
                  <input type="tel" id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={`block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30 ${errors.phoneNumber ? "border-red-500" : ""}`} />
                  {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                </div>
              </form>
            </div>

            {/* Payment & Rewards Info */}
            <LoyaltyPointsPanel available={loyaltyBalance} cartTotal={cartTotal} onApply={setLoyaltyApplied} />

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Mã giảm giá</h2>
              <div className="flex items-center gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Nhập mã giảm giá" className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[var(--color-primary-)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-)]/30" />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} className="rounded-xl bg-[var(--color-primary-)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-)] disabled:opacity-60">{couponLoading ? "..." : "Áp dụng"}</button>
              </div>
              {couponMessage && <p className={`mt-2 text-xs ${couponDiscount > 0 ? "text-emerald-600" : "text-red-500"}`}>{couponMessage}</p>}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
              <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />
              {paymentMethod === "momo" && (
                <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50 p-4">
                  <p className="text-sm font-medium text-pink-700 mb-2">Quét QR MoMo</p>
                  <img src={momoQr} alt="MoMo QR" className="h-36 w-36 rounded-md border border-pink-200 bg-white p-2 object-contain" />
                </div>
              )}
            </div>
            
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Ghi chú đơn hàng</h2>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập ghi chú (nếu có)" className="block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary-)] focus:ring-[var(--color-primary-)]/30" />
            </div>

          </div>

          <div className="lg:col-span-5">
            <OrderSummary cartItems={cartItems} selectedShippingCost={shippingCost} loyaltyDiscount={loyaltyApplied.discountAmount} couponDiscount={couponDiscount} previewTotals={previewTotals} />
            <button type="button" onClick={handlePlaceOrder} disabled={isCartEmpty || isSubmitting} className={`mt-6 w-full flex justify-center items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-)] focus-visible:ring-offset-2 ${isCartEmpty || isSubmitting ? "cursor-not-allowed bg-gray-200 text-gray-500" : "bg-gradient-to-r from-[var(--color-primary-)] to-purple-600 text-white hover:shadow-lg hover:shadow-[var(--color-primary-)]/50 hover:-translate-y-0.5 active:translate-y-0"}`}>
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCard_CheckOut;
