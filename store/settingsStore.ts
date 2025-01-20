// app/store/settingsStore.ts
import { create } from 'zustand';

type ScaleType = '1-3' | '1-5';
type UnitType = 'imperial' | 'metric';

interface ClothingItem {
  id: string;
  name: string;
  temperatureRange: [number, number]; // e.g., [0, 15] for jackets
}

interface SettingsStore {
  scale: ScaleType;
  unit: UnitType;
  clothingItems: ClothingItem[];
  darkMode: boolean;
  setScale: (scale: ScaleType) => void;
  setUnit: (unit: UnitType) => void;
  toggleDarkMode: () => void;
  addClothingItem: (item: ClothingItem) => void;
  removeClothingItem: (id: string) => void;
  updateClothingItem: (updatedItem: ClothingItem) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  scale: '1-5',
  unit: 'imperial',
  clothingItems: [
    { id: 'doublecoat_gloves', name: 'Double Coat + Gloves', temperatureRange: [-999, 15] },
    { id: 'doublecoat', name: 'Double Coat + Gloves', temperatureRange: [15, 35] },
    { id: 'coat_sweater', name: 'Coat + Sweater', temperatureRange: [35, 45] },
    { id: 'coat', name: 'Coat', temperatureRange: [45, 55] },
    { id: 'sweater', name: 'Sweater', temperatureRange: [55, 65] },
    { id: 't-shirt', name: 'T-Shirt', temperatureRange: [65, 999] },
  ],
  darkMode: false,
  setScale: (scale) => set(() => ({ scale })),
  setUnit: (unit) => set(() => ({ unit })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  addClothingItem: (item) =>
    set((state) => ({ clothingItems: [...state.clothingItems, item] })),
  removeClothingItem: (id) =>
    set((state) => ({
      clothingItems: state.clothingItems.filter((item) => item.id !== id),
    })),
  updateClothingItem: (updatedItem) =>
    set((state) => ({
      clothingItems: state.clothingItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    })),
}));

export default useSettingsStore;
export type { UnitType };
