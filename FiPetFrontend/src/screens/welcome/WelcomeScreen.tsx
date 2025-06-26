import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert, Keyboard, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { validateUsername } from '@/src/functions/validation';
import { db } from '../../config/firebase';
import { doc, setDoc } from '@firebase/firestore';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { useAuth } from '@/src/hooks/useAuth';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

interface Goal {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface HelpOption {
  value: string;
  label: string;
}

interface ReferralSource {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}


const goals: Goal[] = [
  { 
    id: '0',
    label: 'Save for something big (phone, PS5, concert)',
    icon: 'gift-outline'
  },
  { 
    id: '1',
    label: 'Get smarter with money decisions',
    icon: 'bulb-outline'
  },
  { 
    id: '2',
    label: 'Learn how to budget and plan ahead',
    icon: 'calendar-outline'
  },
  { 
    id: '3',
    label: 'Start investing or growing my money',
    icon: 'trending-up-outline'
  },
  { 
    id: '4',
    label: 'Stop overspending on small things',
    icon: 'stop-circle-outline'
  },
];

const helpOptions: HelpOption[] = [
  { value: '0', label: 'Give me challenges and games' },
  { value: '1', label: 'Celebrate when I make smart choices' },
  { value: '2', label: 'Explain things when i get them wrong' },
  { value: '3', label: 'Make it feel like a game, not school' },
  { value: '4', label: 'Give me feedback and reminders' },
];

// Add referral source options
const referralSources: ReferralSource[] = [
  { id: '0', label: 'TikTok', icon: 'logo-tiktok' },
  { id: '1', label: 'Instagram/Facebook', icon: 'logo-instagram' },
  { id: '2', label: 'Friends/Family', icon: 'people-outline' },
  { id: '3', label: 'Google Search', icon: 'search-outline' },
  { id: '4', label: 'App Store', icon: 'phone-portrait-outline' },
  { id: '5', label: 'YouTube', icon: 'logo-youtube' },
  { id: '6', label: 'LinkedIn', icon: 'logo-linkedin' },
  { id: '7', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

// Progress bar component
const ProgressBar = ({ progress, onBack }: { progress: number; onBack: () => void }) => (
  <View style={styles.progressBarWrapper}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color="#666" />
    </TouchableOpacity>
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  </View>
);

// LoadingScreen component outside of main component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.foxSpeechContainer}>
      <View style={styles.speechBubbleFox}>
        <Text style={styles.speechTextFox}>Setting up your financial journey...</Text>
      </View>
    </View>
    <View style={styles.foxImageContainer}>
      <Image
        source={require('../../assets/images/welcomeFox.png')}
        style={styles.foxImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  const [petName, setPetName] = useState('');
  const [petNameError, setPetNameError] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<string[]>([]);
  const [selectedReferralSource, setSelectedReferralSource] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {auth} = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSteps = 9;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
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
      setPasswordError('');
      return false;
    }
    if (password.length < 12) {
      setPasswordError('Password must be at least 12 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateAge = (age: string) => {
    const ageNum = parseInt(age);
    if (!age) {
      setAgeError('');
      return false;
    }
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setAgeError('Please enter a valid age (13-120)');
      return false;
    }
    setAgeError('');
    return true;
  };

  const handleSignUpError = (error: any) => {
    let errorMessage = 'An error occurred. Please try again.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Please login instead.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      default:
        break;
    }
    Alert.alert('Sign Up Error', errorMessage);
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    let userValidation = validateUsername(text);
    if (text.length > 0 && userValidation) {
      setUsernameError(userValidation);
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    validateConfirmPassword(text);
  };

  const handleAgeChange = (text: string) => {
    setAge(text);
    validateAge(text);
  };

  const handlePetNameChange = (text: string) => {
    setPetName(text);
    if (!text.trim()) {
      setPetNameError('Pet name is required');
    } else {
      setPetNameError('');
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to home or next screen after onboarding
      router.replace('/home');
    }
  };

  const handleFinish = async () => {
    if (petName.trim() && selectedGoals.length > 0 && selectedHelp.length > 0) {
      
      // Validate account creation fields
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

      if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !termsAccepted) {
        return;
      }

      setIsLoading(true);

      try {
        // Create account first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Account created successfully:', userCredential.user.uid);

        const userData = {
          age: parseInt(age),
          current_level: 1,
          current_xp: 0,
          username: username.trim(),
          pet_name: petName.trim(),
          heard_about_fipet: selectedReferralSource.map(source => Number(source)),
          financial_goals: selectedGoals.map(goal => Number(goal)),
          pet_help_method: Number(selectedHelp),
          current_coins: 0,
          pet_mood: 10
        };

        console.log('Saving data to Firestore:', userData);

        // Save user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        console.log('User data saved successfully to Firestore');
        
        router.replace('/(tabs)/home');
      } catch (error: any) {
        setIsLoading(false);
        if (error.code && error.code.startsWith('auth/')) {
          handleSignUpError(error);
        } else {
          console.error('Error saving user data:', error);
          Alert.alert('Error', 'Failed to save user data. Please try again.');
        }
      }
    } else {
      console.log('Validation failed:', {
        hasPetName: !!petName.trim(),
        hasGoals: selectedGoals.length > 0,
        hasHelp: selectedHelp.length > 0
      });
    }
  };

  const renderStep = () => {
    const renderContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <View style={[styles.contentContainer, styles.welcomeContent]}>
              <TouchableOpacity style={styles.backButtonTop} onPress={() => router.push('/landing')}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeTitle}>Welcome</Text>
                <Text style={styles.welcomeSubtitle}>We're happy you're here</Text>
                <Text style={styles.welcomeText}>
                  Our users love us because we{'\n'}
                  make learning finance easy,{'\n'}
                  fun and intuitive!
                </Text>
              </View>
              <View style={styles.trophySection}>
                <View style={styles.trophyRow}>
                  <Image 
                    source={require('@/src/assets/images/trophy.png')} 
                    style={styles.trophyIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.trophyText}>Level up your finance{'\n'}knowledge</Text>
                </View>
              </View>
              <View style={styles.questSection}>
                <View style={styles.questRow}>
                  <Image 
                    source={require('@/src/assets/images/quest-selected.png')} 
                    style={styles.questIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.questText}>Complete quests to earn XP{'\n'}and test your knowledge</Text>
                </View>
              </View>
              <View style={styles.bagSection}>
                <View style={styles.bagRow}>
                  <Image 
                    source={require('@/src/assets/images/bag.png')} 
                    style={styles.bagIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.bagText}>Purchase items from the{'\n'}shop to upgrade your pet{'\n'}and boost your XP</Text>
                </View>
              </View>
              <View style={styles.coinSection}>
                <View style={styles.coinRow}>
                  <Image 
                    source={require('@/src/assets/images/coin.png')} 
                    style={styles.coinIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.coinText}>Earn VC to spend at{'\n'}the store</Text>
                </View>
              </View>
            </View>
          );
        case 1:
          return (
            <View style={[styles.contentContainer, styles.welcomeContent]}>
              <TouchableOpacity style={styles.backButtonTop} onPress={() => setCurrentStep(0)}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.speechBubbleContainerStep1}>
                <View style={styles.speechBubble}>
                  <Text style={styles.speechText}>Just a few quick questions</Text>
                </View>
              </View>
              <View style={styles.foxImageContainerStep1}>
                <Image 
                  source={require('@/src/assets/images/welcomeFox.png')} 
                  style={styles.fillerImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          );
        case 2:
          return (
            <View style={styles.scrollableContentContainer}>
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sectionContainer}>
                  {referralSources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.referralOption,
                        selectedReferralSource.includes(source.id) && styles.selectedReferralOption
                      ]}
                      onPress={() => {
                        if (selectedReferralSource.includes(source.id)) {
                          setSelectedReferralSource(selectedReferralSource.filter(id => id !== source.id));
                        } else if (selectedReferralSource.length < 4) {
                          setSelectedReferralSource([...selectedReferralSource, source.id]);
                        }
                      }}
                    >
                      <View style={styles.goalContent}>
                        <Ionicons name={source.icon} size={20} color="#333" style={styles.goalIcon} />
                        <Text style={styles.goalText}>{source.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        case 3:
          return (
            <View style={styles.scrollableContentContainer}>
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sectionContainer}>
                  {goals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.referralOption,
                        selectedGoals.includes(goal.id) && styles.selectedReferralOption
                      ]}
                      onPress={() => {
                        if (selectedGoals.includes(goal.id)) {
                          setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                        } else if (selectedGoals.length < 4) {
                          setSelectedGoals([...selectedGoals, goal.id]);
                        }
                      }}
                    >
                      <View style={styles.goalContent}>
                        <Ionicons name={goal.icon} size={20} color="#333" style={styles.goalIcon} />
                        <Text style={styles.goalText}>{goal.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        case 4:
          return (
            <View style={styles.scrollableContentContainer}>
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sectionContainer}>
                  {helpOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.referralOption,
                        selectedHelp.includes(option.value) && styles.selectedReferralOption
                      ]}
                      onPress={() => {
                        if (selectedHelp.includes(option.value)) {
                          setSelectedHelp(selectedHelp.filter(value => value !== option.value));
                        } else if (selectedHelp.length < 4) {
                          setSelectedHelp([...selectedHelp, option.value]);
                        }
                      }}
                    >
                      <Text style={styles.goalText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        case 5:
          return (
            <View style={[styles.hatchingContainer, { backgroundColor: '#F97216' }]}>
              <Text style={styles.hatchingTitle}>You're ready to hatch your first pet!</Text>
              <View style={styles.hatchingEggContainer}>
                <TouchableOpacity
                  onPress={handleContinue}
                >
                  <View style={styles.hatchingEgg}>
                    <Text style={styles.hatchingEggEmoji}>🥚</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.hatchingSubtitle}>Tap the egg to reveal the pet!</Text>
            </View>
          );
        case 6:
          return (
            <View style={styles.contentContainer}>
              <View style={styles.foxSpeechContainer}>
                <View style={styles.speechBubbleFox}>
                  <Text style={styles.speechTextFox}>Woah! Hello there</Text>
                </View>
              </View>
              <View style={styles.foxImageContainer}>
                <Image
                  source={require('../../assets/images/welcomeFox.png')}
                  style={styles.foxImage}
                  resizeMode="contain"
                />
              </View>
              <TextInput
                style={[styles.input, { borderColor: '#F97216CC', color: '#F97216CC' }, petNameError ? styles.inputError : null]}
                value={petName}
                onChangeText={handlePetNameChange}
                placeholder="Name your pet..."
                placeholderTextColor="#F97216CC"
              />
              {petNameError ? (
                <Text style={styles.errorText}>{petNameError}</Text>
              ) : null}
            </View>
          );
        case 7:
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.accountHeading}>You're almost ready!</Text>
              
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter your email</Text>
                  <TextInput
                    style={[styles.styledInput, emailError ? styles.inputError : null]}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Type here..."
                    placeholderTextColor="#FFA500"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Create a password</Text>
                  <Text style={styles.passwordSubtext}>Must be at least 12 characters</Text>
                  <TextInput
                    style={[styles.styledInput, passwordError ? styles.inputError : null]}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Type here..."
                    placeholderTextColor="#FFA500"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm your password</Text>
                  <TextInput
                    style={[styles.styledInput, confirmPasswordError ? styles.inputError : null]}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder="Type here..."
                    placeholderTextColor="#FFA500"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>

                <View style={styles.termsContainer}>
                  <TouchableOpacity 
                    style={styles.checkbox} 
                    onPress={() => setTermsAccepted(!termsAccepted)}
                  >
                    {termsAccepted && <Ionicons name="checkmark" size={16} color="#FF6B35" />}
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                    By registering your details, you agree with our{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        case 8:
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.accountHeading}>Finishing touches!</Text>
              
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Create a username</Text>
                  <Text style={styles.inputSubtext}>This username will be visible to other users</Text>
                  <TextInput
                    style={[styles.styledInput, usernameError ? styles.inputError : null]}
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="Type here..."
                    placeholderTextColor="#FFA500"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.hintText}>Username may only contain alphabet characters (A–Z)</Text>
                  {usernameError ? (
                    <Text style={styles.errorText}>{usernameError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter your age</Text>
                  <Text style={styles.inputSubtext}>This number helps us give you a better experience</Text>
                  <TextInput
                    style={[styles.styledInput, ageError ? styles.inputError : null]}
                    value={age}
                    onChangeText={handleAgeChange}
                    placeholder="Type here..."
                    placeholderTextColor="#FFA500"
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                    autoCorrect={false}
                  />
                  {ageError ? (
                    <Text style={styles.errorText}>{ageError}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    const renderButton = () => {
      const isDisabled = 
        (currentStep === 2 && selectedReferralSource.length === 0) ||
        (currentStep === 3 && selectedGoals.length === 0) ||
        (currentStep === 4 && selectedHelp.length === 0) ||
        (currentStep === 6 && !petName) ||
        (currentStep === 7 && (!email || !!emailError || !password || !!passwordError || !confirmPassword || !!confirmPasswordError || !termsAccepted)) ||
        (currentStep === 8 && (!username || !!usernameError || !age || !!ageError)) ||
        isLoading;

      return (
        <View style={styles.buttonContainer}>
          {currentStep === 8 ? (
            <TouchableOpacity
              style={[styles.gradientButton, isDisabled && styles.buttonDisabled]}
              onPress={handleFinish}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          ) : currentStep !== 5 ? (
            <TouchableOpacity
              style={[styles.button, isDisabled && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>
          ) : null}
          
          {currentStep === 8 && (
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>
                Already have an Account?{' '}
                <Text style={styles.signInLink} onPress={() => router.push('/login')}>
                  Sign In
                </Text>
              </Text>
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.stepContainer}>
        {renderContent()}
        {renderButton()}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, currentStep === 5 && { backgroundColor: '#F97216' }]}>
      {!fontsLoaded ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {currentStep !== 0 && currentStep !== 1 && currentStep !== 5 && (
            <ProgressBar progress={progress} onBack={() => {
              if (currentStep === 0) {
                router.push('/landing');
              } else {
                setCurrentStep(Math.max(0, currentStep - 1));
              }
            }} />
          )}
          {currentStep === 2 && (
            <>
              <View style={styles.headerContainer}>
                <Image 
                  source={require('@/src/assets/images/FiPet_Title_Orange.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.stepSubtitle}>How did you hear about FiPet?</Text>
              </View>
              <Text style={styles.selectionHint}>Select all that apply (up to 4)</Text>
            </>
          )}
          {currentStep === 3 && (
            <>
              <View style={styles.headerContainer}>
                <Image 
                  source={require('@/src/assets/images/FiPet_Title_Orange.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.stepSubtitle}>What are your financial goals?</Text>
              </View>
              <Text style={styles.selectionHint}>Select all that apply (up to 4)</Text>
            </>
          )}
          {currentStep === 4 && (
            <>
              <View style={styles.headerContainer}>
                <Image 
                  source={require('@/src/assets/images/FiPet_Title_Orange.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.stepSubtitle}>How do you want your pet to help you learn?</Text>
              </View>
              <Text style={styles.selectionHint}>Select one option</Text>
            </>
          )}
          {renderStep()}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 15,
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F97216',
  },
  spacer: {
    height: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 60,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginTop: 80,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  sectionContainer: {
    width: '100%',
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  referralOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#8F66FD',
    borderRadius: 20,
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  selectedReferralOption: {
    borderColor: '#8F66FD',
    backgroundColor: '#8F66FD1A',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    marginRight: 12,
  },
  goalText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  gradientButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    marginBottom: 20,
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
    backgroundColor: '#ccc',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  welcomeContent: {
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
  },
  loadingText: {
    fontSize: 18,
    color: '#F97216',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
  },
  fillerImage: {
    width: 220,
    height: 220,
  },
  welcomeHeader: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 50,
    width: '100%',
    paddingLeft: 20,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    fontFamily: 'Poppins_700Bold',
  },
  backButtonTop: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#8B5CF6',
    textAlign: 'left',
    marginTop: 5,
    paddingLeft: 5,
    fontFamily: 'Poppins_500Medium',
  },
  welcomeText: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'left',
    marginTop: 5,
    paddingLeft: 5,
    fontFamily: 'Poppins_400Regular',
  },
  trophySection: {
    position: 'absolute',
    top: 250,
    right: 90,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  trophyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    fontFamily: 'Poppins_400Regular',
  },
  questSection: {
    position: 'absolute',
    top: 320,
    right: 42,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  questText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    fontFamily: 'Poppins_400Regular',
  },
  bagSection: {
    position: 'absolute',
    top: 410,
    right: 60,
  },
  bagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bagIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  bagText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    fontFamily: 'Poppins_400Regular',
  },
  coinSection: {
    position: 'absolute',
    top: 500,
    right: 100,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  coinText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    fontFamily: 'Poppins_400Regular',
  },
  foxImageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  foxImage: {
    width: 180,
    height: 180,
    marginTop: 10,
  },
  accountHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Poppins_700Bold',
  },
  formSection: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 25,
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
    fontFamily: 'Poppins_400Regular',
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
  passwordSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    marginLeft: 4,
    fontFamily: 'Poppins_400Regular',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  termsLink: {
    color: '#FF6B35',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins_700Bold',
  },
  signInContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  signInLink: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins_700Bold',
  },
  inputSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 0,
    marginBottom: 15,
    marginLeft: 2,
    fontFamily: 'Poppins_400Regular',
  },
  hintText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    marginLeft: 4,
    fontFamily: 'Poppins_400Regular',
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 3,
    marginTop: 1,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 125,
    height: 125,
    marginBottom: -20,
    marginTop: -20,
  },
  stepSubtitle: {
    fontSize: 20,
    color: '#F97216',
    textAlign: 'left',
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: 'Poppins_500Medium',
  },
  selectionHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
    marginBottom: 0,
    fontWeight: '400',
    paddingHorizontal: 20,
    fontFamily: 'Poppins_400Regular',
  },
  hatchingTitle: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  hatchingEggContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  hatchingEgg: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hatchingEggEmoji: {
    fontSize: 80,
    fontFamily: 'Poppins_400Regular',
  },
  hatchingSubtitle: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins_400Regular',
  },
  hatchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  foxSpeechContainer: {
    alignItems: 'center',
    marginBottom: 2.5,
  },
  speechBubbleFox: {
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 0,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#F97216',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 2,
    position: 'relative',
  },
  speechTextFox: {
    fontSize: 18,
    color: '#F97216',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
  speechBubbleContainerStep1: {
    position: 'absolute',
    top: 100,
    right: 10,
    zIndex: 10,
  },
  foxImageContainerStep1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  scrollableContentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
}); 
