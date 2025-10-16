import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "./components/SplashScreen";
import TracksScreen from "./screens/TracksScreen";
import MixerScreen from "./screens/MixerScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SamplePadScreen from "./screens/SamplePadScreen";
// Import assets to ensure they're included in the bundle
import "./assets";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SamplePad" component={SamplePadScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  // Testing: Force specific screen via environment variable
  const TEST_SCREEN = process.env.EXPO_PUBLIC_TEST_SCREEN;

  // Override for testing specific screens
  if (TEST_SCREEN === "SamplePad") {
    return (
      <NavigationContainer>
        <SamplePadScreen />
      </NavigationContainer>
    );
  }

  if (TEST_SCREEN === "Mixer") {
    return <MixerScreen />;
  }

  if (TEST_SCREEN === "Tracks") {
    return <TracksScreen />;
  }

  if (TEST_SCREEN === "Settings") {
    return <SettingsScreen />;
  }

  // Splash screen disabled - go directly to main app
  // const [showSplash, setShowSplash] = useState(true);
  // const handleSplashFinish = () => {
  //   setShowSplash(false);
  // };
  // if (showSplash) {
  //   return <SplashScreen onFinish={handleSplashFinish} />;
  // }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#1a1a2e",
              borderTopColor: "#333",
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: "#4a90e2",
            tabBarInactiveTintColor: "#b0b0b0",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
        >
          <Tab.Screen
            name="Tracks"
            component={TracksScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🎵</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Mixer"
            component={MixerScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🎛️</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsStack}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>⚙️</Text>
              ),
            }}
          />
        </Tab.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
