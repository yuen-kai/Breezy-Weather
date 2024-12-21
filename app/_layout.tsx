// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import useSettingsStore from './store/settingsStore';
import { LightTheme, DarkTheme } from './theme';

const Layout = () => {
  const { darkMode } = useSettingsStore();

  return (
    <PaperProvider theme={darkMode ? DarkTheme : LightTheme}>
      {/* If you want a custom status bar or other layout-level components, add them here */}
      <Slot />
    </PaperProvider>
  );
};

export default Layout;
