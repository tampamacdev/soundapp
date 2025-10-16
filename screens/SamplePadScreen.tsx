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
import { SafeAreaView } from "react-native-safe-area-context";
import {
  saveSamples,
  loadSamples,
  StoredSample,
  fileToBase64,
  base64ToArrayBuffer,
} from "../utils/storage";
import { audioAssets } from "../assets";
import { audioFiles } from "../assets/audio";
import { AudioEngine } from "../types/AudioEngine";
import { AudioEngineFactory } from "../audio/AudioEngineFactory";
import { Asset } from "expo-asset";

interface SamplePad {
  id: string;
  name: string;
  fileName: string;
  isDefault: boolean;
  fileData?: string; // Base64 encoded file data for persistence
}

const defaultSamples: SamplePad[] = [
  { id: "1", name: "Snare", fileName: "snare.mp3", isDefault: true },
  { id: "2", name: "Kick", fileName: "kick.mp3", isDefault: true },
  { id: "3", name: "Hi-Hat", fileName: "hi-hat.mp3", isDefault: true },
];

export default function SamplePadScreen() {
  const navigation = useNavigation();
  const [samples, setSamples] = useState<SamplePad[]>(defaultSamples);
  const [isEditing, setIsEditing] = useState(false);
  const [audioEngine] = useState<AudioEngine>(() =>
    AudioEngineFactory.create()
  );
  const audioBuffers = useRef<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

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

    const initializeAudio = async () => {
      try {
        // Initialize audio engine
        await audioEngine.initialize();

        // Load user samples
        const userSamples = await loadSamples();
        if (userSamples.length > 0) {
          setSamples([...defaultSamples, ...userSamples]);
        }

        // Load default samples
        await loadDefaultSamples();
        await loadUserSamplesFromStorage();

        setIsLoading(false);
        console.log("✅ Audio system initialized successfully");
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        Alert.alert("Audio Error", "Failed to initialize audio system");
        setIsLoading(false);
      }
    };

    initializeAudio();
  }, []);

  // Load user samples from persistent storage
  const loadUserSamplesFromStorage = async () => {
    try {
      const userSamples = await loadSamples();
      for (const sample of userSamples) {
        if (sample.fileData) {
          try {
            // Convert base64 back to ArrayBuffer
            const arrayBuffer = base64ToArrayBuffer(sample.fileData);
            // Create a blob URL for the audio engine
            const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);
            const buffer = await audioEngine.loadAudioFile(url);
            audioBuffers.current.set(sample.id, buffer);
            console.log(`✅ Loaded persisted sample: ${sample.name}`);
          } catch (error) {
            console.error(
              `Failed to load persisted sample ${sample.name}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to load persisted samples:", error);
    }
  };

  // Load default samples

  const loadDefaultSamples = async () => {
    for (const sample of defaultSamples) {
      try {
        let assetUrl: string;

        if (Platform.OS === "web") {
          // Use web URLs for web platform
          assetUrl =
            audioFiles[sample.fileName] || `./assets/${sample.fileName}`;
        } else {
          // Use Expo Asset API for mobile platforms
          const asset = Asset.fromModule(audioFiles[sample.fileName]);
          await asset.downloadAsync();
          assetUrl = asset.uri;
        }

        console.log(`Loading ${sample.name} from:`, assetUrl);
        const buffer = await audioEngine.loadAudioFile(assetUrl);
        audioBuffers.current.set(sample.id, buffer);

        console.log(`✅ Loaded ${sample.name}: ${buffer.duration.toFixed(2)}s`);
      } catch (error) {
        console.error(`❌ Failed to load sample ${sample.name}:`, error);
      }
    }
  };

  // Play sample
  const playSample = async (sampleId: string) => {
    console.log("🎵 Play sample called for:", sampleId);
    console.log("🎵 Audio engine initialized:", audioEngine.isInitialized());

    if (!audioEngine.isInitialized()) {
      Alert.alert("Audio not available", "Audio engine not initialized");
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
        }Hz, ${buffer.channels}ch`
      );

      console.log("🎵 Calling audioEngine.playSample...");
      await audioEngine.playSample(buffer);
      console.log("🎵 playSample completed");
    } catch (error) {
      console.error("Failed to play sample:", error);
      Alert.alert("Playback Error", "Failed to play audio sample");
    }
  };

  // Add new sample via file browser
  const addSample = async () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "File browser",
        "File browser is only available in web version"
      );
      return;
    }

    try {
      // Create file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.multiple = false;

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("audio/")) {
          Alert.alert("Invalid file", "Please select an audio file");
          return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File too large",
            "Please select a file smaller than 10MB"
          );
          return;
        }

        try {
          // Convert file to base64 for persistent storage
          const fileData = await fileToBase64(file);

          // Create new sample
          const newSample: SamplePad = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            fileName: file.name,
            isDefault: false,
            fileData: fileData, // Store file data for persistence
          };

          // Load audio file
          const arrayBuffer = await file.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          const buffer = await audioEngine.loadAudioFile(url);
          audioBuffers.current.set(newSample.id, buffer);

          // Add to samples
          const updatedSamples = [...samples, newSample];
          setSamples(updatedSamples);

          // Save to storage (including file data)
          const userSamples = updatedSamples.filter((s) => !s.isDefault);
          await saveSamples(userSamples);

          console.log(
            `✅ Added new sample: ${newSample.name} (${buffer.duration.toFixed(
              2
            )}s)`
          );
        } catch (error) {
          console.error("Failed to load audio file:", error);
          Alert.alert(
            "Error",
            "Failed to load audio file. Please try a different file."
          );
        }
      };

      // Trigger file browser
      input.click();
    } catch (error) {
      console.error("File browser error:", error);
      Alert.alert("Error", "Failed to open file browser");
    }
  };

  // Delete sample
  const deleteSample = async (sampleId: string) => {
    console.log("Delete sample called with ID:", sampleId);
    const sample = samples.find((s) => s.id === sampleId);
    console.log("Found sample:", sample);

    if (sample?.isDefault) {
      Alert.alert("Cannot delete", "Default samples cannot be deleted");
      return;
    }

    // Use browser confirm for web, Alert.alert for mobile
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this sample?"
      );
      if (confirmed) {
        console.log("Deleting sample:", sampleId);
        console.log(
          "Audio engine state before deletion:",
          audioEngine.isInitialized()
        );

        const updatedSamples = samples.filter((s) => s.id !== sampleId);
        setSamples(updatedSamples);
        audioBuffers.current.delete(sampleId);

        // Save to storage
        const userSamples = updatedSamples.filter((s) => !s.isDefault);
        await saveSamples(userSamples);

        console.log(
          "Audio engine state after deletion:",
          audioEngine.isInitialized()
        );
        console.log("Sample deleted successfully");
      }
    } else {
      Alert.alert(
        "Delete Sample",
        "Are you sure you want to delete this sample?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              console.log("Deleting sample:", sampleId);
              const updatedSamples = samples.filter((s) => s.id !== sampleId);
              setSamples(updatedSamples);
              audioBuffers.current.delete(sampleId);

              // Save to storage
              const userSamples = updatedSamples.filter((s) => !s.isDefault);
              await saveSamples(userSamples);
              console.log("Sample deleted successfully");
            },
          },
        ]
      );
    }
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
        {isEditing && !isAddButton && !sample.isDefault && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              deleteSample(sample.id);
            }}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}

        <Text
          style={[styles.samplePadText, isAddButton && styles.addButtonText]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {isAddButton ? "+" : sample.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Create grid layout (Z-pattern)
  const createGrid = () => {
    const items = [...samples];

    // Debug logging
    console.log(
      "Creating grid with samples:",
      samples.length,
      "items:",
      items.length
    );

    // Add the "+" button at the end of all samples when editing
    if (isEditing) {
      items.push({ id: "add", name: "+", fileName: "", isDefault: false });
      console.log("Added + button, total items:", items.length);
      console.log(
        "Items in order:",
        items.map((item) => item.name)
      );
    }

    const grid = [];
    const itemsPerRow = 3;

    for (let i = 0; i < items.length; i += itemsPerRow) {
      const row = items.slice(i, i + itemsPerRow);
      const rowIndex = Math.floor(i / itemsPerRow);

      // Z-pattern: each row goes left to right, but rows snake down
      // Row 0: left to right, Row 1: left to right, Row 2: left to right, etc.
      const orderedRow = row; // Always left to right

      console.log(
        `Row ${rowIndex}:`,
        orderedRow.map((item) => item.name)
      );

      grid.push(
        <View key={i} style={styles.sampleRow}>
          {orderedRow.map((item, index) => renderSamplePad(item, i + index))}
        </View>
      );
    }

    return grid;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading audio system...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
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
