import { AudioEngine } from "../types/AudioEngine";
import { WebAudioEngine } from "./WebAudioEngine";
import { ExpoAudioEngine } from "./ExpoAudioEngine";
import { Platform } from "react-native";

export class AudioEngineFactory {
  static create(): AudioEngine {
    if (Platform.OS === "web") {
      return new WebAudioEngine();
    } else {
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
