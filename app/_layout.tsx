// app/_layout.tsx
import React, { lazy, useEffect, useState } from "react";
import { Navigator, Slot, Stack, Tabs } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import useSettingsStore from "../store/store";
import { LightTheme, DarkTheme } from "../theme";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultCutoffs } from "../types/cutoffs";
import { defaultClothingItems } from "@/types/clothing";
import CustomSplashScreen from "../components/SplashScreen";
import * as Updates from "expo-updates";
import * as SplashScreen from "expo-splash-screen";

let initial = true;

// SplashScreen.preventAutoHideAsync();

const Layout = () => {
  // const [ready, setReady] = useState(false);
  // const [loadScreen, setLoadScreen] = useState(false);

  const { darkMode, setUnit, setDarkMode, setCutoffs, setClothingItems } =
    useSettingsStore();

  async function getSettings() {
    const keys = ["unit", "darkMode", "cutoffs", "clothing"];
    const defaults = {
      unit: "imperial",
      darkMode: false,
      cutoffs: defaultCutoffs,
      clothing: defaultClothingItems,
    };
    try {
      const results = await AsyncStorage.multiGet(keys);
      const missing: [string, string][] = [];
      results.forEach(([key, value]) => {
        if (value !== null) {
          switch (key) {
            case "unit":
              setUnit(JSON.parse(value));
              break;
            case "darkMode":
              setDarkMode(JSON.parse(value));
              break;
            case "cutoffs":
              setCutoffs(JSON.parse(value));
              break;
            case "clothing":
              setClothingItems(JSON.parse(value));
              break;
          }
        } else {
          missing.push([key, JSON.stringify(defaults[key as keyof typeof defaults])]);
        }
      });
      if (missing.length) await AsyncStorage.multiSet(missing);
    } catch (e) {
      console.error("error getting settings: " + e);
    }
  }

  async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
  
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.warn(`Error fetching latest Expo update: ${error}`);
      }
    }

  // useEffect(() => {
  //   if (!initial) return;
  //   const splashTimeout = setTimeout(() => {
  //     setReady(true);
  //   }, 1000);
  //   return () => clearTimeout(splashTimeout);
  // }, []);

  // Note: timeout starts after default splash screen is hidden => useEffect doesn't run immediately


  useEffect(() => {
    if (!initial) return;
    // const loadScreenTimeout = setTimeout(() => {
      initial = false;
      // setLoadScreen(true);
      onFetchUpdateAsync();
      getSettings();
    // }, 50);
    // return () => clearTimeout(loadScreenTimeout);

  }, []);

  return (
    <PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
      {/* <CustomSplashScreen /> */}
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Slot />
    </PaperProvider>
  );
};

export default Layout;
