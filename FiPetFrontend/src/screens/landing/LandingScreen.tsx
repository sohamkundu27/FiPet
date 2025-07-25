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
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  
  const [loaded] = useFonts({
    Poppins: require('@/src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('@/src/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('@/src/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
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
            source={require('@/src/assets/images/fox.png')} 
            style={styles.fillerImage}
            resizeMode="contain"
          />
        </View>

        {/* App Title */}
        <Image
          source={require('@/src/assets/images/FiPetOrange.png')}
          style={styles.appTitleImage}
          resizeMode="contain"
        />

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
            <LinearGradient
              colors={['#FF6B35', '#FFB74D']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 18,
    color: '#4A5568',
    fontFamily: 'Poppins',
  },
  imageContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 30,
  },
  fillerImage: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
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
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  secondaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4C1D95',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#4C1D95',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  appTitleImage: {
    width: 220,
    height: 70,
    marginBottom: 20,
    alignSelf: 'center',
  },
}); 