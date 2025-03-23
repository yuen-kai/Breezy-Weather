// app/store/settingsStore.ts
import { create } from 'zustand';
import { ClothingItem, defaultClothingItems } from '@/types/clothing';
import { Cutoffs, defaultCutoffs } from '@/types/cutoffs';
import WeatherApiResponse from '@/types/weather';
import { TimeOfDay, TimeOfDaySetting, defaultTimeOfDaySettings } from '@/types/timeOfDay';

type UnitType = 'imperial' | 'metric';

interface SettingsStore {
  darkMode: boolean;
  unit: UnitType;
  cutoffs: Cutoffs
  clothingItems: ClothingItem[];
  timeOfDay: TimeOfDay[];
  timeOfDaySettings: TimeOfDaySetting[];
  weatherData: WeatherApiResponse | null;
  setDarkMode: (mode: boolean) => void;
  setUnit: (unit: UnitType) => void;
  setCutoffs: (cutoffs: Cutoffs) => void;
  setClothingItems: (clothingItems: ClothingItem[]) => void;
  setTimeOfDay: (timeOfDay: TimeOfDay[]) => void;
  setTimeOfDaySettings: (timeOfDaySettings: TimeOfDaySetting[]) => void;
  setWeatherData: (data: WeatherApiResponse) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  unit: 'imperial',
  darkMode: false,
  cutoffs: defaultCutoffs,
  clothingItems: defaultClothingItems,
  timeOfDay: [],
  timeOfDaySettings: defaultTimeOfDaySettings,
  weatherData: null,
  setUnit: (unit) => set(() => ({ unit })),
  setDarkMode: (mode) => set(() => ({ darkMode: mode })),
  setCutoffs: (cutoffs) => set(() => ({ cutoffs })),
  setClothingItems: (clothingItems) => set(() => ({ clothingItems })),
  setTimeOfDay: (timeOfDay) => set(() => ({ timeOfDay })),
  setTimeOfDaySettings: (timeOfDaySettings) => set(() => ({ timeOfDaySettings })),
  setWeatherData: (data) => set(() => ({ weatherData: data }))
}));

export default useSettingsStore;
export type { UnitType };
