import AsyncStorage from "@react-native-async-storage/async-storage";

const SAMPLES_KEY = "user_samples";

export interface StoredSample {
  id: string;
  name: string;
  fileName: string;
  isDefault: boolean;
}

export const saveSamples = async (samples: StoredSample[]): Promise<void> => {
  try {
    const jsonSamples = JSON.stringify(samples);
    await AsyncStorage.setItem(SAMPLES_KEY, jsonSamples);
  } catch (error) {
    console.error("Failed to save samples:", error);
  }
};

export const loadSamples = async (): Promise<StoredSample[]> => {
  try {
    const jsonSamples = await AsyncStorage.getItem(SAMPLES_KEY);
    if (jsonSamples) {
      return JSON.parse(jsonSamples);
    }
    return [];
  } catch (error) {
    console.error("Failed to load samples:", error);
    return [];
  }
};

export const clearSamples = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAMPLES_KEY);
  } catch (error) {
    console.error("Failed to clear samples:", error);
  }
};
