/**
 * Timeline — Reusable visual timeline component for order tracking.
 *
 * Props:
 *   steps: Array<{ label: string, date?: string, status: 'done' | 'active' | 'pending' }>
 *
 * Displays horizontal (desktop) or vertical (mobile) timeline with
 * color-coded nodes for each step.
 */
export default function Timeline({ steps = [] }) {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-violet-600 transition-all duration-500"
          style={{
            width: `${
              (steps.filter((s) => s.status === "done").length /
                Math.max(steps.length - 1, 1)) *
              100
            }%`,
          }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-center z-10 flex-1">
            {/* Node */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.status === "done"
                  ? "bg-violet-600 border-violet-600 text-white"
                  : step.status === "active"
                  ? "bg-white border-violet-600 text-violet-600 ring-4 ring-violet-100 animate-pulse"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {step.status === "done" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{idx + 1}</span>
              )}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-xs font-medium text-center ${
                step.status === "done"
                  ? "text-violet-700"
                  : step.status === "active"
                  ? "text-violet-600 font-semibold"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {/* Date */}
            {step.date && (
              <span className="text-[10px] text-gray-400 mt-0.5">{step.date}</span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-0">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-3">
            {/* Line + Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                  step.status === "done"
                    ? "bg-violet-600 border-violet-600 text-white"
                    : step.status === "active"
                    ? "bg-white border-violet-600 text-violet-600 ring-4 ring-violet-100"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {step.status === "done" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    step.status === "done" ? "bg-violet-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            {/* Content */}
            <div className="pb-6">
              <p
                className={`text-sm font-medium ${
                  step.status === "done"
                    ? "text-violet-700"
                    : step.status === "active"
                    ? "text-violet-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
