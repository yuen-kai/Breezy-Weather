export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIOSIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueAndroidIdentifier(),
  },
  plugins: [
    ["expo-custom-assets", {
      assetsPaths: [
        "./assets/preload/",
      ]
    }],
  ],
});

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_DEBUG = process.env.APP_VARIANT === "debug";

const getUniqueAndroidIdentifier = () => {
  if (IS_DEV) {
    return "com.yuenkai.simpleWeather.dev";
  }
  if (IS_DEBUG) {
    return "com.yuenkai.simpleWeather.debug";
  }

  return "com.yuenkai.simpleWeather";
};

const getUniqueIOSIdentifier = () => {
  if (IS_DEV) {
    return "com.yuenkai.breezy.dev";
  }
  if (IS_DEBUG) {
    return "com.yuenkai.breezy.debug";
  }

  return "com.yuenkai.breezy";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Breezy (Test)";
  }
  if (IS_DEBUG) {
    return "Breezy (Debug)";
  }

  return "Breezy";
};
