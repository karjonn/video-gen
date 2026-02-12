import { GLOBAL_STYLE_BLOCK } from "./style-blocks";
import type { CharacterDef } from "@/types/storyboard";

export function buildCharacterPrompt(character: CharacterDef): string {
  const id = character.identityLock;

  return [
    GLOBAL_STYLE_BLOCK,
    `Full-body character reference sheet of ${character.name}, a ${id.age}-year-old ${id.ethnicity} ${character.role}.`,
    `Skin tone: ${id.skinTone}.`,
    `Hair: ${id.hair}.`,
    `Outfit: ${id.outfit}.`,
    id.accessories.length > 0
      ? `Accessories: ${id.accessories.join(", ")}.`
      : "",
    `Face: ${id.faceNotes}.`,
    "Standing in a neutral friendly pose, facing slightly to the right, full body visible from head to toe.",
    "Clean background, character centered.",
    "Ultra-sharp detail, highly detailed face and eyes, 4K quality render, sharp focus on facial features.",
    "3D animated Pixar-quality character, NOT photorealistic, cartoon stylized, crisp clean lines.",
    "This character must look identical in every scene.",
  ]
    .filter(Boolean)
    .join(" ");
}
