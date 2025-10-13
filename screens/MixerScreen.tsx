import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";

interface TrackMixer {
  id: string;
  name: string;
  volume: number;
}

const mockTracks: TrackMixer[] = [
  { id: "1", name: "Track 1", volume: 0.8 },
  { id: "2", name: "Track 2", volume: 0.6 },
  { id: "3", name: "Track 3", volume: 0.9 },
  { id: "4", name: "Track 4", volume: 0.7 },
  { id: "5", name: "Track 5", volume: 0.5 },
];

export default function MixerScreen() {
  const [tracks, setTracks] = useState<TrackMixer[]>(mockTracks);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVolumeChange = (trackId: string, volume: number) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      )
    );
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderTrackMixer = ({ item }: { item: TrackMixer }) => (
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
          thumbStyle={styles.sliderThumb}
        />
      </View>
      <View style={styles.trackNameContainer}>
        <Text style={styles.trackName}>{item.name}</Text>
        <Text style={styles.volumeText}>{Math.round(item.volume * 100)}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Track Mixer Section */}
      <View style={styles.mixerSection}>
        <Text style={styles.sectionTitle}>Track Mixer</Text>
        <FlatList
          data={tracks}
          renderItem={renderTrackMixer}
          keyExtractor={(item) => item.id}
          style={styles.trackList}
          showsVerticalScrollIndicator={false}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
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
  trackList: {
    flex: 1,
  },
  trackMixerRow: {
    marginBottom: 20,
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
  },
  trackName: {
    fontSize: 16,
    color: "#ffffff",
  },
  volumeText: {
    fontSize: 14,
    color: "#b0b0b0",
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
