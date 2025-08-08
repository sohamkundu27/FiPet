import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFunctions, httpsCallable } from '@firebase/functions';

export default function PasswordResetCodeScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

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

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    const isComplete = newCode.every(digit => digit !== '');
    setIsCodeValid(isComplete);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const functions = getFunctions();
      const verifyPasswordResetCode = httpsCallable(functions, 'verifyPasswordResetCode');
      
      await verifyPasswordResetCode({ email, code: verificationCode });
      setIsCodeVerified(true);
    } catch (error: any) {
      console.error('Code verification error:', error);
      Alert.alert('Verification Error', 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const functions = getFunctions();
      const sendPasswordResetCode = httpsCallable(functions, 'sendPasswordResetCode');
      
      await sendPasswordResetCode({ email });
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      console.error('Resend code error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const isPasswordValid = validatePassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const functions = getFunctions();
      const updatePasswordWithCode = httpsCallable(functions, 'updatePasswordWithCode');
      
      await updatePasswordWithCode({ 
        email, 
        code: code.join(''), 
        newPassword 
      });
      
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Password change error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Password Change Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
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
          onPress={handleBackToEmail}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={28} color="#4A5568" />
        </TouchableOpacity>
        <View style={{ height: 40 }} />
        
        <View style={styles.headerSection}>
          <Text style={styles.title}>We sent a reset code to your email</Text>
          <Text style={styles.subtitle}>Enter the code below to reset your password</Text>
          
          <TouchableOpacity
            style={styles.resendLink}
            onPress={handleResendCode}
            disabled={isLoading}
          >
            <Text style={styles.resendText}>
              Didn't receive a code? <Text style={styles.resendLinkText}>Send a new one</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerSection}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                editable={!isLoading && !isCodeVerified}
                placeholder=""
                placeholderTextColor="#FFA500"
              />
            ))}
          </View>

          {isCodeVerified && (
            <View style={styles.verifiedContainer}>
              <Text style={styles.verifiedText}>✓ Code verified</Text>
            </View>
          )}
          
          {!isCodeVerified && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.gradientButton, !isCodeValid && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={!isCodeValid || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isCodeValid ? ['#FF6B35', '#FFB74D'] : ['#D1D5DB', '#9CA3AF']}
                  style={styles.gradientButtonInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? '⏳ Verifying...' : 'Verify Code'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isCodeVerified && (
            <View style={styles.passwordSection}>
              <Text style={styles.sectionTitle}>New password</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.styledInput, passwordError ? styles.inputError : null]}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      validatePassword(text);
                    }}
                    placeholder="Enter a new password"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#FFA500"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#FFA500" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.styledInput, confirmPasswordError ? styles.inputError : null]}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      validateConfirmPassword(text);
                    }}
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#FFA500"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#FFA500" 
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.gradientButton, (!newPassword || !confirmPassword || passwordError || confirmPasswordError) && styles.buttonDisabled]}
                  onPress={handleUpdatePassword}
                  disabled={!newPassword || !confirmPassword || !!passwordError || !!confirmPasswordError || isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={(!newPassword || !confirmPassword || passwordError || confirmPasswordError) ? ['#D1D5DB', '#9CA3AF'] : ['#FF6B35', '#FFB74D']}
                    style={styles.gradientButtonInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? '⏳ Updating...' : 'Update Password'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  resendLink: {
    marginTop: 8,
  },
  resendText: {
    fontSize: 16,
    color: '#4A5568',
    fontFamily: 'Poppins',
  },
  resendLinkText: {
    color: '#8B5CF6',
    textDecorationLine: 'underline',
  },
  centerSection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: 12,
    fontSize: 28,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
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
  codeInputFilled: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF7ED',
  },
  verifiedContainer: {
    marginBottom: 32,
  },
  verifiedText: {
    fontSize: 18,
    color: '#10B981',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.6,
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
  passwordSection: {
    width: '100%',
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
  },
  styledInput: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingRight: 60,
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
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
}); 