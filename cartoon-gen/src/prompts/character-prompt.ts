import type { CharacterDef } from "@/types/storyboard";

export function buildCharacterPrompt(character: CharacterDef): string {
  const id = character.identityLock;

  return [
    `${character.name}, ${character.role}, age ${id.age}.`,
    `Skin: ${id.skinTone}. Hair: ${id.hair}. Outfit: ${id.outfit}.`,
    id.accessories.length > 0 ? `Accessories: ${id.accessories.join(", ")}.` : "",
    `Face: ${id.faceNotes}.`,
    "Full body image, white background, Pixar style 3D animation.",
  ]
    .filter(Boolean)
    .join(" ");
}
