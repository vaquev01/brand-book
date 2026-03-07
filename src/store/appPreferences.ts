"use client";

import type { AiTextProvider } from "@/lib/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppPreferencesState = {
  strategyProvider: AiTextProvider;
  promptOpsProvider: AiTextProvider;
  hasHydrated: boolean;
  setStrategyProvider: (provider: AiTextProvider) => void;
  setPromptOpsProvider: (provider: AiTextProvider) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      strategyProvider: "openai",
      promptOpsProvider: "openai",
      hasHydrated: false,
      setStrategyProvider: (provider) => set({ strategyProvider: provider }),
      setPromptOpsProvider: (provider) => set({ promptOpsProvider: provider }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "bb_app_preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        strategyProvider: state.strategyProvider,
        promptOpsProvider: state.promptOpsProvider,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const selectStrategyProvider = (state: AppPreferencesState) => state.strategyProvider;
export const selectPromptOpsProvider = (state: AppPreferencesState) => state.promptOpsProvider;
export const selectHasHydrated = (state: AppPreferencesState) => state.hasHydrated;
export const selectSetStrategyProvider = (state: AppPreferencesState) => state.setStrategyProvider;
export const selectSetPromptOpsProvider = (state: AppPreferencesState) => state.setPromptOpsProvider;
