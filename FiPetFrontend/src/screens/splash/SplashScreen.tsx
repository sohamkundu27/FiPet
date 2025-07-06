import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { Href, useRouter } from 'expo-router';

export default function SplashScreen({
  redirect,
  ready
}: {
  redirect: Href
  ready: boolean
}) {
  const router = useRouter();
  const [timerDone, setTimerDone] = useState<boolean>(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if ( ready && !timerDone ) {
      router.prefetch(redirect);
    }
    if ( ready && timerDone ) {
      router.navigate(redirect);
    }
  }, [ready, timerDone, redirect, router]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate to landing after 2.5 seconds
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/src/assets/images/foxHead.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Image
            source={require('@/src/assets/images/FiPetWhite.png')}
            style={styles.appNameImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F97216', // Orange background
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
  logoImage: {
    width: 250,
    height: 250,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appNameImage: {
    width: 220,
    height: 70,
    marginBottom: 0,
    alignSelf: 'center',
  },
}); 
