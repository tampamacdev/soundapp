import { AudioEngine, AudioBuffer, AudioSource } from "../types/AudioEngine";

export class WebAudioEngine implements AudioEngine {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private sources = new Map<string, AudioBufferSourceNode[]>();
  private gainNodes = new Map<string, GainNode[]>();

  async initialize(): Promise<void> {
    if (typeof AudioContext !== "undefined") {
      this.context = new AudioContext();
      console.log("✅ Web Audio Engine initialized");
    } else {
      throw new Error("AudioContext not available");
    }
  }

  async loadAudioFile(uri: string): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error("Audio context not initialized");
    }

    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.context.decodeAudioData(arrayBuffer);

      const audioBuffer: AudioBuffer = {
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        data: buffer,
      };

      this.buffers.set(uri, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Failed to load audio file:", error);
      throw error;
    }
  }

  async playSample(buffer: AudioBuffer, volume = 1): Promise<AudioSource> {
    if (!this.context) {
      throw new Error("Audio context not initialized");
    }

    // Resume context if suspended
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();

    source.buffer = buffer.data;
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.context.destination);

    const sourceId = `source_${Date.now()}_${Math.random()}`;

    // Track sources for cleanup
    if (!this.sources.has(sourceId)) {
      this.sources.set(sourceId, []);
      this.gainNodes.set(sourceId, []);
    }

    this.sources.get(sourceId)!.push(source);
    this.gainNodes.get(sourceId)!.push(gain);

    // Clean up when finished
    source.onended = () => {
      this.sources.delete(sourceId);
      this.gainNodes.delete(sourceId);
    };

    source.start(0);

    return {
      id: sourceId,
      volume,
      isPlaying: true,
    };
  }

  async stopSample(sourceId: string): Promise<void> {
    const sources = this.sources.get(sourceId);
    if (sources) {
      sources.forEach((source) => {
        try {
          source.stop();
        } catch (error) {
          // Source might already be stopped
        }
      });
      this.sources.delete(sourceId);
      this.gainNodes.delete(sourceId);
    }
  }

  async stopAll(): Promise<void> {
    this.sources.forEach((sources) => {
      sources.forEach((source) => {
        try {
          source.stop();
        } catch (error) {
          // Source might already be stopped
        }
      });
    });
    this.sources.clear();
    this.gainNodes.clear();
  }

  async setVolume(sourceId: string, volume: number): Promise<void> {
    const gainNodes = this.gainNodes.get(sourceId);
    if (gainNodes) {
      gainNodes.forEach((gain) => {
        gain.gain.value = volume;
      });
    }
  }

  isInitialized(): boolean {
    return this.context !== null;
  }
}
