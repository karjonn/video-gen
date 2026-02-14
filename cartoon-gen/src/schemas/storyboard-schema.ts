import { z } from "zod";

const identityLockSchema = z.object({
  ethnicity: z.string(),
  skinTone: z.string(),
  hair: z.string(),
  outfit: z.string(),
  accessories: z.array(z.string()).optional().default([]),
  age: z.string(),
  faceNotes: z.string(),
});

const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  identityLock: identityLockSchema,
});

const sceneSchema = z.object({
  index: z.number(),
  durationSeconds: z.number(),
  charactersPresent: z.array(z.string()),
  setting: z.string(),
  action: z.string(),
  camera: z.string(),
  prompt: z.string(),
  videoMotionPrompt: z.string(),
});

export const storyboardSchema = z.object({
  title: z.string(),
  characters: z.array(characterSchema).min(1),
  scenes: z.array(sceneSchema).min(1),
});

export const charactersOnlySchema = z.object({
  title: z.string(),
  characters: z.array(characterSchema).min(1),
});

export const scenesOnlySchema = z.object({
  scenes: z.array(sceneSchema).min(1),
});

export type StoryboardSchemaType = z.infer<typeof storyboardSchema>;
