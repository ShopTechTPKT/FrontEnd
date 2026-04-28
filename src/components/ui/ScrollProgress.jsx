import { useState, useEffect, useCallback } from "react";

/**
 * ScrollProgress — Thin progress bar at the top of the page
 * showing how far the user has scrolled.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress((scrollTop / docHeight) * 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[9999] transition-[width] duration-100"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(to right, #7c3aed, #a78bfa)",
      }}
    />
  );
}
