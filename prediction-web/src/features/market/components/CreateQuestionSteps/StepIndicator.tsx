"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              index <= currentStep
                ? "bg-cyan-500/30 border-cyan-500 text-cyan-400"
                : "bg-[#0B0E1E]/50 border-gray-600/30 text-gray-600"
            }`}
          >
            {index < currentStep ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <span className="text-xs font-bold">{index + 1}</span>
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-6 h-0.5 transition-all ${
                index < currentStep ? "bg-cyan-500" : "bg-gray-600/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}



