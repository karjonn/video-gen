import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { generateAllVideos } from "@/services/video-gen";
import { downloadAllAsZip } from "@/services/zip-download";
import { VideoThumbnail } from "@/components/shared/VideoThumbnail";
import { GenerationProgress } from "@/components/shared/GenerationProgress";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function VideoOutputStep() {
  const scenes = useProjectStore((s) => s.scenes);
  const characters = useProjectStore((s) => s.characters);
  const title = useProjectStore((s) => s.title);
  const updateScene = useProjectStore((s) => s.updateScene);
  const startedRef = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const doneCount = scenes.filter((s) => s.videoStatus === "done").length;
  const generatingCount = scenes.filter(
    (s) => s.videoStatus === "generating"
  ).length;
  const idleScenes = scenes.filter(
    (s) => s.videoStatus === "idle" && s.imageUrl
  );
  const allDone = doneCount === scenes.length && scenes.length > 0;

  useEffect(() => {
    if (startedRef.current || idleScenes.length === 0) return;
    startedRef.current = true;

    idleScenes.forEach((s) =>
      updateScene(s.index, { videoStatus: "generating", videoError: null })
    );

    generateAllVideos(
      idleScenes,
      2,
      (index, result) => {
        updateScene(index, {
          videoUrl: result.videoUrl,
          videoStatus: "done",
          videoError: null,
        });
      },
      (index, error) => {
        updateScene(index, {
          videoStatus: "error",
          videoError: error.message,
        });
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadAllAsZip(scenes, characters, title);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Output</h2>
          <p className="text-sm text-muted-foreground">
            {allDone
              ? "All videos generated! Click to preview or download."
              : "Generating video clips from scene images..."}
          </p>
        </div>
        {allDone && (
          <Button onClick={handleDownloadAll} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download All (ZIP)
          </Button>
        )}
      </div>

      {generatingCount > 0 && (
        <GenerationProgress
          current={doneCount}
          total={scenes.length}
          label={`Generating videos... ${doneCount} of ${scenes.length} done`}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {scenes.map((scene) => (
          <VideoThumbnail
            key={scene.index}
            sceneIndex={scene.index}
            thumbnailUrl={scene.imageUrl}
            videoUrl={scene.videoUrl}
            status={scene.videoStatus}
            error={scene.videoError}
          />
        ))}
      </div>
    </div>
  );
}
