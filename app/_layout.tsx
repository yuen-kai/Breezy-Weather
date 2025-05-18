import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import useSettingsStore from "../store/store";
import { LightTheme, DarkTheme } from "../theme";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultCutoffs } from "../types/cutoffs";
import { defaultClothingItems } from "@/types/clothing";
import * as SplashScreen from "expo-splash-screen";
import { defaultTimeOfDaySettings, defaultTimeOfDay, TimeOfDay } from "@/types/timeOfDay";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";

SplashScreen.preventAutoHideAsync();
let initial = true;

const Layout = () => {
  const {
    darkMode,
    setUnit,
    setDarkMode,
    setCutoffs,
    setClothingItems,
    setTimeOfDaySettings,
    setDefaultTimeOfDay,
    setTimeOfDay,
  } = useSettingsStore();

  async function getSettings() {
    type SettingKey =
      | "unit"
      | "darkMode"
      | "cutoffs"
      | "clothing"
      | "timeOfDaySettings"
      | "defaultTimeOfDay";

    const keys: SettingKey[] = [
      "unit",
      "darkMode",
      "cutoffs",
      "clothing",
      "timeOfDaySettings",
      "defaultTimeOfDay",
    ];
    const defaults: Record<SettingKey, any> = {
      unit: "imperial",
      darkMode: false,
      cutoffs: defaultCutoffs,
      clothing: defaultClothingItems,
      timeOfDaySettings: defaultTimeOfDaySettings,
      defaultTimeOfDay: defaultTimeOfDay,
    };

    const setters: Record<SettingKey, (value: any) => void> = {
      unit: setUnit,
      darkMode: setDarkMode,
      cutoffs: setCutoffs,
      clothing: setClothingItems,
      timeOfDaySettings: setTimeOfDaySettings,
      defaultTimeOfDay: handleSetDefaultTimeOfDay,
    };

    function handleSetDefaultTimeOfDay(value: TimeOfDay[]) {
      setDefaultTimeOfDay(value);
      setTimeOfDay(getTimeOfDay(value));
    }

    function getTimeOfDay(value: TimeOfDay[]): TimeOfDay[] {
      // If defaultTimeOfDay is set, use it instead of calculating based on current hour
      if (value) return value;

      // Fallback to time-based calculation if defaultTimeOfDay is not set
      const h = new Date().getHours();
      if (h < 7) return ["earlyMorning", "morning", "noon", "evening"];
      if (h >= 20 && h < 24) return ["morning", "noon", "evening", "night"];
      return ["morning", "noon", "evening"];
    }

    try {
      const results = await AsyncStorage.multiGet(keys);
      const missing: [SettingKey, string][] = [];
      results.forEach(([key, value]) => {
        const settingKey = key as SettingKey;

        if (value != null && settingKey in setters) {
          setters[settingKey](JSON.parse(value));
        } else {
          missing.push([settingKey, JSON.stringify(defaults[settingKey])]);
        }
      });
      if (missing.length) await AsyncStorage.multiSet(missing);
    } catch (e) {
      console.error("error getting settings: " + e);
    }
  }

  useEffect(() => {
    if (!initial) return;
    initial = false;
    getSettings();
  }, []);

  return (
    <PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Tabs>
        <TabSlot />
        <TabList>
          <TabTrigger href="/" name="Home" />
          <TabTrigger href="/settings" name="Settings" />
        </TabList>
      </Tabs>
    </PaperProvider>
  );
};

export default Layout;
