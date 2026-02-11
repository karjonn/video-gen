import { useState } from "react";
import { Play, Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerationStatus } from "@/types/storyboard";

interface VideoThumbnailProps {
  sceneIndex: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  status: GenerationStatus;
  error: string | null;
}

export function VideoThumbnail({
  sceneIndex,
  thumbnailUrl,
  videoUrl,
  status,
  error,
}: VideoThumbnailProps) {
  const [open, setOpen] = useState(false);

  if (status === "generating") {
    return (
      <div className="relative">
        <Skeleton className="aspect-video w-full rounded-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Scene {sceneIndex}
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-md bg-destructive/10 text-xs">
        <AlertCircle className="mb-1 h-5 w-5 text-destructive" />
        <p className="px-2 text-center text-destructive">
          {error || "Failed"}
        </p>
        <p className="mt-1 text-muted-foreground">Scene {sceneIndex}</p>
      </div>
    );
  }

  if (status === "done" && videoUrl) {
    return (
      <>
        <div
          className="group relative cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Scene ${sceneIndex}`}
              className="aspect-video w-full rounded-md object-cover"
            />
          ) : (
            <div className="aspect-video w-full rounded-md bg-secondary" />
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-10 w-10 text-white" fill="white" />
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Scene {sceneIndex}
          </p>
        </div>

        <a href={videoUrl} download={`scene_${String(sceneIndex).padStart(2, "0")}.mp4`}>
          <Button variant="ghost" size="sm" className="mt-1 w-full">
            <Download className="mr-1 h-3 w-3" />
            Download
          </Button>
        </a>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl">
            <DialogTitle>Scene {sceneIndex}</DialogTitle>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full rounded-md"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // idle
  return (
    <div className="flex aspect-video items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
      Scene {sceneIndex}
    </div>
  );
}
