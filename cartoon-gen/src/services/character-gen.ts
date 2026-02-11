import { falSubscribe } from "./fal";
import { GLOBAL_NEGATIVE_BLOCK } from "@/prompts/style-blocks";
import type { CharacterDef } from "@/types/storyboard";

interface CharacterGenResult {
  imageUrl: string;
  seed: number;
}

interface IdeogramResponse {
  images: { url: string }[];
  seed: number;
}

export async function generateCharacterImage(
  character: CharacterDef,
  onProgress?: (status: string) => void
): Promise<CharacterGenResult> {
  const result = await falSubscribe<IdeogramResponse>(
    "fal-ai/ideogram/character",
    {
      prompt: character.imagePrompt,
      rendering_speed: "BALANCED",
      style: "FICTION",
      image_size: "portrait_4_3",
      num_images: 1,
      negative_prompt: GLOBAL_NEGATIVE_BLOCK,
      expand_prompt: false,
      reference_image_urls: [],
    },
    onProgress
  );

  return {
    imageUrl: result.images[0].url,
    seed: result.seed,
  };
}

export async function generateAllCharacters(
  characters: CharacterDef[],
  onCharacterDone: (charId: string, result: CharacterGenResult) => void,
  onCharacterError: (charId: string, error: Error) => void
): Promise<void> {
  const promises = characters.map(async (char) => {
    try {
      const result = await generateCharacterImage(char);
      onCharacterDone(char.id, result);
    } catch (err) {
      onCharacterError(char.id, err as Error);
    }
  });
  await Promise.allSettled(promises);
}
