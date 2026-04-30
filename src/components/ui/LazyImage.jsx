import { useState } from "react";

export default function LazyImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder.svg",
  loadingClassName = "",
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    <div className={`relative ${loadingClassName}`}>
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-gray-100 rounded-md" />}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoaded(true);
        }}
        {...rest}
      />
    </div>
  );
}
