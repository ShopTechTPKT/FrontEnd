export default function Pointer() {
  return (
    <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-[15px] filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Needle pointer shape pointing down */}
        <path
          d="M12 21C14.5 17 18 13 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 13 9.5 17 12 21Z"
          fill="#ef4444"
          stroke="#f8fafc"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Glow inner circle */}
        <circle cx="12" cy="9" r="3.5" fill="#facc15" />
      </svg>
    </div>
  );
}
