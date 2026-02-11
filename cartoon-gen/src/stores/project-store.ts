import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CharacterDef, SceneDef, GenerationStatus } from "@/types/storyboard";
import { buildCharacterPrompt } from "@/prompts/character-prompt";

interface ProjectState {
  currentStep: number;
  setCurrentStep: (step: number) => void;

  script: string;
  setScript: (text: string) => void;

  title: string;
  characters: CharacterDef[];
  scenes: SceneDef[];
  storyboardStatus: GenerationStatus;
  storyboardError: string | null;

  setStoryboard: (
    title: string,
    characters: CharacterDef[],
    scenes: SceneDef[]
  ) => void;
  setStoryboardStatus: (status: GenerationStatus, error?: string) => void;

  updateCharacter: (id: string, updates: Partial<CharacterDef>) => void;
  addCharacter: (char: CharacterDef) => void;
  removeCharacter: (id: string) => void;

  updateScene: (index: number, updates: Partial<SceneDef>) => void;
  addScene: (scene: SceneDef) => void;
  removeScene: (index: number) => void;

  resetProject: () => void;
}

const initialState = {
  currentStep: 0,
  script: "",
  title: "",
  characters: [] as CharacterDef[],
  scenes: [] as SceneDef[],
  storyboardStatus: "idle" as GenerationStatus,
  storyboardError: null as string | null,
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      setScript: (text) => set({ script: text }),

      setStoryboard: (title, characters, scenes) =>
        set({ title, characters, scenes, storyboardStatus: "done", storyboardError: null }),

      setStoryboardStatus: (status, error) =>
        set({ storyboardStatus: status, storyboardError: error ?? null }),

      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      addCharacter: (char) =>
        set((state) => ({ characters: [...state.characters, char] })),

      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          scenes: state.scenes.map((s) => ({
            ...s,
            charactersPresent: s.charactersPresent.filter((cid) => cid !== id),
          })),
        })),

      updateScene: (index, updates) =>
        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.index === index ? { ...s, ...updates } : s
          ),
        })),

      addScene: (scene) =>
        set((state) => ({ scenes: [...state.scenes, scene] })),

      removeScene: (index) =>
        set((state) => ({
          scenes: state.scenes
            .filter((s) => s.index !== index)
            .map((s, i) => ({ ...s, index: i + 1 })),
        })),

      resetProject: () => set(initialState),
    }),
    {
      name: "cartoongen-project",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Reset stuck "generating" states from interrupted sessions
        state.characters = state.characters.map((c) =>
          c.imageStatus === "generating"
            ? { ...c, imageStatus: "idle" as const, imageError: null }
            : c
        );
        state.scenes = state.scenes.map((s) => ({
          ...s,
          imageStatus:
            s.imageStatus === "generating"
              ? ("idle" as const)
              : s.imageStatus,
          imageError: s.imageStatus === "generating" ? null : s.imageError,
          videoStatus:
            s.videoStatus === "generating"
              ? ("idle" as const)
              : s.videoStatus,
          videoError: s.videoStatus === "generating" ? null : s.videoError,
        }));
        if (state.storyboardStatus === "generating") {
          state.storyboardStatus = "idle";
          state.storyboardError = null;
        }
      },
    }
  )
);

export function createCharacterDef(raw: {
  id: string;
  name: string;
  role: string;
  identityLock: CharacterDef["identityLock"];
}): CharacterDef {
  const char: CharacterDef = {
    ...raw,
    imagePrompt: "",
    imageUrl: null,
    imageSeed: null,
    imageStatus: "idle",
    imageError: null,
  };
  char.imagePrompt = buildCharacterPrompt(char);
  return char;
}

export function createSceneDef(raw: {
  index: number;
  durationSeconds: number;
  charactersPresent: string[];
  setting: string;
  action: string;
  camera: string;
  prompt: string;
  videoMotionPrompt: string;
}): SceneDef {
  return {
    ...raw,
    imageUrl: null,
    imageSeed: null,
    imageStatus: "idle",
    imageError: null,
    videoUrl: null,
    videoStatus: "idle",
    videoError: null,
  };
}
