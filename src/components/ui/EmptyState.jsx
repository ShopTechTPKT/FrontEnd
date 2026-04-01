import React from "react";

function EmptyState({ title, description, className = "" }) {
  return (
    <div className={`col-span-full flex flex-col items-center justify-center py-20 text-gray-500 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75L14.25 14.25M14.25 9.75L9.75 14.25M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
        />
      </svg>
      <p className="text-lg font-semibold text-gray-800">{title}</p>
      {description ? (
        <p className="text-sm text-gray-500 mt-2 max-w-md text-center">{description}</p>
      ) : null}
    </div>
  );
}

export default EmptyState;
