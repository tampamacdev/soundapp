import { Audio } from "expo-av";
import { AudioEngine, AudioBuffer, AudioSource } from "../types/AudioEngine";

export class ExpoAudioEngine implements AudioEngine {
  private sounds = new Map<string, Audio.Sound>();
  private sources = new Map<string, AudioSource>();
  private isInitializedFlag = false;

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitializedFlag = true;
      console.log("✅ Expo Audio Engine initialized");
    } catch (error) {
      console.error("Failed to initialize Expo Audio:", error);
      throw error;
    }
  }

  async loadAudioFile(uri: string): Promise<AudioBuffer> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sounds.set(uri, sound);

      const status = await sound.getStatusAsync();
      const duration =
        status.isLoaded && "durationMillis" in status && status.durationMillis
          ? status.durationMillis / 1000
          : 0;

      return {
        duration,
        sampleRate: 44100, // Expo AV doesn't expose this directly
        channels: 2, // Expo AV doesn't expose this directly
        data: sound,
      };
    } catch (error) {
      console.error("Failed to load audio file:", error);
      throw error;
    }
  }

  async playSample(buffer: AudioBuffer, volume = 1): Promise<AudioSource> {
    const sound = buffer.data as Audio.Sound;
    const sourceId = `source_${Date.now()}_${Math.random()}`;

    try {
      await sound.setVolumeAsync(volume);
      await sound.playAsync();

      const audioSource: AudioSource = {
        id: sourceId,
        volume,
        isPlaying: true,
      };

      this.sources.set(sourceId, audioSource);

      // Update status when finished
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          audioSource.isPlaying = false;
          this.sources.delete(sourceId);
        }
      });

      return audioSource;
    } catch (error) {
      console.error("Failed to play sample:", error);
      throw error;
    }
  }

  async stopSample(sourceId: string): Promise<void> {
    const source = this.sources.get(sourceId);
    if (source) {
      // Find the sound associated with this source
      for (const [uri, sound] of this.sounds) {
        try {
          await sound.stopAsync();
        } catch (error) {
          // Sound might already be stopped
        }
      }
      this.sources.delete(sourceId);
    }
  }

  async stopAll(): Promise<void> {
    for (const [uri, sound] of this.sounds) {
      try {
        await sound.stopAsync();
      } catch (error) {
        // Sound might already be stopped
      }
    }
    this.sources.clear();
  }

  async setVolume(sourceId: string, volume: number): Promise<void> {
    const source = this.sources.get(sourceId);
    if (source) {
      source.volume = volume;

      // Find and update the associated sound
      for (const [uri, sound] of this.sounds) {
        try {
          await sound.setVolumeAsync(volume);
        } catch (error) {
          console.error("Failed to set volume:", error);
        }
      }
    }
  }

  isInitialized(): boolean {
    return this.isInitializedFlag;
  }
}
