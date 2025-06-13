import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import type { NativeStackNavigationOptions } from '../../node_modules/@react-navigation/native-stack/src/types';

export default function SettingsLayout() {

  let screenOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: "#ffe9ab",
    },
    headerShadowVisible: false,
    headerTitleAlign: "center",
    headerTintColor: "#000",
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{headerTitle: "Settings"}}/>
      <Stack.Screen name="profile" options={{headerTitle: "Settings (Profile)"}}/>
    </Stack>
  );
}
