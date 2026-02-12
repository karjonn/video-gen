import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateAllVideos, generateSceneVideo } from "@/services/video-gen";
import { downloadAllAsZip } from "@/services/zip-download";
import { generateMockImage, mockDelay } from "@/services/mock-data";
import { GenerationProgress } from "@/components/shared/GenerationProgress";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Play } from "lucide-react";

export function VideoOutputStep() {
  const scenes = useProjectStore((s) => s.scenes);
  const characters = useProjectStore((s) => s.characters);
  const title = useProjectStore((s) => s.title);
  const updateScene = useProjectStore((s) => s.updateScene);
  const testMode = useSettingsStore((s) => s.testMode);
  const startedRef = useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

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

    if (testMode) {
      idleScenes.forEach(async (s) => {
        await mockDelay(1500 + Math.random() * 1500);
        // In test mode, use the scene image as a "video" placeholder
        updateScene(s.index, {
          videoUrl: s.imageUrl || generateMockImage(`Video ${s.index}`, 800, 450, "#312e81"),
          videoStatus: "done",
          videoError: null,
        });
      });
      return;
    }

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

  const handleRegenerate = async (sceneIndex: number) => {
    const scene = scenes.find((s) => s.index === sceneIndex);
    if (!scene) return;

    updateScene(sceneIndex, {
      videoStatus: "generating",
      videoError: null,
    });

    if (testMode) {
      await mockDelay(1500);
      updateScene(sceneIndex, {
        videoUrl: scene.imageUrl || generateMockImage(`Video ${sceneIndex}`, 800, 450, "#312e81"),
        videoStatus: "done",
        videoError: null,
      });
      return;
    }

    try {
      const result = await generateSceneVideo(scene);
      updateScene(sceneIndex, {
        videoUrl: result.videoUrl,
        videoStatus: "done",
        videoError: null,
      });
    } catch (err) {
      updateScene(sceneIndex, {
        videoStatus: "error",
        videoError: (err as Error).message,
      });
    }
  };

  const handleDownloadSingle = (scene: typeof scenes[0]) => {
    if (!scene.videoUrl) return;
    const a = document.createElement("a");
    a.href = scene.videoUrl;
    a.download = `scene-${scene.index}.mp4`;
    a.target = "_blank";
    a.click();
  };

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

      {/* Single-row vertical list */}
      <div className="space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.index}
            className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
          >
            {/* Thumbnail / Video */}
            <div className="w-64 shrink-0">
              {scene.videoStatus === "done" && scene.videoUrl ? (
                playingIndex === scene.index ? (
                  <video
                    src={scene.videoUrl}
                    controls
                    autoPlay
                    className="w-full rounded"
                    onEnded={() => setPlayingIndex(null)}
                  />
                ) : (
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setPlayingIndex(scene.index)}
                  >
                    <img
                      src={scene.imageUrl || ""}
                      alt={`Scene ${scene.index}`}
                      className="w-full rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 transition-opacity hover:bg-black/50">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                  </div>
                )
              ) : scene.videoStatus === "generating" ? (
                <div className="flex h-36 w-full items-center justify-center rounded bg-secondary">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              ) : scene.videoStatus === "error" ? (
                <div className="flex h-36 w-full items-center justify-center rounded bg-destructive/10 text-xs text-destructive">
                  {scene.videoError || "Failed"}
                </div>
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded bg-secondary text-xs text-muted-foreground">
                  Waiting...
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold">Scene {scene.index}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {scene.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {scene.setting}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2">
              {scene.videoStatus === "done" && scene.videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSingle(scene)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
              )}
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white"
                onClick={() => handleRegenerate(scene.index)}
                disabled={scene.videoStatus === "generating"}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Regenerate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
