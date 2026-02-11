import OpenAI from "openai";
import {
  STORYBOARD_SYSTEM_PROMPT,
  buildStoryboardUserPrompt,
} from "@/prompts/storyboard-prompt";
import { storyboardSchema } from "@/schemas/storyboard-schema";
import type { StoryboardJSON } from "@/types/storyboard";

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

export async function generateStoryboard(
  script: string
): Promise<StoryboardJSON> {
  if (!client) throw new Error("OpenAI client not initialized");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: STORYBOARD_SYSTEM_PROMPT },
      { role: "user", content: buildStoryboardUserPrompt(script) },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT-4o");

  const parsed = JSON.parse(content);
  return storyboardSchema.parse(parsed);
}
