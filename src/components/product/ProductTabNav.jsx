import { useState, useEffect, useRef } from "react";

/**
 * ProductTabNav — Sticky tab bar for product detail page.
 * Uses IntersectionObserver to highlight active section and smooth-scrolls on click.
 *
 * Props:
 *   tabs: Array<{ id: string, label: string }> — section IDs and display labels
 */
const DEFAULT_TABS = [
  { id: "product-info", label: "Thong tin" },
  { id: "product-reviews", label: "Danh gia" },
  { id: "product-qa", label: "Hoi dap" },
  { id: "product-related", label: "Lien quan" },
];

export default function ProductTabNav({ tabs = DEFAULT_TABS }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const observerRef = useRef(null);

  useEffect(() => {
    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0.1,
    });

    tabs.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [tabs]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? "border-violet-700 text-violet-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
