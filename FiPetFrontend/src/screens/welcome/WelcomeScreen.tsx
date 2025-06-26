import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Image, Alert, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { validateUsername } from '@/src/functions/validation';
import { db } from '../../config/firebase';
import { doc, setDoc } from '@firebase/firestore';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { useAuth } from '@/src/hooks/useAuth';
import { useFonts } from 'expo-font';

interface Egg {
  id: string;
  name: string;
  color: string;
  gradient: string[];
}

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
    label: 'Save more money',
    icon: 'cash-outline'
  },
  { 
    id: '1',
    label: 'Create better budgets',
    icon: 'calculator-outline'
  },
  { 
    id: '2',
    label: 'Build my credit score',
    icon: 'trending-up-outline'
  },
  { 
    id: '3',
    label: 'Learn about investing',
    icon: 'stats-chart-outline'
  },
  { 
    id: '4',
    label: 'Pay off debt',
    icon: 'card-outline'
  },
];

const helpOptions: HelpOption[] = [
  { value: '0', label: 'Daily financial reminders' },
  { value: '1', label: 'Financial challenges' },
  { value: '2', label: 'Money-saving tips' },
  { value: '3', label: 'Expense tracking' },
  { value: '4', label: 'Financial education' },
];

// Add time options with icons
const timeOptions = [
  { id: '0', label: '5 mins / day', icon: 'time-outline' as const },
  { id: '1', label: '10 mins / day', icon: 'time-outline' as const },
  { id: '2', label: '15 mins / day', icon: 'time-outline' as const },
  { id: '3', label: '20 mins / day', icon: 'time-outline' as const },
];

// Add referral source options
const referralSources: ReferralSource[] = [
  { id: '0', label: 'Social Media (Instagram, TikTok, etc.)', icon: 'share-social-outline' },
  { id: '1', label: 'Friend or Family Recommendation', icon: 'people-outline' },
  { id: '2', label: 'App Store Search', icon: 'search-outline' },
  { id: '3', label: 'Online Advertisement', icon: 'megaphone-outline' },
  { id: '4', label: 'Financial Blog or Website', icon: 'globe-outline' },
  { id: '5', label: 'School or University', icon: 'school-outline' },
  { id: '6', label: 'Work or Employer', icon: 'business-outline' },
];

// Placeholder mascot component
const Mascot = ({ text }: { text: string }) => (
  <View style={styles.mascotContainer}>
    <View style={styles.speechBubble}>
      <Text style={styles.speechText}>{text}</Text>
    </View>
    <Text style={styles.mascotText}>🐾</Text>
  </View>
);

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
    <Text style={[styles.loadingText, { fontFamily: 'Poppins' }]}>Setting up your financial journey...</Text>
    <View style={styles.loadingAnimation}>
      <Text style={styles.loadingEmoji}>🐾</Text>
    </View>
  </View>
);

