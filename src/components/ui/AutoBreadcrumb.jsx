import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

/**
 * Route segment → Vietnamese label mapping.
 * Add new routes here as pages are created.
 */
const ROUTE_LABELS = {
  "": "Trang chu",
  "products": "San pham",
  "laptops": "Laptop",
  "desktops": "May tinh ban",
  "pc-parts": "Linh kien",
  "networking-devices": "Thiet bi mang",
  "printer-scanner": "May in & Scan",
  "deals": "Khuyen mai",
  "new-arrivals": "Hang moi",
  "brands": "Thuong hieu",
  "profile": "Tai khoan",
  "orders": "Don hang",
  "favorites": "Yeu thich",
  "cart": "Gio hang",
  "checkout": "Thanh toan",
  "compare": "So sanh",
  "about": "Ve chung toi",
  "faq": "Cau hoi thuong gap",
  "contact": "Lien he",
  "repair": "Sua chua",
  "warranties": "Bao hanh",
  "track-order": "Theo doi don hang",
  "appointments": "Dat lich",
  "blog": "Blog",
  "promotions": "Chuong trinh KM",
};

/**
 * AutoBreadcrumb — Generates breadcrumb items from current URL path.
 * Falls back to capitalized segment name if no label mapping found.
 */
export default function AutoBreadcrumb({ extra = [], className = "" }) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on homepage
  if (segments.length === 0) return null;

  const items = [{ label: "Trang chu", to: "/" }];

  segments.forEach((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const isLast = idx === segments.length - 1 && extra.length === 0;

    // Skip numeric IDs in breadcrumb display
    if (/^\d+$/.test(seg)) {
      items.push({ label: `#${seg}`, to: isLast ? undefined : path });
      return;
    }

    const label =
      ROUTE_LABELS[seg] ||
      seg
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    items.push({ label, to: isLast ? undefined : path });
  });

  // Append any extra items (e.g., product name)
  extra.forEach((item, idx) => {
    items.push({
      label: item.label,
      to: idx < extra.length - 1 ? item.to : undefined,
    });
  });

  return <Breadcrumb items={items} className={className} />;
}
