import { GLOBAL_STYLE_BLOCK } from "./style-blocks";
import type { SceneDef, CharacterDef } from "@/types/storyboard";

export function buildScenePrompt(
  scene: SceneDef,
  characters: CharacterDef[]
): string {
  const charDescriptions = characters
    .filter((c) => scene.charactersPresent.includes(c.id))
    .map((c) => {
      const id = c.identityLock;
      return `${c.name} (${id.age}-year-old ${id.ethnicity} ${c.role}, ${id.skinTone} skin, ${id.hair}, wearing ${id.outfit}, ${id.faceNotes})`;
    })
    .join("; ");

  return [
    GLOBAL_STYLE_BLOCK,
    `Scene: ${scene.setting}.`,
    `Action: ${scene.action}.`,
    `Camera: ${scene.camera}.`,
    charDescriptions
      ? `Characters present: ${charDescriptions}.`
      : "No characters in this scene.",
    "Use the same character identity as the reference image.",
    "Maintain consistent character appearance across all scenes.",
  ].join(" ");
}

export function buildCharacterEditPrompt(
  scene: SceneDef,
  character: CharacterDef
): string {
  const id = character.identityLock;
  return [
    GLOBAL_STYLE_BLOCK,
    `Add ${character.name} to this scene.`,
    `${character.name} is a ${id.age}-year-old ${id.ethnicity} ${character.role} with ${id.skinTone} skin, ${id.hair}, wearing ${id.outfit}.`,
    `Face: ${id.faceNotes}.`,
    `Action in scene: ${scene.action}.`,
    "Use the same character identity as the reference image.",
    "Blend naturally with the existing scene lighting and perspective.",
  ].join(" ");
}
