// Import all audio assets to ensure they're included in the web build
import snare from "./snare.mp3";
import kick from "./kick.mp3";
import hiHat from "./hi-hat.mp3";
import bass from "./bass.mp3";
import drums from "./drums.mp3";
import piano from "./piano.mp3";

// Export them so they can be used elsewhere
export const audioAssets = {
  snare,
  kick,
  hiHat,
  bass,
  drums,
  piano,
};

// Also export individual assets
export { snare, kick, hiHat, bass, drums, piano };

// Force imports to be used (prevents tree-shaking)
console.log("Audio assets loaded:", Object.keys(audioAssets));
