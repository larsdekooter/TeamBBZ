const IS_DEV = process.env.APP_VARIANT === "development";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.ldekooter.TeamBBZ.dev";
  return "com.ldekooter.TeamBBZ";
};

const getAppName = () => {
  if (IS_DEV) return "TeamBBZ (Dev)";
  return "TeamBBZ";
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});
