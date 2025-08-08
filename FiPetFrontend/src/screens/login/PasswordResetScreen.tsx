import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFunctions, httpsCallable } from '@firebase/functions';
import { useAuth } from '@/src/hooks/useAuth';

export default function PasswordResetScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();
  const { auth } = useAuth();

  const [loaded] = useFonts({
    Poppins: require('@/src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('@/src/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('@/src/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View>
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

  const handlePasswordReset = async () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setIsLoading(true);
      try {
        const functions = getFunctions();
        const sendPasswordResetCode = httpsCallable(functions, 'sendPasswordResetCode');
        
        const result = await sendPasswordResetCode({ email });
        
        // Navigate to password reset code screen
        router.push({
          pathname: '/password-reset-code',
          params: { email }
        });
      } catch (error: any) {
        console.error('Password reset error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Password Reset Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    router.back();
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
          onPress={handleBackToLogin}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#4A5568" />
        </TouchableOpacity>
        <View style={{ height: 40 }} />
        <View style={styles.headerSection}>
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.subtitle}>Enter the email you created your account with and we'll send you a reset code</Text>
        </View>
        <View style={styles.centerSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.styledInput, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              placeholder="Enter you email address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#FFA500"
              editable={!isLoading}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.gradientButton}
              onPress={handlePasswordReset}
              disabled={!email || !!emailError || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B35', '#FFB74D']}
                style={styles.gradientButtonInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? '⏳ Sending...' : 'Send Code'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {isEmailSent && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                ✅ Password reset email sent successfully!
              </Text>
              <Text style={styles.successSubtext}>
                Please check your email and follow the instructions to reset your password.
              </Text>
            </View>
          )}
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
  headerSection: {
    marginTop: 100,
    marginLeft: 24,
    marginBottom: 32,
    alignItems: 'flex-start',
    maxWidth: 400,
    width: '90%',
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 8,
    color: '#4A5568',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'left',
    marginBottom: 0,
    fontFamily: 'Poppins',
  },
  centerSection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 0,
    width: '100%',
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
    marginTop: 32,
  },
  gradientButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
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
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
  },
  successContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F0FFF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9AE6B4',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22543D',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#38A169',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 
