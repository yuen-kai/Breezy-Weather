// app/store/settingsStore.ts
import { create } from 'zustand';
import { ClothingItem } from '@/types/clothing';

type UnitType = 'imperial' | 'metric';

interface SettingsStore {
  unit: UnitType;
  darkMode: boolean;
  setUnit: (unit: UnitType) => void;
  toggleDarkMode: () => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  unit: 'imperial',
  darkMode: false,
  setUnit: (unit) => set(() => ({ unit })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

export default useSettingsStore;
export type { UnitType };
