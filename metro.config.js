const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure all assets are included in the bundle
config.resolver.assetExts.push("mp3", "wav", "ogg");

// Web-specific configuration
if (process.env.EXPO_PLATFORM === "web") {
  config.transformer = {
    ...config.transformer,
    hermesParser: false,
    minifierConfig: {
      keep_fnames: true,
      mangle: false,
    },
  };

  config.resolver = {
    ...config.resolver,
    platforms: ["ios", "android", "native", "web"],
  };
}

module.exports = config;
