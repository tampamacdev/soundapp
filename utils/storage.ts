import AsyncStorage from "@react-native-async-storage/async-storage";

const SAMPLES_KEY = "user_samples";

export interface StoredSample {
  id: string;
  name: string;
  fileName: string;
  isDefault: boolean;
  fileData?: string; // Base64 encoded file data for persistence
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

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // Remove data:audio/...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convert base64 back to ArrayBuffer for Web Audio
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
