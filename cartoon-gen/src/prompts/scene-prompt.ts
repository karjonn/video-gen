import type { SceneDef, CharacterDef } from "@/types/storyboard";

export function buildScenePrompt(
  scene: SceneDef,
  characters: CharacterDef[]
): string {
  const presentChars = characters.filter((c) =>
    scene.charactersPresent.includes(c.id)
  );

  // Describe characters by distinctive outfit color, e.g. "Rogan (red shirt kid)"
  const charDescriptions = presentChars
    .map((c) => `${c.name} (${c.identityLock.outfit} ${c.role})`)
    .join("; ");

  return [
    "3D animated style, crisp clean lines, sharp focus, high detail, clean render.",
    `Scene: ${scene.setting}.`,
    `Action: ${scene.action}.`,
    `Camera: ${scene.camera}.`,
    charDescriptions
      ? `Characters: ${charDescriptions}.`
      : "No characters in this scene.",
  ].join(" ");
}
