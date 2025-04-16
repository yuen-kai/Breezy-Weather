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
});

const IS_TEST = process.env.APP_VARIANT === "test";

const getUniqueAndroidIdentifier = () => {
  if (IS_TEST) {
    return "com.yuenkai.simpleWeather.test";
  }

  return "com.yuenkai.simpleWeather";
};

const getUniqueIOSIdentifier = () => {
  if (IS_TEST) {
    return "com.yuenkai.breezy.test";
  }

  return "com.yuenkai.breezy";
};

const getAppName = () => {
  if (IS_TEST) {
    return "Breezy (Test)";
  }

  return "Breezy";
};
