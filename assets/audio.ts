// Direct imports of all audio files to force bundling
import snareMp3 from "./snare.mp3";
import kickMp3 from "./kick.mp3";
import hiHatMp3 from "./hi-hat.mp3";
import bassMp3 from "./bass.mp3";
import drumsMp3 from "./drums.mp3";
import pianoMp3 from "./piano.mp3";

// Export as a map for easy access
export const audioFiles = {
  "snare.mp3": snareMp3,
  "kick.mp3": kickMp3,
  "hi-hat.mp3": hiHatMp3,
  "bass.mp3": bassMp3,
  "drums.mp3": drumsMp3,
  "piano.mp3": pianoMp3,
};

// Force all imports to be used
Object.values(audioFiles).forEach((url) => {
  console.log("Audio file URL:", url);
});
