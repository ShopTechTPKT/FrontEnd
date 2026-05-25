import React, { useState, useEffect, useRef } from "react";

// Wrapper for a chunk of products that virtualizes itself
const GridChunk = ({ items, renderItem, minHeight = "400px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const chunkRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: "400px 0px", // Unload/load with margin for smooth scroll
      }
    );

    if (chunkRef.current) {
      observer.observe(chunkRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={chunkRef}
      style={{ minHeight: isVisible ? "auto" : minHeight }}
      className="contents"
    >
      {isVisible ? (
        items.map((item, idx) => renderItem(item, idx))
      ) : (
        <div style={{ height: minHeight }} className="col-span-full" />
      )}
    </div>
  );
};

const VirtualProductGrid = ({
  products = [],
  renderItem,
  chunkSize = 12,
  className = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
  minChunkHeight = "500px",
}) => {
  // Split products into chunks
  const chunks = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    chunks.push(products.slice(i, i + chunkSize));
  }

  return (
    <div className={className}>
      {chunks.map((chunk, idx) => (
        <GridChunk
          key={idx}
          items={chunk}
          renderItem={renderItem}
          minHeight={minChunkHeight}
        />
      ))}
    </div>
  );
};

export default React.memo(VirtualProductGrid);
