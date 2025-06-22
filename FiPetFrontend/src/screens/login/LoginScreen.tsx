import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Dimensions, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/src/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLoginError = (error: any) => {
    let errorMessage = 'An error occurred. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      default:
        break;
    }
    Alert.alert('Login Error', errorMessage);
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/(tabs)/home');
      } catch (error: any) {
        handleLoginError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/landing')}
        disabled={isLoading}
      >
        <Ionicons name="arrow-back" size={24} color="#4A5568" />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>✨ Welcome Back! ✨</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
              editable={!isLoading}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              placeholder="Enter your password"
              secureTextEntry
              placeholderTextColor="#A0AEC0"
              editable={!isLoading}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.navigate('/password-reset')}
              disabled={isLoading}
            >
              <Text style={[
                styles.forgotPasswordText,
                isLoading && styles.forgotPasswordTextDisabled
              ]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                ((!email || !password) || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '⏳ Loading...' : '🎮 Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    flex: 1,
    minHeight: '100%',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#4A5568',
    marginTop: 20,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A5568',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#4C1D95',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  submitButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#4C1D95',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  switchButtonTextDisabled: {
    opacity: 0.5,
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#4C1D95',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPasswordTextDisabled: {
    opacity: 0.5,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
}); 
