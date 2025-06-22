import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  
  const [loaded] = useFonts({
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGetStarted = () => {
    router.push('/welcome');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Filler Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('@/src/assets/images/temp-fox-logo.png')} 
            style={styles.fillerImage}
            resizeMode="contain"
          />
        </View>

        {/* App Title */}
        <Text style={styles.appTitle}>FiPet</Text>

        {/* Company Motto */}
        <View style={styles.mottoContainer}>
          <Text style={styles.mottoLine1}>Budget better. Think smarter.</Text>
          <Text style={styles.mottoLine2}>Raise your digital sidekick.</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    color: '#4A5568',
    fontFamily: 'SpaceMono',
  },
  imageContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  fillerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mottoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  mottoLine1: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  mottoLine2: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2D3748',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#FF6B35',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4C1D95',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#4C1D95',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  appTitle: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
  },
}); 