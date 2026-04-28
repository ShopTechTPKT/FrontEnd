import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — Counts from 0 to target value when element scrolls into view.
 * Uses IntersectionObserver + requestAnimationFrame for smooth animation.
 *
 * Props:
 *   value: number — target value
 *   duration: number — animation duration in ms (default 1500)
 *   prefix: string — text before number (e.g. "$")
 *   suffix: string — text after number (e.g. "+")
 *   decimals: number — decimal places (default 0)
 *   className: string — additional CSS classes
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const animate = () => {
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString("vi-VN");

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
