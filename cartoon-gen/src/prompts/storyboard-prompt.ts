import type { CharacterDef } from "@/types/storyboard";

// ── Character extraction ────────────────────────────────────────────

export const CHARACTER_SYSTEM_PROMPT = `You are a children's animation character designer. Given a nursery rhyme script, extract ALL characters and create identity descriptions.

RULES:
1. All characters MUST be Indian (Indian names, Indian ethnicity, warm brown skin tones, culturally appropriate clothing).
2. Visual style: 3D animated style with crisp clean lines, sharp focus, high detail, clean render.
3. Each character must have a FIXED identity lock with a specific outfit color that distinguishes them from other characters. Give each character a different shirt/outfit color.
4. Include characters explicitly mentioned AND implied (e.g., if a mother serves food, include the mother).

OUTPUT FORMAT (strict JSON, no markdown):
{
  "title": "string - title of the nursery rhyme",
  "characters": [
    {
      "id": "char_<lowercase_name>",
      "name": "string",
      "role": "string (e.g., child, mother, animal, narrator)",
      "identityLock": {
        "ethnicity": "Indian",
        "skinTone": "warm brown (specify shade)",
        "hair": "hair description",
        "outfit": "outfit description with a DISTINCTIVE color (e.g., bright red kurta, blue saree)",
        "accessories": [],
        "age": "number as string",
        "faceNotes": "specific facial features"
      }
    }
  ]
}`;

export function buildCharacterUserPrompt(script: string, userNotes?: string): string {
  const notesBlock = userNotes?.trim()
    ? `\n\nADDITIONAL NOTES FROM THE PRODUCER:\n---\n${userNotes.trim()}\n---\nIncorporate these notes into your character designs where applicable.`
    : "";

  return `Extract all characters from the following nursery rhyme. Create identity descriptions for each character.

NURSERY RHYME SCRIPT:
---
${script}
---${notesBlock}

Remember:
- All characters must be Indian
- Give each character a different, distinctive outfit/shirt color so they can be told apart
- Return valid JSON only, no markdown code fences`;
}

// ── Scene generation ────────────────────────────────────────────────

export const SCENE_SYSTEM_PROMPT = `You are a children's animation storyboard artist. Given a nursery rhyme and an approved character list, create a scene-by-scene breakdown.

RULES:
1. Only use character IDs from the provided character list.
2. Create as many scenes as needed to cover the entire nursery rhyme.
3. Each scene must specify exactly which characters are present using their character IDs.
4. In each scene prompt, describe characters by their distinctive feature, e.g. "Rogan (red shirt kid)" or "Amma (green saree mother)". This is critical for image generation.
5. Scene prompts should be detailed enough for an image generation model to produce a coherent image.
6. Video motion prompts should describe subtle, gentle movements appropriate for young children's content.
7. Camera angles should be simple: medium shots, wide shots, close-ups.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "scenes": [
    {
      "index": 1,
      "durationSeconds": 10,
      "charactersPresent": ["char_id1", "char_id2"],
      "setting": "specific location description",
      "action": "what happens in this scene",
      "camera": "shot type and angle",
      "prompt": "FULL detailed image generation prompt including style, setting, characters described by distinctive outfit color, action, and camera",
      "videoMotionPrompt": "subtle motion description for video generation"
    }
  ]
}`;

export function buildSceneUserPrompt(
  script: string,
  characters: CharacterDef[],
  userNotes?: string
): string {
  const charSummary = characters.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    identityLock: c.identityLock,
  }));

  const notesBlock = userNotes?.trim()
    ? `\n\nADDITIONAL NOTES FROM THE PRODUCER:\n---\n${userNotes.trim()}\n---\nIncorporate these notes into your scene designs where applicable.`
    : "";

  return `Create a scene-by-scene storyboard for the following nursery rhyme using ONLY the approved characters below.

APPROVED CHARACTERS:
---
${JSON.stringify(charSummary, null, 2)}
---

NURSERY RHYME SCRIPT:
---
${script}
---${notesBlock}

Remember:
- Only use character IDs from the approved list above
- Describe each character by their distinctive outfit color in the prompt, e.g. "Rogan (red shirt kid)", "Amma (green saree mother)"
- Include the style in each scene prompt: "3D animated style, crisp clean lines, sharp focus, high detail, clean render"
- Return valid JSON only, no markdown code fences`;
}

// ── Legacy (kept for backward compat) ───────────────────────────────

export const STORYBOARD_SYSTEM_PROMPT = CHARACTER_SYSTEM_PROMPT;
export const buildStoryboardUserPrompt = buildCharacterUserPrompt;
