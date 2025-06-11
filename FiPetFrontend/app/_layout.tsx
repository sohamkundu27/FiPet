import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useNativeColorScheme();

  return (
    <>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="home" options={{ headerShown: false }} />}
         */}
         <Stack.Screen name="quests/[questID]" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
