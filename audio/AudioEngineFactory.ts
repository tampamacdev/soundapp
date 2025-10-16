import { AudioEngine } from "../types/AudioEngine";
import { WebAudioEngine } from "./WebAudioEngine";
import { ExpoAudioEngine } from "./ExpoAudioEngine";
import { Platform } from "react-native";

export class AudioEngineFactory {
  static create(): AudioEngine {
    console.log("🔍 Platform.OS detected:", Platform.OS);
    console.log("🔍 typeof AudioContext:", typeof AudioContext);
    console.log("🔍 typeof window:", typeof window);

    // Check if we're in a web environment
    const isWeb = Platform.OS === "web" && typeof AudioContext !== "undefined";

    if (isWeb) {
      console.log("✅ Using WebAudioEngine for web platform");
      return new WebAudioEngine();
    } else {
      console.log("✅ Using ExpoAudioEngine for mobile platform");
      return new ExpoAudioEngine();
    }
  }

  static createWebAudio(): AudioEngine {
    return new WebAudioEngine();
  }

  static createExpoAudio(): AudioEngine {
    return new ExpoAudioEngine();
  }
}
