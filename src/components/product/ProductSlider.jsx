import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import ProductCard from "./ProductCard";

const ProductSlider = ({
  products = [],
  autoPlay = false,
  interval = 5000,
  visibleCount = 5,
}) => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const shouldSlide = products.length > visibleCount;
  const maxIndex = shouldSlide ? products.length - visibleCount : 0;

  useEffect(() => {
    let timer;
    if (isPlaying && shouldSlide) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= maxIndex ? 0 : prevIndex + 1
        );
      }, interval);
    }
    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, interval, maxIndex, shouldSlide]);

  const goToPrev = () => {
    if (!shouldSlide || currentIndex === 0) return;
    setCurrentIndex((prevIndex) => prevIndex - 1);
    if (autoPlay) setIsPlaying(false);
  };

  const goToNext = () => {
    if (!shouldSlide || currentIndex >= maxIndex) return;
    setCurrentIndex((prevIndex) => prevIndex + 1);
    if (autoPlay) setIsPlaying(false);
  };

  return (
    <div className="relative w-full">
      {/* Navigation buttons */}
      {shouldSlide && (
        <>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
              currentIndex === 0
                ? "bg-white text-gray-300 cursor-not-allowed shadow-sm"
                : "bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.97]"
            }`}
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
              currentIndex >= maxIndex
                ? "bg-white text-gray-300 cursor-not-allowed shadow-sm"
                : "bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.97]"
            }`}
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Product container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: shouldSlide
              ? `translateX(-${(100 / visibleCount) * currentIndex}%)`
              : "translateX(0%)",
          }}
        >
          {products.map((product, idx) => (
            <div
              key={product.productID || product.id || idx}
              className={`px-3 ${shouldSlide ? "flex-shrink-0" : "w-full md:w-1/2 lg:w-1/3 xl:w-1/4"}`}
              style={{
                width: shouldSlide ? `${100 / visibleCount}%` : undefined,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {shouldSlide && products.length > visibleCount && (
        <div className="flex justify-center mt-5 items-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 h-2 bg-indigo-500"
                  : "w-2 h-2 bg-gray-200 hover:bg-indigo-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSlider;