export interface IdentityLock {
  ethnicity: string;
  skinTone: string;
  hair: string;
  outfit: string;
  accessories: string[];
  age: string;
  faceNotes: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  identityLock: IdentityLock;
  imagePrompt: string;
  imageUrl: string | null;
  imageSeed: number | null;
  imageStatus: GenerationStatus;
  imageError: string | null;
}

export interface SceneDef {
  index: number;
  durationSeconds: number;
  charactersPresent: string[];
  setting: string;
  action: string;
  camera: string;
  prompt: string;
  videoMotionPrompt: string;
  imageUrl: string | null;
  imageSeed: number | null;
  imageStatus: GenerationStatus;
  imageError: string | null;
  videoUrl: string | null;
  videoStatus: GenerationStatus;
  videoError: string | null;
}

export type GenerationStatus = "idle" | "generating" | "done" | "error";

export interface StoryboardJSON {
  title: string;
  characters: {
    id: string;
    name: string;
    role: string;
    identityLock: IdentityLock;
  }[];
  scenes: {
    index: number;
    durationSeconds: number;
    charactersPresent: string[];
    setting: string;
    action: string;
    camera: string;
    prompt: string;
    videoMotionPrompt: string;
  }[];
}

export interface CharactersJSON {
  title: string;
  characters: {
    id: string;
    name: string;
    role: string;
    identityLock: IdentityLock;
  }[];
}

export interface ScenesJSON {
  scenes: {
    index: number;
    durationSeconds: number;
    charactersPresent: string[];
    setting: string;
    action: string;
    camera: string;
    prompt: string;
    videoMotionPrompt: string;
  }[];
}
