import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "API Keys",
  "Script",
  "Storyboard",
  "Characters",
  "Scenes",
  "Videos",
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isClickable = i < currentStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(i)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted && "bg-purple-600 text-white cursor-pointer hover:bg-purple-500",
                  isActive && "bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-background",
                  !isCompleted && !isActive && "bg-secondary text-muted-foreground cursor-default"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 mb-5",
                  i < currentStep ? "bg-purple-600" : "bg-secondary"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
