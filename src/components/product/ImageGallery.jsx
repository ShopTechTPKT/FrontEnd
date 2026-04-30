import { useEffect, useMemo, useRef, useState } from "react";
import ImageZoom from "./ImageZoom";

/**
 * ImageGallery — Multi-image product gallery with thumbnail strip.
 * Main image integrates ImageZoom. Thumbnail click swaps main image with crossfade.
 *
 * Props:
 *   images: string[] — array of image URLs
 *   alt: string — alt text for images
 */
export default function ImageGallery({ images = [], alt = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const touchStartX = useRef(null);

  // Fallback to single empty image
  const imageList = images.length > 0 ? images : [""];
  const canNavigate = imageList.length > 1;

  const switchImage = (idx) => {
    if (idx === activeIndex) return;
    setFading(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setFading(false);
    }, 150);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setLightboxScale(1);
    setActiveIndex((prev) => (prev + 1) % imageList.length);
  };

  const goPrev = () => {
    if (!canNavigate) return;
    setLightboxScale(1);
    setActiveIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleLightboxWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    setLightboxScale((prev) => Math.min(3, Math.max(1, prev + delta)));
  };

  const zoomIn = () => setLightboxScale((prev) => Math.min(3, +(prev + 0.2).toFixed(2)));
  const zoomOut = () => setLightboxScale((prev) => Math.max(1, +(prev - 0.2).toFixed(2)));
  const resetZoom = () => setLightboxScale(1);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null || !canNavigate) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) goPrev();
    if (deltaX < -45) goNext();
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        setLightboxScale(1);
      }
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [lightboxOpen, canNavigate, imageList.length]);

  useEffect(() => {
    if (!lightboxOpen) setLightboxScale(1);
  }, [lightboxOpen]);

  const mainImage = useMemo(() => imageList[activeIndex], [imageList, activeIndex]);

  return (
    <div className="space-y-3">
      {/* Main image with zoom */}
      <div
        className={`transition-opacity duration-150 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <ImageZoom
          src={mainImage}
          alt={alt}
          onOpenLightbox={() => setLightboxOpen(true)}
        />
      </div>

      {/* Thumbnail strip */}
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageList.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => switchImage(idx)}
              className={`w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                idx === activeIndex
                  ? "border-violet-600 ring-2 ring-violet-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/85 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => {
              setLightboxOpen(false);
              setLightboxScale(1);
            }}
            className="absolute inset-0"
            aria-label="Close lightbox overlay"
          />
          <div className="relative max-w-5xl w-full z-10">
            <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Zoom out"
              >
                -
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="inline-flex items-center justify-center min-w-[52px] h-9 rounded-full bg-black/40 text-white hover:bg-black/60 text-xs px-2"
                aria-label="Reset zoom"
              >
                {Math.round(lightboxScale * 100)}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setLightboxScale(1);
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Close lightbox"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {canNavigate && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <div
              className="bg-white rounded-xl overflow-hidden touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={mainImage}
                alt={alt}
                className="w-full max-h-[80vh] object-contain bg-gray-50 transition-transform duration-200"
                style={{ transform: `scale(${lightboxScale})` }}
                onWheel={handleLightboxWheel}
                onDoubleClick={() =>
                  setLightboxScale((prev) => (prev > 1 ? 1 : 2))
                }
              />
            </div>

            {canNavigate && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Next image"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
