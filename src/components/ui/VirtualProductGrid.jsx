import React, { useState, useEffect, useRef } from "react";

// Wrapper for a chunk of products that virtualizes itself
const GridChunk = ({ items, renderItem, className, minHeight = "400px" }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const chunkRef = useRef(null);

  useEffect(() => {
    // If it's already rendered, we don't need to observe it anymore
    if (hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
        }
      },
      {
        rootMargin: "450px 0px", // Unload/load with margin for smooth scroll
      }
    );

    if (chunkRef.current) {
      observer.observe(chunkRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasBeenVisible]);

  return (
    <div
      ref={chunkRef}
      style={{ minHeight: hasBeenVisible ? "auto" : minHeight }}
    >
      {hasBeenVisible ? (
        <div className={className}>
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      ) : (
        <div style={{ height: minHeight }} />
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
    <div className="flex flex-col gap-6">
      {chunks.map((chunk, idx) => (
        <GridChunk
          key={idx}
          items={chunk}
          renderItem={renderItem}
          className={className}
          minHeight={minChunkHeight}
        />
      ))}
    </div>
  );
};

export default React.memo(VirtualProductGrid);
