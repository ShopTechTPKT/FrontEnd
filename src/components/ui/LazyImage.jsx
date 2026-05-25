import { useState, useEffect, useRef } from "react";

export default function LazyImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder.svg",
  loadingClassName = "",
  useAutoWebp = true,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(fallbackSrc);
  const containerRef = useRef(null);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Preload early
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [imgSrc]);

  const webpCandidate = useAutoWebp && isVisible
    ? String(imgSrc || "")
        .replace(".jpeg", ".webp")
        .replace(".jpg", ".webp")
        .replace(".png", ".webp")
    : null;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${loadingClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md" />
      )}
      {isVisible && (
        <picture>
          {webpCandidate && webpCandidate !== imgSrc && (
            <source srcSet={webpCandidate} type="image/webp" />
          )}
          <img
            src={imgSrc}
            alt={alt}
            className={`${className} ${isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"} transition-all duration-500 ease-out`}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (imgSrc !== fallbackSrc) {
                setImgSrc(fallbackSrc);
              }
              setIsLoaded(true);
            }}
            {...rest}
          />
        </picture>
      )}
    </div>
  );
}
