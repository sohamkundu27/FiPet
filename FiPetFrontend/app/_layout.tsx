import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/components/AuthProvider';
import { Colors } from '@/src/constants/Colors';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { UserProgressProvider } from '@/src/context/UserProgressContext';

export default function RootLayout() {
  const colorScheme = useNativeColorScheme();
  const headerBG = useThemeColor({light: Colors.primary.default, dark: Colors.primary.darker}, 'background')
  const headerText = useThemeColor({light: "#000", dark: "#FFF"}, 'background')

  const settingsOptions = {
      headerStyle: {
        backgroundColor: headerBG,
      },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerTintColor: headerText,
  }

  return (
    <>
      <UserProgressProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="password-reset" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings/index" options={{
              title: "Settings",
              ...settingsOptions
            }} />
            <Stack.Screen name="quests/[questID]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </UserProgressProvider>
    </>
  );
}
