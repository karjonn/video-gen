import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  openaiKey: string;
  falKey: string;
  openaiKeyValid: boolean;
  falKeyValid: boolean;
  testMode: boolean;
  setOpenaiKey: (key: string) => void;
  setFalKey: (key: string) => void;
  setOpenaiKeyValid: (valid: boolean) => void;
  setFalKeyValid: (valid: boolean) => void;
  setTestMode: (enabled: boolean) => void;
  clearKeys: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openaiKey: "",
      falKey: "",
      openaiKeyValid: false,
      falKeyValid: false,
      testMode: false,
      setOpenaiKey: (key) => set({ openaiKey: key, openaiKeyValid: false }),
      setFalKey: (key) => set({ falKey: key, falKeyValid: false }),
      setOpenaiKeyValid: (valid) => set({ openaiKeyValid: valid }),
      setFalKeyValid: (valid) => set({ falKeyValid: valid }),
      setTestMode: (enabled) =>
        set({
          testMode: enabled,
          openaiKeyValid: enabled,
          falKeyValid: enabled,
        }),
      clearKeys: () =>
        set({
          openaiKey: "",
          falKey: "",
          openaiKeyValid: false,
          falKeyValid: false,
          testMode: false,
        }),
    }),
    {
      name: "cartoongen-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
