import { falSubscribe } from "./fal";
import { buildScenePrompt } from "@/prompts/scene-prompt";
import { GLOBAL_NEGATIVE_BLOCK } from "@/prompts/style-blocks";
import type { SceneDef, CharacterDef } from "@/types/storyboard";

interface SceneGenResult {
  imageUrl: string;
  seed: number;
}

interface IdeogramResponse {
  images: { url: string }[];
  seed: number;
}

export async function generateSceneImage(
  scene: SceneDef,
  characters: CharacterDef[],
  onProgress?: (status: string) => void
): Promise<SceneGenResult> {
  const presentChars = characters.filter(
    (c) => scene.charactersPresent.includes(c.id) && c.imageUrl
  );

  const prompt = scene.prompt || buildScenePrompt(scene, characters);
  const referenceUrls = presentChars.map((c) => c.imageUrl!);

  onProgress?.("Generating scene image...");

  const result = await falSubscribe<IdeogramResponse>(
    "fal-ai/ideogram/character",
    {
      prompt,
      reference_image_urls: referenceUrls.length > 0 ? referenceUrls : [],
      rendering_speed: "BALANCED",
      style: "FICTION",
      image_size: "landscape_16_9",
      num_images: 1,
      negative_prompt: GLOBAL_NEGATIVE_BLOCK,
      expand_prompt: false,
    },
    onProgress
  );

  return { imageUrl: result.images[0].url, seed: result.seed };
}

export async function generateAllScenes(
  scenes: SceneDef[],
  characters: CharacterDef[],
  concurrency: number = 3,
  onSceneDone: (index: number, result: SceneGenResult) => void,
  onSceneError: (index: number, error: Error) => void
): Promise<void> {
  const queue = [...scenes];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const scene = queue.shift()!;
      try {
        const result = await generateSceneImage(scene, characters);
        onSceneDone(scene.index, result);
      } catch (err) {
        onSceneError(scene.index, err as Error);
      }
    }
  });
  await Promise.allSettled(workers);
}
