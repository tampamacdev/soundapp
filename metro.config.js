const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure all assets are included in the bundle
config.resolver.assetExts.push("mp3", "wav", "ogg");

module.exports = config;
