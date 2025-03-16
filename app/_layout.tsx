// app/_layout.tsx
import React, { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import useSettingsStore from "../store/settingsStore";
import { LightTheme, DarkTheme } from "../theme";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultCutoffs } from "../types/cutoffs";
import { defaultClothingItems } from "@/types/clothing";

let initial = true;

const Layout = () => {
	const {
		darkMode,
		setUnit,
		setDarkMode,
		setCutoffs,
		setClothingItems
	} = useSettingsStore();


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

	async function resetAsyncStorage() {
		await AsyncStorage.removeItem("clothing");
	}

	useEffect(() => {
		if (!initial) return
		initial = false
		getSettings();
	}, []);


	return (
		<PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
			<Slot />
			<StatusBar style={darkMode ? "light" : "dark"} />
		</PaperProvider>
	);
};

export default Layout;
