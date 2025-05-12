// app/store/settingsStore.ts
import { create } from 'zustand';
import { ClothingItem, defaultClothingItems } from '@/types/clothing';
import { Cutoffs, defaultCutoffs } from '@/types/cutoffs';
import WeatherApiResponse from '@/types/weather';
import { TimeOfDay, TimeOfDaySetting, defaultTimeOfDaySettings } from '@/types/timeOfDay';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UnitType = 'imperial' | 'metric';

interface SettingsStore {
  darkMode: boolean;
  unit: UnitType;
  cutoffs: Cutoffs
  clothingItems: ClothingItem[];
  timeOfDay: TimeOfDay[];
  timeOfDaySettings: TimeOfDaySetting[];
  weatherData: WeatherApiResponse | null; // weather data should remain in the background
  lastRefresh: number;
  pinnedLocations: {label: string, value: string}[];
  locationName: string;
  locationCoords: string;
  setDarkMode: (mode: boolean) => void;
  setUnit: (unit: UnitType) => void;
  setCutoffs: (cutoffs: Cutoffs) => void;
  setClothingItems: (clothingItems: ClothingItem[]) => void;
  setTimeOfDay: (timeOfDay: TimeOfDay[]) => void;
  setTimeOfDaySettings: (timeOfDaySettings: TimeOfDaySetting[]) => void;
  setWeatherData: (data: WeatherApiResponse) => void;
  setLastRefresh: (lastRefresh: number) => void;
  setPinnedLocations: (pinnedLocations: {label: string, value: string}[]) => void;
  addPinnedLocation: (location: {label: string, value: string}) => void;
  removePinnedLocation: (location: {label: string, value: string}) => void;
  setLocationName: (locationName: string) => void;
  setLocationCoords: (locationCoords: string) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  unit: 'imperial',
  darkMode: false,
  cutoffs: defaultCutoffs,
  clothingItems: defaultClothingItems,
  timeOfDay: [],
  timeOfDaySettings: defaultTimeOfDaySettings,
  lastRefresh: 0,
  weatherData: null,
  pinnedLocations: [],
  locationName: "",
  locationCoords: "",
  setUnit: (unit) => set(() => ({ unit })),
  setDarkMode: (mode) => set(() => ({ darkMode: mode })),
  setCutoffs: (cutoffs) => set(() => ({ cutoffs })),
  setClothingItems: (clothingItems) => set(() => ({ clothingItems })),
  setTimeOfDay: (timeOfDay) => set(() => ({ timeOfDay })),
  setTimeOfDaySettings: (timeOfDaySettings) => set(() => ({ timeOfDaySettings })),
  setWeatherData: (data) => set(() => ({ weatherData: data })),
  setLastRefresh: (lastRefresh) => set(() => ({ lastRefresh })),
  setPinnedLocations: (pinnedLocations) => set(() => ({ pinnedLocations })),
  addPinnedLocation: (location) => set((state) => {
    const newLocations = [...state.pinnedLocations, location];
    AsyncStorage.setItem('pinnedLocations', JSON.stringify(newLocations));
    return { pinnedLocations: newLocations };
  }),
  removePinnedLocation: (location) => set((state) => {
    const newLocations = state.pinnedLocations.filter((loc) => loc.value !== location.value);
    AsyncStorage.setItem('pinnedLocations', JSON.stringify(newLocations));
    return { pinnedLocations: newLocations };
  }),
  setLocationName: (locationName) => set(() => ({ locationName })),
  setLocationCoords: (locationCoords) => set(() => ({ locationCoords })),
}));

export default useSettingsStore;
export type { UnitType };
