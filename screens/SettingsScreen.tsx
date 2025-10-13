import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const handleSettingPress = (setting: string) => {
    if (setting === "Sample Pad") {
      navigation.navigate("SamplePad" as never);
    } else {
      console.log("Setting pressed:", setting);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>⚙️</Text>
          <Text style={styles.placeholderTitle}>Settings</Text>
          <Text style={styles.placeholderSubtitle}>Work in Progress</Text>
          <Text style={styles.placeholderDescription}>
            This section will contain app settings, preferences, and
            configuration options.
          </Text>
        </View>

        {/* Placeholder settings items */}
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("Sample Pad")}
          >
            <Text style={styles.settingIcon}>🥁</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sample Pad</Text>
              <Text style={styles.settingSubtitle}>
                Test sample playback and manage samples
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("Audio Settings")}
          >
            <Text style={styles.settingIcon}>🎵</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Audio Settings</Text>
              <Text style={styles.settingSubtitle}>
                Configure audio preferences
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("Appearance")}
          >
            <Text style={styles.settingIcon}>🎨</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Appearance</Text>
              <Text style={styles.settingSubtitle}>
                Customize the look and feel
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("About")}
          >
            <Text style={styles.settingIcon}>ℹ️</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingSubtitle}>
                App version and information
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
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
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 30,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: "#4a90e2",
    marginBottom: 15,
  },
  placeholderDescription: {
    fontSize: 14,
    color: "#b0b0b0",
    textAlign: "center",
    lineHeight: 20,
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#b0b0b0",
  },
  settingArrow: {
    fontSize: 20,
    color: "#b0b0b0",
  },
});
