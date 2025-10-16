import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Track {
  id: string;
  name: string;
  duration: string;
}

const mockTracks: Track[] = [
  { id: "1", name: "Track 1", duration: "3:45" },
  { id: "2", name: "Track 2", duration: "4:12" },
  { id: "3", name: "Track 3", duration: "2:58" },
  { id: "4", name: "Track 4", duration: "5:23" },
  { id: "5", name: "Track 5", duration: "3:31" },
];

export default function TracksScreen() {
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditTrack = (track: Track) => {
    Alert.alert("Edit Track", `Edit "${track.name}"`, [
      { text: "Cancel", style: "cancel" },
      { text: "Save", onPress: () => console.log("Save track:", track) },
    ]);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <View style={styles.trackRow}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName}>{item.name}</Text>
        <Text style={styles.trackDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditTrack(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tracks</Text>
        <TouchableOpacity
          style={styles.editHeaderButton}
          onPress={handleEditToggle}
        >
          <Text style={styles.editHeaderButtonText}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Track List */}
      <FlatList
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        style={styles.trackList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editHeaderButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
  },
  editHeaderButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  trackList: {
    flex: 1,
  },
  trackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 4,
  },
  trackDuration: {
    fontSize: 14,
    color: "#b0b0b0",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
  },
});
