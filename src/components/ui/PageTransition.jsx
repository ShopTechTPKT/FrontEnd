import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — CSS-only fade+slide enter animation wrapper.
 * Wraps children with a mount animation for smooth page transitions.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    // Trigger animation on next frame for CSS transition to work
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.search]);

  return (
    <div
      key={`${location.pathname}${location.search}`}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
