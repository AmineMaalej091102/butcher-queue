import { STEPS, STEP_INDEX } from "@/lib/constants";
import type { Step } from "@/types/queue";

interface StepIndicatorProps {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_INDEX[currentStep];

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
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
