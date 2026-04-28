import { useState, useRef } from "react";

/**
 * ImageZoom — Hover-to-zoom image component for product detail pages.
 * CSS-only approach: scales image 2x with transform-origin following cursor.
 */
export default function ImageZoom({ src, alt, className = "" }) {
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
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          Hover to zoom
        </div>
      )}
    </div>
  );
}
