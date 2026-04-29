import { useState, useRef } from "react";

/**
 * ImageZoom — Hover-to-zoom image component for product detail pages.
 * CSS-only approach: scales image 2x with transform-origin following cursor.
 */
export default function ImageZoom({
  src,
  alt,
  className = "",
  onOpenLightbox = null,
}) {
  const containerRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in rounded-xl ${className}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      onClick={() => onOpenLightbox?.()}
    >
      <img
        src={src}
        alt={alt || "Product image"}
        className="w-full h-auto object-contain transition-transform duration-300 ease-out max-h-96 mx-auto"
        style={{
          transform: zoomed ? "scale(2)" : "scale(1)",
          transformOrigin: origin,
        }}
        draggable={false}
      />
      {/* Zoom hint */}
      {!zoomed && (
        <div className="absolute bottom-3 right-3 bg-black/55 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none inline-flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-3.5 h-3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-3.5-3.5" />
          </svg>
          Zoom
        </div>
      )}
    </div>
  );
}
