// app/store/settingsStore.ts
import { create } from 'zustand';
import { ClothingItem, defaultClothingItems } from '@/types/clothing';
import { Cutoffs, defaultCutoffs } from '@/types/cutoffs';

type UnitType = 'imperial' | 'metric';

interface SettingsStore {
  darkMode: boolean;
  unit: UnitType;
  cutoffs: Cutoffs
  clothingItems: ClothingItem[];
  timeOfDay: string[];
  setDarkMode: (mode: boolean) => void;
  setUnit: (unit: UnitType) => void;
  setCutoffs: (cutoffs: Cutoffs) => void;
  setClothingItems: (clothingItems: ClothingItem[]) => void;
  setTimeOfDay: (timeOfDay: string[]) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  unit: 'imperial',
  darkMode: false,
  cutoffs: defaultCutoffs,
  clothingItems: defaultClothingItems,
  timeOfDay: [],
  setUnit: (unit) => set(() => ({ unit })),
  setDarkMode: (mode) => set(() => ({ darkMode: mode })),
  setCutoffs: (cutoffs) => set(() => ({ cutoffs })),
  setClothingItems: (clothingItems) => set(() => ({ clothingItems })),
  setTimeOfDay: (timeOfDay) => set(() => ({ timeOfDay }))
}));

export default useSettingsStore;
export type { UnitType };
