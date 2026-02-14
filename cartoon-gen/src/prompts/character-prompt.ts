import type { CharacterDef } from "@/types/storyboard";

export function buildCharacterPrompt(character: CharacterDef): string {
  const id = character.identityLock;

  return [
    `${character.name}, ${character.role}, age ${id.age}.`,
    `Skin: ${id.skinTone}. Hair: ${id.hair}. Outfit: ${id.outfit}.`,
    `Face: ${id.faceNotes}.`,
    "Indian, 3D animated style.",
  ].join(" ");
}
