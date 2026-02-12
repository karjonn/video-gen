import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface WizardFooterProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLoading?: boolean;
  nextLabel?: string;
}

const DEFAULT_LABELS = [
  "Continue",
  "Extract Characters",
  "Generate Character Images",
  "Generate Scene Images",
  "Generate Videos",
  "Download All",
];

export function WizardFooter({
  currentStep,
  onBack,
  onNext,
  canGoNext,
  isLoading = false,
  nextLabel,
}: WizardFooterProps) {
  const label = nextLabel ?? DEFAULT_LABELS[currentStep] ?? "Next";

  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-4">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={currentStep === 0 || isLoading}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>
      <Button onClick={onNext} disabled={!canGoNext || isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {label}
        {!isLoading && currentStep < 5 && (
          <ChevronRight className="ml-1 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
