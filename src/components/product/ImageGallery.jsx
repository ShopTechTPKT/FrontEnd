import { useState } from "react";
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

  // Fallback to single empty image
  const imageList = images.length > 0 ? images : [""];

  const switchImage = (idx) => {
    if (idx === activeIndex) return;
    setFading(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setFading(false);
    }, 150);
  };

  return (
    <div className="space-y-3">
      {/* Main image with zoom */}
      <div
        className={`transition-opacity duration-150 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <ImageZoom src={imageList[activeIndex]} alt={alt} />
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
    </div>
  );
}