export default function WelcomeScreen() {
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
  const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
  const [petName, setPetName] = useState('');
  const [petNameError, setPetNameError] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState('');
  const [dailyLearningTime, setDailyLearningTime] = useState('');
  const [selectedReferralSource, setSelectedReferralSource] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const _auth = useAuth();
  const auth = _auth.authState;
  const user = _auth.userState;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loaded] = useFonts({
    Poppins: require('@/src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('@/src/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('@/src/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
  });

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

  const handleEggSelect = (egg: Egg) => {
    setSelectedEgg(egg);
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
    if (petName.trim() && selectedGoals.length > 0 && selectedHelp !== undefined) {
      
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

        const petData = {
          username: username.trim(),
          egg_type: 0, // Default egg type
          pet_name: petName.trim(),
          financial_goals: selectedGoals.map(goal => Number(goal)),
          financial_journey_help: Number(selectedHelp),
          learning_time: Number(dailyLearningTime),
          referral_source: Number(selectedReferralSource[0]),
          current_level: 0,
          current_xp: 0
        };

        console.log('Saving data to Firestore:', petData);

        // Save user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), petData);
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
        hasHelp: selectedHelp !== undefined
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
            <View style={styles.contentContainer}>
              <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 40 }}>
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
            <View style={styles.contentContainer}>
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
            </View>
          );
        case 4:
          return (
            <View style={styles.contentContainer}>
              <View style={styles.sectionContainer}>
                {helpOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.referralOption,
                      selectedHelp === option.value && styles.selectedReferralOption
                    ]}
                    onPress={() => setSelectedHelp(option.value)}
                  >
                    <Text style={styles.goalText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                style={[styles.input, { borderColor: '#F97216CC', color: '#F97216CC' }]}
                value={petName}
                onChangeText={handlePetNameChange}
                placeholder="Name your pet..."
                placeholderTextColor="#F97216CC"
              />
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
        (currentStep === 4 && !selectedHelp) ||
        (currentStep === 5 && !selectedEgg) ||
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

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontFamily: 'Poppins' }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, currentStep === 5 && { backgroundColor: '#F97216' }]}>
      {isLoading ? (
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
                <Text style={styles.mainTitle}>FiPet</Text>
                <Text style={styles.subtitle}>How did you hear about FiPet?</Text>
              </View>
              <Text style={styles.selectionHint}>Select all that apply (up to 4)</Text>
            </>
          )}
          {currentStep === 3 && (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>FiPet</Text>
                <Text style={styles.subtitle}>What are your financial goals?</Text>
              </View>
              <Text style={styles.selectionHint}>Select all that apply (up to 4)</Text>
            </>
          )}
          {currentStep === 4 && (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>FiPet</Text>
                <Text style={styles.subtitle}>How do you want your pet to help you learn?</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  speechBubbleContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
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
    fontFamily: 'Poppins',
  },
  mascotText: {
    fontSize: 80,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  eggCarouselContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  eggCarousel: {
    width: '100%',
  },
  eggCarouselContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  eggOption: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEgg: {
    borderColor: '#FFA500',
  },
  eggShape: {
    width: 80,
    height: 100,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  eggHighlight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  eggContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  eggInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggEmoji: {
    fontSize: 42,
  },
  eggName: {
    fontSize: 10,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  sectionContainer: {
    width: '100%',
    marginTop: 0,
  },
  firstSection: {
    marginTop: 15,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 5,
    fontFamily: 'Poppins-Bold',
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
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
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
    fontFamily: 'Poppins',
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
  selectedGoal: {
    backgroundColor: '#FFE5E5',
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
  gradientButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonDisabledText: {
    color: '#666',
  },
  petContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petBody: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
  },
  petEar: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'inherit',
    borderRadius: 15,
    top: -10,
    left: 10,
    transform: [{ rotate: '-30deg' }],
  },
  petEarRight: {
    left: 80,
    transform: [{ rotate: '30deg' }],
  },
  petFace: {
    position: 'absolute',
    top: 40,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  petEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginRight: 20,
  },
  petEyeRight: {
    marginRight: 0,
  },
  petNose: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginLeft: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  welcomeContent: {
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Poppins',
    textAlign: 'center',
    alignSelf: 'center',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
  },
  fillerImageContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250
  },
  fillerImage: {
    width: 220,
    height: 220,
  },
  scrollView: {
    width: '100%',
    maxHeight: 400,
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
    fontFamily: 'Poppins-Bold',
  },
  welcomeIcon: {
    fontSize: 60,
    marginTop: 15,
  },
  welcomeDescription: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'left',
    marginTop: 10,
    paddingLeft: 5,
    lineHeight: 28,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(255, 107, 53, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'Poppins-Bold',
  },
  iconContainer: {
    backgroundColor: '#FFF5E6',
    borderRadius: 50,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F7FAFC',
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
    fontFamily: 'Poppins',
  },
  welcomeText: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'left',
    marginTop: 5,
    paddingLeft: 5,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins-Bold',
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
  passwordSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    marginLeft: 4,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
  termsLink: {
    color: '#FF6B35',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins',
  },
  signInLink: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Bold',
  },
  inputSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 0,
    marginBottom: 15,
    marginLeft: 2,
    fontFamily: 'Poppins',
  },
  hintText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F97216',
    textAlign: 'left',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#F97216',
    textAlign: 'left',
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  selectionHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
    marginBottom: 0,
    fontWeight: '400',
    paddingHorizontal: 20,
    fontFamily: 'Poppins',
  },
  hatchingTitle: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
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
  },
  hatchingSubtitle: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
}); 
