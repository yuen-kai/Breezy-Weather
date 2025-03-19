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
		setClothingItems,
		setTimeOfDay
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

	function getTimeOfDay() {
		const h = new Date().getHours();
		if (h >= 20 && h < 24) return ["night"];
		let tempTimeOfDay = [];
		if (h < 7) tempTimeOfDay.push("earlyMorning");
		if (h < 11) tempTimeOfDay.push("morning");
		if (h < 15) tempTimeOfDay.push("noon");
		if (h < 20) tempTimeOfDay.push("evening");
		return tempTimeOfDay;
	}

	useEffect(() => {
		if (!initial) return
		initial = false
		getSettings();
		setTimeOfDay(getTimeOfDay());
	}, []);


	return (
		<PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
			<Slot />
			<StatusBar style={darkMode ? "light" : "dark"} />
		</PaperProvider>
	);
};

export default Layout;
