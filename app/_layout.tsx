// app/_layout.tsx
import React from "react";
import { Slot, Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import useSettingsStore from "../store/settingsStore";
import { LightTheme, DarkTheme } from "../theme";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
	const { darkMode } = useSettingsStore();

	return (
		<PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
      

			{/* If you want a custom status bar or other layout-level components, add them here */}
			{/* <Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="home" options={{}} />
				<Stack.Screen name="settings" options={{}} />
			</Stack> */}
			<Slot/>
			<StatusBar style={darkMode?"light":"dark"} />
		</PaperProvider>
	);
};

export default Layout;
