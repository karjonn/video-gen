import type { ReactNode } from "react";
import { StepIndicator } from "./StepIndicator";
import { WizardFooter } from "./WizardFooter";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useProjectStore } from "@/stores/project-store";

interface WizardShellProps {
  children: ReactNode;
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLoading?: boolean;
  nextLabel?: string;
}

export function WizardShell({
  children,
  currentStep,
  onBack,
  onNext,
  canGoNext,
  isLoading,
  nextLabel,
}: WizardShellProps) {
  const resetProject = useProjectStore((s) => s.resetProject);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-lg font-bold tracking-tight">CartoonGen</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("Reset project? This will clear all progress.")) {
              resetProject();
            }
          }}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </header>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Content */}
      <main className="flex-1 overflow-auto px-6 py-4">{children}</main>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        onBack={onBack}
        onNext={onNext}
        canGoNext={canGoNext}
        isLoading={isLoading}
        nextLabel={nextLabel}
      />
    </div>
  );
}
