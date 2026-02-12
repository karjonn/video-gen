import OpenAI from "openai";
import {
  CHARACTER_SYSTEM_PROMPT,
  buildCharacterUserPrompt,
  SCENE_SYSTEM_PROMPT,
  buildSceneUserPrompt,
} from "@/prompts/storyboard-prompt";
import { charactersOnlySchema, scenesOnlySchema } from "@/schemas/storyboard-schema";
import type { CharactersJSON, ScenesJSON, CharacterDef } from "@/types/storyboard";

let client: OpenAI | null = null;

export function initOpenAI(apiKey: string): void {
  client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const tempClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    await tempClient.models.list();
    return true;
  } catch {
    return false;
  }
}

export async function generateCharacters(
  script: string
): Promise<CharactersJSON> {
  if (!client) throw new Error("OpenAI client not initialized");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: CHARACTER_SYSTEM_PROMPT },
      { role: "user", content: buildCharacterUserPrompt(script) },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT-4o");

  const parsed = JSON.parse(content);
  return charactersOnlySchema.parse(parsed);
}

export async function generateScenes(
  script: string,
  characters: CharacterDef[]
): Promise<ScenesJSON> {
  if (!client) throw new Error("OpenAI client not initialized");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SCENE_SYSTEM_PROMPT },
      { role: "user", content: buildSceneUserPrompt(script, characters) },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT-4o");

  const parsed = JSON.parse(content);
  return scenesOnlySchema.parse(parsed);
}
