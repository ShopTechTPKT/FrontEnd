import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../context/UserContext";
import {
  getUserOrdersWithDetails,
  getOrderProductDetails,
} from "../../apis/userApi";
import ProductGridSkeleton from "../../components/ui/ProductGridSkeleton";
import StatusNotice from "../../components/ui/StatusNotice";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

function MyOrders() {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const userId = user?.id || user?.customerID || user?.customerId || user?.userId;

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (!userId) {
        console.error("User ID not found in user object:", user);
        setError("User ID not found");
        setLoading(false);
        return;
      }

      // Call API to get user orders with details
      const response = await getUserOrdersWithDetails(userId);
      setOrders(response || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const handleViewDetails = async orderId => {
    try {
      if (selectedOrder === orderId) {
        // Nếu click lại thì collapse
        setSelectedOrder(null);
        setOrderDetails(null);
        return;
      }

      const response = await getOrderProductDetails(orderId);
      setOrderDetails(response);
      setSelectedOrder(orderId);
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert("Failed to load order details");
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <StatusNotice
          tone="error"
          title="Không tải được đơn hàng"
          message={error}
          actionText="Thử lại"
          onAction={fetchOrders}
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <EmptyState
          title="No Orders Yet"
          description="You haven't placed any orders yet. Start shopping now!"
          className="py-0"
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-light text-gray-900">My Orders</h2>

        <div className="grid gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Order Card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900">
                      #{order.id}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "COMPLETED" ||
                        order.status === "completed"
                          ? "bg-[var(--color-success-light)] text-[var(--color-success-dark)]"
                          : order.status === "PENDING" ||
                            order.status === "pending"
                          ? "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]"
                          : order.status === "CANCELLED" ||
                            order.status === "cancelled"
                          ? "bg-[var(--color-danger-light)] text-[var(--color-danger-dark)]"
                          : order.status === "RETURNED"
                          ? "bg-[var(--color-info-light)] text-[var(--color-info-dark)]"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.createdDate
                        ? new Date(order.createdDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${order.totalPrice || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.paymentMethod || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Items</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.totalItems || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleViewDetails(order.id)}
                    variant="primary"
                    size="sm"
                  >
                    {selectedOrder === order.id
                      ? "Hide Details"
                      : "View Details"}
                  </Button>
                  {(order.status === "SHIPPED" ||
                    order.status === "shipped") && (
                    <Button
                      onClick={() =>
                        (window.location.href = `/profile/orders/tracking/${order.id}`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      Track Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Expandable Detail Section */}
              {selectedOrder === order.id && orderDetails && (
                <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6 animate-in slide-in-from-top">
                  {/* Order Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Items
                    </h3>

                    <div className="space-y-3">
                      {Array.isArray(orderDetails) &&
                      orderDetails.length > 0 ? (
                        orderDetails.map(item => (
                          <div
                            key={item.orderDetailId}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex gap-4">
                              {/* Product Info */}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-base">
                                  {item.productName || "Product"}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.description || ""}
                                </p>
                                {item.categoryName && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Category: {item.categoryName}
                                  </p>
                                )}
                              </div>

                              {/* Quantity & Price */}
                              <div className="text-right min-w-[150px]">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                  <span className="text-sm text-gray-600">
                                    Qty:
                                  </span>
                                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium text-gray-900">
                                    {item.amount}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  ${item.pricePerUnit?.toFixed(2) || 0} each
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  $
                                  {(
                                    (item.amount || 0) *
                                    (item.pricePerUnit || 0)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No items in this order
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-end">
                      <div className="w-full md:w-64">
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>
                              $
                              {orderDetails
                                .reduce(
                                  (sum, item) =>
                                    sum +
                                    (item.amount || 0) *
                                      (item.pricePerUnit || 0),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg text-gray-900 pt-3 border-t border-gray-200">
                            <span>Total:</span>
                            <span>${order.totalPrice || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyOrders;
