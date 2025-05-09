import { MD3DarkTheme, MD3LightTheme, useTheme } from "react-native-paper";

const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgb(79, 68, 226)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(227, 223, 255)",
    onPrimaryContainer: "rgb(16, 0, 105)",
    secondary: "rgb(82, 82, 183)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(226, 223, 255)",
    onSecondaryContainer: "rgb(11, 0, 107)",
    tertiary: "rgb(122, 83, 104)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(255, 216, 234)",
    onTertiaryContainer: "rgb(47, 17, 35)",
    error: "rgb(186, 26, 26)",
    extremeWarning: "rgb(186, 26, 26)",
    severeWarning: "rgb(208, 53, 22)",
    moderateWarning: "rgb(249, 174, 75)",
    regularWarning: "rgb(255, 180, 171)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(255, 251, 255)",
    onBackground: "rgb(28, 27, 31)",
    surface: "rgb(255, 251, 255)",
    onSurface: "rgb(28, 27, 31)",
    surfaceVariant: "rgb(228, 225, 236)",
    onSurfaceVariant: "rgb(71, 70, 79)",
    outline: "rgb(120, 118, 128)",
    outlineVariant: "rgb(200, 197, 208)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(49, 48, 52)",
    inverseOnSurface: "rgb(243, 239, 244)",
    inversePrimary: "rgb(196, 192, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(246, 242, 254)",
      level2: "rgb(241, 236, 253)",
      level3: "rgb(236, 231, 252)",
      level4: "rgb(234, 229, 252)",
      level5: "rgb(230, 225, 251)",
    },
    surfaceDisabled: "rgba(28, 27, 31, 0.12)",
    onSurfaceDisabled: "rgba(28, 27, 31, 0.38)",
    backdrop: "rgba(48, 47, 56, 0.4)",
    highlightedBox: "#007AFF",
    emptyBox: "lightgray",
  },
};

export type AppTheme = typeof LightTheme;

const DarkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "rgb(196, 192, 255)",
    onPrimary: "rgb(32, 0, 164)",
    primaryContainer: "rgb(54, 34, 202)",
    onPrimaryContainer: "rgb(227, 223, 255)",
    secondary: "rgb(194, 193, 255)",
    onSecondary: "rgb(34, 29, 135)",
    secondaryContainer: "rgb(58, 56, 158)",
    onSecondaryContainer: "rgb(226, 223, 255)",
    tertiary: "rgb(234, 185, 209)",
    onTertiary: "rgb(71, 38, 57)",
    tertiaryContainer: "rgb(96, 59, 79)",
    onTertiaryContainer: "rgb(255, 216, 234)",
    error: "rgb(255, 180, 171)",
    extremeWarning: "rgb(186, 26, 26)",
    severeWarning: "rgb(208, 53, 22)",
    moderateWarning: "rgb(249, 174, 75)",
    regularWarning: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(28, 27, 31)",
    onBackground: "rgb(229, 225, 230)",
    surface: "rgb(28, 27, 31)",
    onSurface: "rgb(229, 225, 230)",
    surfaceVariant: "rgb(71, 70, 79)",
    onSurfaceVariant: "rgb(200, 197, 208)",
    outline: "rgb(146, 143, 154)",
    outlineVariant: "rgb(71, 70, 79)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(229, 225, 230)",
    inverseOnSurface: "rgb(49, 48, 52)",
    inversePrimary: "rgb(79, 68, 226)",
    elevation: {
      level0: "transparent",
      level1: "rgb(36, 35, 42)",
      level2: "rgb(41, 40, 49)",
      level3: "rgb(47, 45, 56)",
      level4: "rgb(48, 47, 58)",
      level5: "rgb(52, 50, 62)",
    },
    surfaceDisabled: "rgba(229, 225, 230, 0.12)",
    onSurfaceDisabled: "rgba(229, 225, 230, 0.38)",
    backdrop: "rgba(48, 47, 56, 0.4)",
    highlightedBox: "#4169E1", // Royal Blue
    emptyBox: "#a0a0a0",
    // customize other colors as desired
  },
};

export { LightTheme, DarkTheme };

export const useAppTheme = () => useTheme<AppTheme>();
