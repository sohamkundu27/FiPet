import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Text, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { useAuth } from '@/src/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const _auth = useAuth();
  const auth = _auth.authState;

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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/landing')}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#4A5568" />
        </TouchableOpacity>
        <View style={{ height: 120 }} />
        <View style={styles.topSectionAbsolute}>
          <View style={styles.topSection}>
            <View style={{ position: 'relative', width: 160, height: 160 }}>
              <Image
                source={require('@/src/assets/images/fox.png')}
                style={styles.foxImage}
                resizeMode="contain"
              />
              <View style={styles.speechBubbleContainer}>
                <View style={styles.speechBubble}>
                  <Text style={styles.speechText}>It's good to see you again!</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.separator} />
        </View>
        <View style={styles.flexGrowContainer}>
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.styledInput, emailError ? styles.inputError : null]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#FFA500"
                editable={!isLoading}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>
            <View style={{ height: 16 }} />
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.styledInput, passwordError ? styles.inputError : null]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text);
                }}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#FFA500"
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
                style={styles.gradientButton}
                onPress={handleLogin}
                disabled={!email || !password || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B35', '#FFB74D']}
                  style={styles.gradientButtonInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? '⏳ Loading...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text style={styles.signUpLink} onPress={() => router.push('/welcome')}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  foxImage: {
    position: 'absolute',
    width: 200,
    height: 200,
    bottom: 10,
  },
  speechBubbleContainer: {
    position: 'absolute',
    bottom: 220,
    left: 70,
    zIndex: 2,
    width: '100%',
    alignItems: 'flex-end',
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'flex-end',
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  separator: {
    width: '80%',
    height: 1,
    backgroundColor: '#E9ECEF',
    alignSelf: 'center',
    marginVertical: 18,
  },
  content: {
    padding: 20,
    flex: 1,
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    borderRadius: 20,
    shadowColor: 'transparent',
    justifyContent: 'center',
    marginTop: 270,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 5,
    fontFamily: 'Poppins',
  },
  styledInput: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 0,
  },
  gradientButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    marginTop: 50,
    marginBottom: 0,
    overflow: 'hidden',
    backgroundColor: '#FF6B35',
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
  gradientButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#4C1D95',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  forgotPasswordTextDisabled: {
    opacity: 0.5,
  },
  signUpContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10
  },
  signUpText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  signUpLink: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
  },
  flexGrowContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topSectionAbsolute: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
  },
}); 
