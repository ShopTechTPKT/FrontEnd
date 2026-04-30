const path = {
  // ── Core ──────────────────────────────────────────────
  home: "/",
  login: "/login",
  contact: "/contact",
  about: "/about",
  faq: "/faq",

  // ── Products ──────────────────────────────────────────
  allProducts: "/all_products",
  laptops: "/laptops",
  desktops: "/desktops",
  networkingDevices: "/networking_devices",
  printerScanner: "/printer_scanner",
  pcParts: "/pc_parts",
  repair: "/repair",
  ourDeal: "/our_deal",
  deals: "/deals",
  newArrivals: "/new-arrivals",
  brands: "/brands",
  blog: "/blog",
  pcBuilder: "/pc-builder",
  compare: "/compare",
  favorites: "/favorites",

  // ── Shopping Cart ─────────────────────────────────────
  shoppingCart: "/shopping_card_item",
  shoppingCheckout: "/shopping_card_checkout",
  shoppingPayment: "/shopping_payment",
  thankYou: "/thank_you_shopping",

  // ── Profile / Account ────────────────────────────────
  profile: "/profile",
  userProfile: "/userProfile",

  // ── Track & Support ──────────────────────────────────
  trackOrder: "/track-order",

  // ── Admin ─────────────────────────────────────────────
  admin: "/admin",
  adminAnalytics: "/admin/analytics",
  adminCalendar: "/admin/calendar",
  adminAuditLogs: "/admin/audit-logs",

  // ── Legacy aliases (backward compat) ─────────────────
  /** @deprecated Dùng shoppingCart thay thế */
  card: "/shopping_card_item",
  /** @deprecated Dùng allProducts thay thế */
  all_products: "/all_products",
  /** @deprecated Dùng shoppingCheckout thay thế */
  shopping_card_checkout: "/shopping_card_checkout",
  /** @deprecated Dùng shoppingCart thay thế */
  shopping_card_item: "/shopping_card_item",
  /** @deprecated Dùng shoppingPayment thay thế */
  shopping_payment: "/shopping_payment",
  /** @deprecated Dùng thankYou thay thế */
  thank_you_shopping: "/thank_you_shopping",
};

export default path;