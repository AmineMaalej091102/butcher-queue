import { STEPS, STEP_INDEX } from "@/lib/constants";
import type { Step } from "@/types/queue";

interface StepIndicatorProps {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  // Hide indicator if cancelled
  if (currentStep === "cancelled") return null;

  const currentIndex = STEP_INDEX[currentStep];

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.filter(s => s !== "cancelled").map((s, i) => (
        <div
          key={s}
          className={`step-dot ${
            i === currentIndex
              ? "step-dot-active"
              : i < currentIndex
                ? "step-dot-done"
                : ""
          }`}
        />
      ))}
    </div>
  );
}
