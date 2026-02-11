import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  openaiKey: string;
  falKey: string;
  openaiKeyValid: boolean;
  falKeyValid: boolean;
  setOpenaiKey: (key: string) => void;
  setFalKey: (key: string) => void;
  setOpenaiKeyValid: (valid: boolean) => void;
  setFalKeyValid: (valid: boolean) => void;
  clearKeys: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openaiKey: "",
      falKey: "",
      openaiKeyValid: false,
      falKeyValid: false,
      setOpenaiKey: (key) => set({ openaiKey: key, openaiKeyValid: false }),
      setFalKey: (key) => set({ falKey: key, falKeyValid: false }),
      setOpenaiKeyValid: (valid) => set({ openaiKeyValid: valid }),
      setFalKeyValid: (valid) => set({ falKeyValid: valid }),
      clearKeys: () =>
        set({ openaiKey: "", falKey: "", openaiKeyValid: false, falKeyValid: false }),
    }),
    {
      name: "cartoongen-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
