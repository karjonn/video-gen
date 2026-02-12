import { GLOBAL_STYLE_BLOCK } from "./style-blocks";
import type { SceneDef, CharacterDef } from "@/types/storyboard";

export function buildScenePrompt(
  scene: SceneDef,
  characters: CharacterDef[]
): string {
  const presentChars = characters.filter((c) =>
    scene.charactersPresent.includes(c.id)
  );

  // Describe characters by distinctive visual features so the model
  // matches each reference image to the right person in the scene
  const charDescriptions = presentChars
    .map((c, i) => {
      const id = c.identityLock;
      const refLabel = presentChars.length > 1 ? ` (reference ${i + 1})` : "";
      return `a ${id.age}-year-old ${id.ethnicity} ${c.role} wearing ${id.outfit}, ${id.hair} hair, ${id.skinTone} skin${refLabel}`;
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
    "Use the same character identity as the reference image(s).",
    "Maintain consistent character appearance across all scenes.",
    "Ultra-sharp detail, highly detailed faces, 4K quality, crisp clean lines.",
  ].join(" ");
}
