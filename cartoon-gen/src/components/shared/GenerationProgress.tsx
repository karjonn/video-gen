import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  current: number;
  total: number;
  label?: string;
}

export function GenerationProgress({
  current,
  total,
  label,
}: GenerationProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{label || `${current} of ${total} complete`}</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
