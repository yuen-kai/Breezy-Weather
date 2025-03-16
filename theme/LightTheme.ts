import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    background: '#ffffff',
    surface: '#ffffff',
    onPrimary: '#ffffff',
    onSurface: '#000000',
    // customize other colors as desired
  },
};

export default LightTheme;