export const getPageMeta = (pathname) => {
  const routeMeta = [
    { match: /^\/$/, title: "ShopPC - Trang chủ", description: "Mua laptop, PC, linh kiện và phụ kiện chính hãng tại ShopPC." },
    { match: /^\/all_products/, title: "Tất cả sản phẩm - ShopPC", description: "Khám phá toàn bộ danh mục sản phẩm công nghệ tại ShopPC." },
    { match: /^\/product\/\d+/, title: "Chi tiết sản phẩm - ShopPC", description: "Xem thông tin chi tiết, thông số và đánh giá sản phẩm tại ShopPC." },
    { match: /^\/deals/, title: "Khuyến mãi - ShopPC", description: "Săn deal công nghệ hấp dẫn và ưu đãi mới nhất tại ShopPC." },
    { match: /^\/shopping_card_item/, title: "Giỏ hàng - ShopPC", description: "Kiểm tra giỏ hàng và cập nhật số lượng sản phẩm trước khi thanh toán." },
    { match: /^\/shopping_card_checkout/, title: "Thanh toán - ShopPC", description: "Xác nhận địa chỉ, vận chuyển và phương thức thanh toán đơn hàng của bạn." },
    { match: /^\/track-order/, title: "Theo dõi đơn hàng - ShopPC", description: "Theo dõi trạng thái giao hàng và tiến độ đơn hàng của bạn theo thời gian thực." },
    { match: /^\/blog/, title: "Blog công nghệ - ShopPC", description: "Cập nhật tin tức, hướng dẫn và xu hướng công nghệ mới nhất từ ShopPC." },
    { match: /^\/favorites/, title: "Sản phẩm yêu thích - ShopPC", description: "Quản lý danh sách sản phẩm yêu thích của bạn trên ShopPC." },
  ];

  const found = routeMeta.find((item) => item.match.test(pathname));
  return (
    found || {
      title: "ShopPC",
      description: "Hệ thống thương mại điện tử công nghệ với trải nghiệm mua sắm hiện đại.",
    }
  );
};

export const applyPageMeta = ({ title, description }) => {
  document.title = title;
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);
};
