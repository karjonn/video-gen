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
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !isCompleted && !isActive && "bg-secondary text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
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
                  i < currentStep ? "bg-primary" : "bg-secondary"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
