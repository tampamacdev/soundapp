import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { saveSamples, loadSamples, StoredSample } from "../utils/storage";

interface SamplePad {
  id: string;
  name: string;
  fileName: string;
  isDefault: boolean;
}

const defaultSamples: SamplePad[] = [
  { id: "1", name: "Snare", fileName: "assets/snare.mp3", isDefault: true },
  { id: "2", name: "Kick", fileName: "assets/kick.mp3", isDefault: true },
  { id: "3", name: "Hi-Hat", fileName: "assets/hi-hat.mp3", isDefault: true },
];

export default function SamplePadScreen() {
  const navigation = useNavigation();
  const [samples, setSamples] = useState<SamplePad[]>(defaultSamples);
  const [isEditing, setIsEditing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioBuffers = useRef<Map<string, AudioBuffer>>(new Map());

  // Load samples from storage and initialize audio
  useEffect(() => {
    const loadUserSamples = async () => {
      try {
        const userSamples = await loadSamples();
        if (userSamples.length > 0) {
          setSamples([...defaultSamples, ...userSamples]);
        }
      } catch (error) {
        console.error("Failed to load user samples:", error);
      }
    };

    loadUserSamples();

    if (Platform.OS === "web") {
      const initAudio = async () => {
        try {
          const context = new AudioContext();
          setAudioContext(context);
          await loadDefaultSamples(context);
        } catch (error) {
          console.error("Failed to initialize audio:", error);
        }
      };
      initAudio();
    }
  }, []);

  // Load default samples

  const loadDefaultSamples = async (context: AudioContext) => {
    for (const sample of defaultSamples) {
      try {
        // Use the correct path for Expo web assets
        const response = await fetch(`./assets/${sample.fileName}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        audioBuffers.current.set(sample.id, buffer);

        console.log(`✅ Loaded ${sample.name}: ${buffer.duration.toFixed(2)}s`);
      } catch (error) {
        console.error(`❌ Failed to load sample ${sample.name}:`, error);
      }
    }
  };

  // Play sample
  const playSample = async (sampleId: string) => {
    if (Platform.OS !== "web" || !audioContext) {
      Alert.alert(
        "Audio not available",
        "Web Audio API is only available in web version"
      );
      return;
    }

    try {
      const buffer = audioBuffers.current.get(sampleId);
      if (!buffer) {
        console.error("Sample buffer not found:", sampleId);
        return;
      }

      // Log detailed buffer information
      console.log(
        `🎵 Sample ${sampleId}: ${buffer.duration.toFixed(2)}s, ${
          buffer.sampleRate
        }Hz, ${buffer.numberOfChannels}ch, ${buffer.length} samples`
      );

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error("Failed to play sample:", error);
    }
  };

  // Add new sample
  const addSample = async () => {
    const newSample: SamplePad = {
      id: Date.now().toString(),
      name: `Sample ${samples.length + 1}`,
      fileName: "",
      isDefault: false,
    };
    const updatedSamples = [...samples, newSample];
    setSamples(updatedSamples);

    // Save to storage
    const userSamples = updatedSamples.filter((s) => !s.isDefault);
    await saveSamples(userSamples);
  };

  // Delete sample
  const deleteSample = async (sampleId: string) => {
    const sample = samples.find((s) => s.id === sampleId);
    if (sample?.isDefault) {
      Alert.alert("Cannot delete", "Default samples cannot be deleted");
      return;
    }

    Alert.alert(
      "Delete Sample",
      "Are you sure you want to delete this sample?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedSamples = samples.filter((s) => s.id !== sampleId);
            setSamples(updatedSamples);
            audioBuffers.current.delete(sampleId);

            // Save to storage
            const userSamples = updatedSamples.filter((s) => !s.isDefault);
            await saveSamples(userSamples);
          },
        },
      ]
    );
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Render sample pad
  const renderSamplePad = (sample: SamplePad, index: number) => {
    const isAddButton = sample.id === "add";

    return (
      <TouchableOpacity
        key={sample.id}
        style={[styles.samplePad, isAddButton && styles.addButton]}
        onPress={() => {
          if (isAddButton) {
            addSample();
          } else {
            playSample(sample.id);
          }
        }}
      >
        {isEditing && !isAddButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSample(sample.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}

        <Text
          style={[styles.samplePadText, isAddButton && styles.addButtonText]}
        >
          {isAddButton ? "+" : sample.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Create grid layout (Z-pattern)
  const createGrid = () => {
    const items = [...samples];
    if (isEditing) {
      items.push({ id: "add", name: "+", fileName: "", isDefault: false });
    }

    const grid = [];
    const itemsPerRow = 3;

    for (let i = 0; i < items.length; i += itemsPerRow) {
      const row = items.slice(i, i + itemsPerRow);
      const isEvenRow = Math.floor(i / itemsPerRow) % 2 === 0;

      // Reverse order for even rows (Z-pattern)
      const orderedRow = isEvenRow ? row : [...row].reverse();

      grid.push(
        <View key={i} style={styles.sampleRow}>
          {orderedRow.map((item, index) => renderSamplePad(item, i + index))}
        </View>
      );
    }

    return grid;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sample Pad</Text>
        <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
          <Text style={styles.editButtonText}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sample Grid */}
      <View style={styles.sampleGrid}>{createGrid()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#4a90e2",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  sampleGrid: {
    flex: 1,
    padding: 20,
  },
  sampleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  samplePad: {
    width: 80,
    height: 80,
    backgroundColor: "#333",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    position: "relative",
  },
  addButton: {
    backgroundColor: "#4a90e2",
    borderWidth: 2,
    borderColor: "#4a90e2",
    borderStyle: "dashed",
  },
  samplePadText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
