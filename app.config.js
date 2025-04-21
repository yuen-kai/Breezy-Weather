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

const getUniqueAndroidIdentifier = () => {
  if (IS_DEV) {
    return "com.yuenkai.simpleWeather.dev";
  }

  return "com.yuenkai.simpleWeather";
};

const getUniqueIOSIdentifier = () => {
  if (IS_DEV) {
    return "com.yuenkai.breezy.dev";
  }

  return "com.yuenkai.breezy";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Breezy (Test)";
  }

  return "Breezy";
};
