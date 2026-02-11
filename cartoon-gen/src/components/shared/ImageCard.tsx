import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { GenerationStatus } from "@/types/storyboard";

interface ImageCardProps {
  imageUrl: string | null;
  status: GenerationStatus;
  error: string | null;
  onRegenerate?: () => void;
  className?: string;
}

export function ImageCard({
  imageUrl,
  status,
  error,
  onRegenerate,
  className,
}: ImageCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-3">
        {status === "generating" && (
          <Skeleton className="aspect-[4/3] w-full rounded-md" />
        )}

        {status === "error" && (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md bg-destructive/10 text-sm">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="px-4 text-center text-xs text-destructive">
              {error || "Generation failed"}
            </p>
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        )}

        {status === "done" && imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className="aspect-[4/3] w-full rounded-md object-cover"
            loading="lazy"
          />
        )}

        {status === "idle" && (
          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
            Not yet generated
          </div>
        )}

        {onRegenerate && (status === "done" || status === "error") && status !== "error" && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={onRegenerate}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Regenerate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
