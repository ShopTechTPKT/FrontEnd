import { useEffect, useRef } from "react";

export default function WheelCanvas({ prizes, rotation, size = 440 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prizes.length) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    // Scale canvas for high-DPI displays (retina screens)
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const radius = size / 2;
    const center = size / 2;
    const innerRadius = radius - 15; // padding for gold border
    const totalSegments = prizes.length;
    const segmentAngle = (2 * Math.PI) / totalSegments;

    ctx.clearRect(0, 0, size, size);

    // Save context for rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    // 1. Draw Segments
    prizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerRadius, startAngle, endAngle);
      ctx.closePath();

      // Create segment gradient
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, innerRadius);
      grad.addColorStop(0, "#1e1b4b"); // deep midnight blue center
      grad.addColorStop(1, prize.color || "#4f46e5");
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw segment divider line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Draw Text & Emoji
      ctx.save();
      // Rotate text to middle of segment
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle);

      // Draw Emoji
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(prize.icon || "🎁", innerRadius * 0.72, 0);

      // Draw Text
      ctx.font = "bold 12px 'Inter', sans-serif";
      ctx.fillText(prize.label || "", innerRadius * 0.44, 0);
      
      ctx.restore();
    });

    ctx.restore(); // Restore translation/rotation

    // 3. Draw Outer Gold Border (static or rotates, static looks nicer with pointer)
    ctx.beginPath();
    ctx.arc(center, center, radius - 7, 0, 2 * Math.PI);
    ctx.strokeStyle = "#eab308"; // Tailwind Yellow 500
    ctx.lineWidth = 14;
    ctx.stroke();

    // Draw Outer Shadow
    ctx.beginPath();
    ctx.arc(center, center, radius - 1, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(234, 179, 8, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Draw Pins (Lights) around the border
    const pinCount = totalSegments * 2;
    for (let i = 0; i < pinCount; i++) {
      const angle = (i * 2 * Math.PI) / pinCount;
      const x = center + (radius - 7) * Math.cos(angle);
      const y = center + (radius - 7) * Math.sin(angle);

      // Glowing effect for pins
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      
      // Alternate light colors
      if (i % 2 === 0) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
      } else {
        ctx.fillStyle = "#facc15";
        ctx.shadowColor = "#facc15";
      }
      ctx.shadowBlur = 6;
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }

    // 5. Draw Shiny Central Hub (Gold)
    const hubRadius = 32;
    const hubGrad = ctx.createRadialGradient(center, center, 2, center, center, hubRadius);
    hubGrad.addColorStop(0, "#fef08a"); // Light gold
    hubGrad.addColorStop(0.5, "#eab308"); // Gold
    hubGrad.addColorStop(1, "#854d0e"); // Dark gold
    
    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Outer hub ring
    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [prizes, rotation, size]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-full shadow-2xl" />
    </div>
  );
}
