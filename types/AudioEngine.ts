export interface AudioBuffer {
  duration: number;
  sampleRate: number;
  channels: number;
  data?: any; // Platform-specific buffer data
}

export interface AudioSource {
  id: string;
  volume: number;
  isPlaying: boolean;
}

export interface AudioEngine {
  initialize(): Promise<void>;
  loadAudioFile(uri: string): Promise<AudioBuffer>;
  playSample(buffer: AudioBuffer, volume?: number): Promise<AudioSource>;
  stopSample(sourceId: string): Promise<void>;
  stopAll(): Promise<void>;
  setVolume(sourceId: string, volume: number): Promise<void>;
  isInitialized(): boolean;
}
