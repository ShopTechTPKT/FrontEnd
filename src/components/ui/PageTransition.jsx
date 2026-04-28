import { useEffect, useState } from "react";

/**
 * PageTransition — CSS-only fade+slide enter animation wrapper.
 * Wraps children with a mount animation for smooth page transitions.
 */
export default function PageTransition({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation on next frame for CSS transition to work
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
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
