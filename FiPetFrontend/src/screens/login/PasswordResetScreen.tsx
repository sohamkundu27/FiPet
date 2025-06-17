import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Dimensions, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { auth } from '@/src/config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function PasswordResetScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
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

  const handlePasswordReset = async () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setIsEmailSent(true);
        Alert.alert(
          'Password Reset Email Sent',
          'Check your email for a link to reset your password. If you don\'t see it, check your spam folder.',
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        console.error('Password reset error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
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
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Ionicons name="arrow-back" size={24} color="#4A5568" />
          </TouchableOpacity>

          <Text style={styles.title}>🔐 Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
          
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                ((!email || !!emailError) || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handlePasswordReset}
              disabled={!email || !!emailError || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleBackToLogin}
            disabled={isLoading}
          >
            <Text style={[
              styles.backToLoginText,
              isLoading && styles.backToLoginTextDisabled
            ]}>
              ← Back to Login
            </Text>
          </TouchableOpacity>

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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4A5568',
    marginTop: 60,
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
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#718096',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
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
  backToLoginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#4C1D95',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  backToLoginTextDisabled: {
    opacity: 0.5,
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