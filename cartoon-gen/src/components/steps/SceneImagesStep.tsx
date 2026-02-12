import { useEffect, useRef } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateAllScenes, generateSceneImage } from "@/services/scene-gen";
import { generateMockImage, mockDelay } from "@/services/mock-data";
import { ImageCard } from "@/components/shared/ImageCard";
import { GenerationProgress } from "@/components/shared/GenerationProgress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function SceneImagesStep() {
  const scenes = useProjectStore((s) => s.scenes);
  const characters = useProjectStore((s) => s.characters);
  const updateScene = useProjectStore((s) => s.updateScene);
  const testMode = useSettingsStore((s) => s.testMode);
  const startedRef = useRef(false);

  const doneCount = scenes.filter((s) => s.imageStatus === "done").length;
  const generatingCount = scenes.filter(
    (s) => s.imageStatus === "generating"
  ).length;
  const idleScenes = scenes.filter((s) => s.imageStatus === "idle");

  useEffect(() => {
    if (startedRef.current || idleScenes.length === 0) return;
    startedRef.current = true;

    idleScenes.forEach((s) =>
      updateScene(s.index, { imageStatus: "generating", imageError: null })
    );

    if (testMode) {
      idleScenes.forEach(async (s) => {
        await mockDelay(1000 + Math.random() * 1000);
        const mockUrl = generateMockImage(`Scene ${s.index}`, 800, 450, "#4c1d95");
        updateScene(s.index, {
          imageUrl: mockUrl,
          imageSeed: Math.floor(Math.random() * 100000),
          imageStatus: "done",
          imageError: null,
        });
      });
      return;
    }

    generateAllScenes(
      idleScenes,
      characters,
      3,
      (index, result) => {
        updateScene(index, {
          imageUrl: result.imageUrl,
          imageSeed: result.seed,
          imageStatus: "done",
          imageError: null,
        });
      },
      (index, error) => {
        updateScene(index, {
          imageStatus: "error",
          imageError: error.message,
        });
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = async (sceneIndex: number) => {
    const scene = scenes.find((s) => s.index === sceneIndex);
    if (!scene) return;

    updateScene(sceneIndex, {
      imageStatus: "generating",
      imageError: null,
    });

    if (testMode) {
      await mockDelay(1200);
      const mockUrl = generateMockImage(`Scene ${sceneIndex}`, 800, 450, "#4c1d95");
      updateScene(sceneIndex, {
        imageUrl: mockUrl,
        imageSeed: Math.floor(Math.random() * 100000),
        imageStatus: "done",
        imageError: null,
      });
      return;
    }

    try {
      const result = await generateSceneImage(scene, characters);
      updateScene(sceneIndex, {
        imageUrl: result.imageUrl,
        imageSeed: result.seed,
        imageStatus: "done",
        imageError: null,
      });
    } catch (err) {
      updateScene(sceneIndex, {
        imageStatus: "error",
        imageError: (err as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Scene Images</h2>
        <p className="text-sm text-muted-foreground">
          Edit the prompt to change a scene, then click Regenerate.
        </p>
      </div>

      {generatingCount > 0 && (
        <GenerationProgress
          current={doneCount}
          total={scenes.length}
          label={`Generating scenes... ${doneCount} of ${scenes.length} done`}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {scenes.map((scene) => (
          <div key={scene.index} className="space-y-2">
            <h3 className="text-sm font-semibold">Scene {scene.index}</h3>
            <Textarea
              value={scene.prompt}
              onChange={(e) =>
                updateScene(scene.index, { prompt: e.target.value })
              }
              rows={4}
              className="text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleRegenerate(scene.index)}
              disabled={scene.imageStatus === "generating"}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
            <ImageCard
              imageUrl={scene.imageUrl}
              status={scene.imageStatus}
              error={scene.imageError}
              onRegenerate={() => handleRegenerate(scene.index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
