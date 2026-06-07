import { useRef, useState } from "react";
import { playTick } from "../utils/sounds";

export default function useWheelAnimation() {
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef(null);

  const startSpin = (prizeIndex, totalSegments, onComplete) => {
    if (spinning) return;
    setSpinning(true);

    const segmentAngle = 360 / totalSegments;
    // Calculate angle to center the winning segment under the top pointer (270 degrees)
    const targetOffset = 270 - (prizeIndex * segmentAngle + segmentAngle / 2);
    
    // Ensure we spin at least 5-8 full rotations
    const extraRotations = (5 + Math.floor(Math.random() * 4)) * 360;
    const startAngle = rotationRef.current;
    
    // Target rotation is start angle + extra rotations + offset difference
    // We normalize startAngle to keep rotation values clean, but add target
    const currentNormalized = startAngle % 360;
    const targetAngle = startAngle - currentNormalized + extraRotations + targetOffset;

    const duration = 5000; // 5 seconds spin
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const easeOutElastic = (t) => {
      // Clean cubic ease-out for super smooth deceleration
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutElastic(progress);
      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      
      rotationRef.current = currentAngle;

      // Play tick sound when crossing a segment line
      const absoluteDiff = Math.abs(currentAngle - lastTickAngle);
      if (absoluteDiff >= segmentAngle) {
        playTick();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        if (onComplete) onComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return {
    spinning,
    rotation: rotationRef.current,
    startSpin,
    setRotation: (val) => { rotationRef.current = val; }
  };
}
