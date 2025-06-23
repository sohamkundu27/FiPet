import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  let {page} = useLocalSearchParams<{page: string}>();
  let _page: Href = "/";
  switch (page) {
    case "landing":
      _page = "/landing";
      break;
    case "home":
      _page = "/home";
      break;
    default:
      console.error(`Cannot navigate to ${page}`);
    break;
  }

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate to landing after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace(_page);
    }, 2500);

    return () => clearTimeout(timer);
  }, [_page, fadeAnim, router]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          {/* You can add a logo here if needed */}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.appName}>FiPet</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35', // Orange background
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 
