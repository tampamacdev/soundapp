import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { audioFiles } from "../assets/audio";
import { AudioEngine } from "../types/AudioEngine";
import { AudioEngineFactory } from "../audio/AudioEngineFactory";

interface TrackMixer {
  id: string;
  name: string;
  fileName: string;
  volume: number;
  duration: number;
  gainNode?: GainNode;
  sourceNode?: AudioBufferSourceNode;
}

const tracks: TrackMixer[] = [
  { id: "1", name: "Drums", fileName: "drums.mp3", volume: 0.8, duration: 0 },
  { id: "2", name: "Piano", fileName: "piano.mp3", volume: 0.6, duration: 0 },
  { id: "3", name: "Bass", fileName: "bass.mp3", volume: 0.9, duration: 0 },
];

export default function MixerScreen() {
  const [trackData, setTrackData] = useState<TrackMixer[]>(tracks);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shortestDuration, setShortestDuration] = useState<number>(0);
  const [audioEngine] = useState<AudioEngine>(() =>
    AudioEngineFactory.create()
  );
  const audioBuffers = useRef<Map<string, any>>(new Map());
  const activeSources = useRef<Map<string, any>>(new Map());

  // Load audio files and initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        await loadAudioFiles();
        setIsLoading(false);
        console.log("✅ Audio system initialized successfully");
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        Alert.alert("Audio Error", "Failed to initialize audio system");
        setIsLoading(false);
      }
    };

    initAudio();
  }, []);

  // Load all audio files
  const loadAudioFiles = async () => {
    try {
      const loadedTracks = await Promise.all(
        trackData.map(async (track) => {
          try {
            const assetUrl = audioFiles[track.fileName];
            if (!assetUrl) {
              throw new Error(`Asset not found: ${track.fileName}`);
            }

            const buffer = await audioEngine.loadAudioFile(assetUrl);
            audioBuffers.current.set(track.id, buffer);

            return {
              ...track,
              duration: buffer.duration,
            };
          } catch (error) {
            console.error(`Failed to load ${track.name}:`, error);
            return track;
          }
        })
      );

      setTrackData(loadedTracks);

      // Find shortest duration
      const durations = loadedTracks
        .map((track) => track.duration)
        .filter((d) => d > 0);
      if (durations.length > 0) {
        const shortest = Math.min(...durations);
        setShortestDuration(shortest);
      }

      console.log("✅ All audio files loaded successfully");
    } catch (error) {
      console.error("Failed to load audio files:", error);
    }
  };

  const handleVolumeChange = (trackId: string, volume: number) => {
    setTrackData((prevTracks) =>
      prevTracks.map((track) => {
        if (track.id === trackId) {
          // Update volume in audio engine
          const sourceId = activeSources.current.get(trackId);
          if (sourceId) {
            audioEngine.setVolume(sourceId, volume);
          }
          return { ...track, volume };
        }
        return track;
      })
    );
  };

  const handlePlayPause = async () => {
    if (!audioEngine.isInitialized()) {
      Alert.alert("Audio not available", "Audio engine not initialized");
      return;
    }

    if (isPlaying) {
      // Stop all playback
      await audioEngine.stopAll();
      activeSources.current.clear();
      setIsPlaying(false);
    } else {
      // Start playback
      try {
        // Start playback for each track
        for (const track of trackData) {
          const buffer = audioBuffers.current.get(track.id);
          if (buffer) {
            const source = await audioEngine.playSample(buffer, track.volume);
            activeSources.current.set(track.id, source.id);
          }
        }

        setIsPlaying(true);
        console.log("🎵 Started simultaneous playback of all tracks");
      } catch (error) {
        console.error("Failed to start playback:", error);
        Alert.alert("Playback Error", "Failed to start audio playback");
      }
    }
  };

  const renderTrackMixer = (item: TrackMixer) => (
    <View style={styles.trackMixerRow}>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={item.volume}
          onValueChange={(value) => handleVolumeChange(item.id, value)}
          minimumTrackTintColor="#4a90e2"
          maximumTrackTintColor="#333"
        />
      </View>
      <View style={styles.trackNameContainer}>
        <Text style={styles.trackName}>{item.name}</Text>
        <Text style={styles.volumeText}>{Math.round(item.volume * 100)}%</Text>
      </View>
      {item.duration > 0 && (
        <Text style={styles.durationText}>
          Duration: {item.duration.toFixed(2)}s
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading audio files...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Track Mixer Section */}
      <View style={styles.mixerSection}>
        <Text style={styles.sectionTitle}>Track Mixer</Text>
        {trackData.map((track) => (
          <View key={track.id}>{renderTrackMixer(track)}</View>
        ))}
      </View>

      {/* Shortest Duration Display */}
      {shortestDuration > 0 && (
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Shortest Duration:</Text>
          <Text style={styles.durationValue}>
            {shortestDuration.toFixed(2)}s
          </Text>
        </View>
      )}

      {/* Playback Controls Section */}
      <View style={styles.playbackSection}>
        <Text style={styles.sectionTitle}>Playback Controls</Text>
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.pauseButton]}
            onPress={handlePlayPause}
          >
            <Text style={styles.playButtonText}>{isPlaying ? "⏸️" : "▶️"}</Text>
          </TouchableOpacity>
          <Text style={styles.playbackStatus}>
            {isPlaying ? "Playing" : "Paused"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "500",
  },
  mixerSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  trackMixerRow: {
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sliderContainer: {
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#4a90e2",
    width: 20,
    height: 20,
  },
  trackNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  trackName: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  volumeText: {
    fontSize: 14,
    color: "#b0b0b0",
  },
  durationText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  durationSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2a2a3e",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
    marginRight: 10,
  },
  durationValue: {
    fontSize: 18,
    color: "#4a90e2",
    fontWeight: "bold",
  },
  playbackSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  pauseButton: {
    backgroundColor: "#e74c3c",
  },
  playButtonText: {
    fontSize: 24,
  },
  playbackStatus: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
});
