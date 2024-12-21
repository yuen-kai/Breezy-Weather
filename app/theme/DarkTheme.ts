import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#bb86fc',
    background: '#121212',
    surface: '#121212',
    onPrimary: '#000000',
    onSurface: '#ffffff',
    // customize other colors as desired
  },
};

export default DarkTheme;