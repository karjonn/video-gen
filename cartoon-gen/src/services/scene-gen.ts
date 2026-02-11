import { falSubscribe, fal } from "./fal";
import { buildScenePrompt, buildCharacterEditPrompt } from "@/prompts/scene-prompt";
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

  if (presentChars.length === 0) {
    // No characters with images — generate scene without character reference
    const result = await falSubscribe<IdeogramResponse>(
      "fal-ai/ideogram/character",
      {
        prompt,
        rendering_speed: "BALANCED",
        style: "FICTION",
        image_size: "landscape_16_9",
        num_images: 1,
        negative_prompt: GLOBAL_NEGATIVE_BLOCK,
        expand_prompt: false,
        reference_image_urls: [],
      },
      onProgress
    );
    return { imageUrl: result.images[0].url, seed: result.seed };
  }

  // Pass 1: Generate scene with primary character's reference
  const primaryChar = presentChars[0];
  onProgress?.(`Generating scene with ${primaryChar.name}...`);

  let currentResult = await falSubscribe<IdeogramResponse>(
    "fal-ai/ideogram/character",
    {
      prompt,
      reference_image_urls: [primaryChar.imageUrl!],
      rendering_speed: "BALANCED",
      style: "FICTION",
      image_size: "landscape_16_9",
      num_images: 1,
      negative_prompt: GLOBAL_NEGATIVE_BLOCK,
      expand_prompt: false,
    },
    onProgress
  );

  let currentImageUrl = currentResult.images[0].url;
  let currentSeed = currentResult.seed;

  // Pass 2+: For each additional character, use character/edit with a mask
  for (let i = 1; i < presentChars.length; i++) {
    const additionalChar = presentChars[i];
    onProgress?.(`Adding ${additionalChar.name} to scene (pass ${i + 1})...`);

    const maskUrl = await generateCharacterPlacementMask(
      currentImageUrl,
      i,
      presentChars.length
    );

    const editResult = await falSubscribe<IdeogramResponse>(
      "fal-ai/ideogram/character/edit",
      {
        prompt: buildCharacterEditPrompt(scene, additionalChar),
        image_url: currentImageUrl,
        mask_url: maskUrl,
        reference_image_urls: [additionalChar.imageUrl!],
        rendering_speed: "BALANCED",
        style: "FICTION",
        num_images: 1,
        expand_prompt: false,
      },
      onProgress
    );

    currentImageUrl = editResult.images[0].url;
    currentSeed = editResult.seed;
  }

  return { imageUrl: currentImageUrl, seed: currentSeed };
}

async function generateCharacterPlacementMask(
  sceneImageUrl: string,
  charIndex: number,
  totalChars: number
): Promise<string> {
  // Load the scene image to get dimensions
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = sceneImageUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  // Black fill = keep everything
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // White rectangle = edit zone for this character
  const zoneWidth = canvas.width / totalChars;
  const x = zoneWidth * charIndex;
  const y = canvas.height * 0.15;
  const w = zoneWidth;
  const h = canvas.height * 0.8;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, w, h);

  // Convert to blob and upload via fal storage
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png");
  });
  const file = new File([blob], "mask.png", { type: "image/png" });
  const url = await fal.storage.upload(file);
  return url;
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
