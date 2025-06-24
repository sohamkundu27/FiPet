import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Image, Alert, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { validateUsername } from '@/src/functions/validation';
import { db } from '../../config/firebase';
import { doc, setDoc } from '@firebase/firestore';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { useAuth } from '@/src/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

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

const eggs: Egg[] = [
  {
    id: '1',
    name: 'Classic Egg',
    color: '#FFB6C1',
    gradient: ['#FFE5E5', '#FFB6C1'],
  },
  {
    id: '2',
    name: 'Crystal Egg',
    color: '#87CEEB',
    gradient: ['#E5F2FF', '#87CEEB'],
  },
  {
    id: '3',
    name: 'Galaxy Egg',
    color: '#DDA0DD',
    gradient: ['#F5E6F5', '#DDA0DD'],
  },
  {
    id: '4',
    name: 'Golden Egg',
    color: '#FFD700',
    gradient: ['#FFF8E1', '#FFD700'],
  },
  {
    id: '5',
    name: 'Emerald Egg',
    color: '#50C878',
    gradient: ['#E8F5E9', '#50C878'],
  },
];

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
];

const helpOptions: HelpOption[] = [
  { value: '0', label: 'Daily financial reminders' },
  { value: '1', label: 'Financial challenges' },
  { value: '2', label: 'Money-saving tips' },
  { value: '3', label: 'Expense tracking' },
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
  { id: '7', label: 'Other', icon: 'ellipsis-horizontal-outline' },
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
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  </View>
);

// LoadingScreen component outside of main component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Setting up your financial journey...</Text>
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
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState('');
  const [dailyLearningTime, setDailyLearningTime] = useState('');
  const [selectedReferralSource, setSelectedReferralSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const _auth = useAuth();
  const auth = _auth.authState;
  const user = _auth.userState;
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
    if (currentStep === 2) {
      // Validate account creation fields
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

      if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !termsAccepted) {
        return;
      }

      // Create account
      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Account created successfully:', userCredential.user.uid);
        setIsLoading(false);
        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        setIsLoading(false);
        handleSignUpError(error);
        return;
      }
    } else if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to home or next screen after onboarding
      router.replace('/home');
    }
  };

  const handleFinish = async () => {
    if (petName.trim() && selectedGoals.length > 0 && selectedHelp !== undefined && selectedEgg) {
      
      if (!user) {
        console.error('No user logged in');
        return;
      }

      setIsLoading(true);

      console.log('Current user:', user.uid);

      const petData = {
        username: username.trim(),
        egg_type: Number(selectedEgg.id),
        pet_name: petName.trim(),
        financial_goals: selectedGoals.map(goal => Number(goal)),
        financial_journey_help: Number(selectedHelp),
        learning_time: Number(dailyLearningTime),
        referral_source: Number(selectedReferralSource),
        current_level: 0,
        current_xp: 0
      };

      console.log('Saving data to Firestore:', petData);

      try {
        await setDoc(doc(db, 'users', user.uid), petData);
        console.log('User data saved successfully to Firestore');
        
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Error saving user data:', error);
        setIsLoading(false);
      }
    } else {
      console.log('Validation failed:', {
        hasPetName: !!petName.trim(),
        hasGoals: selectedGoals.length > 0,
        hasHelp: selectedHelp !== undefined,
        hasEgg: !!selectedEgg
      });
    }
  };

  const renderEgg = (egg: Egg) => (
    <View style={[styles.eggShape, { backgroundColor: egg.color }]}>
      <View style={styles.eggHighlight} />
    </View>
  );

  const renderPet = (egg: Egg) => (
    <View style={styles.petContainer}>
      <View style={[styles.petBody, { backgroundColor: egg.color }]}>
        <View style={styles.petEar} />
        <View style={[styles.petEar, styles.petEarRight]} />
        <View style={styles.petFace}>
          <View style={styles.petEye} />
          <View style={[styles.petEye, styles.petEyeRight]} />
          <View style={styles.petNose} />
        </View>
      </View>
    </View>
  );

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
              <View style={styles.speechBubbleContainer}>
                <View style={styles.speechBubble}>
                  <Text style={styles.speechText}>Just a few quick questions</Text>
                </View>
              </View>
              <View style={styles.foxImageContainer}>
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
                  <Text style={styles.passwordSubtext}>Your password must contain at least 12 characters</Text>
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.styledInput, confirmPasswordError ? styles.inputError : null]}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder="Confirm your password"
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
                    {termsAccepted && (
                      <Ionicons name="checkmark" size={16} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                    By registering your details, you agree with our{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        case 3:
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
        case 4:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="How did you hear about FiPet?" />
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionContainer}>
                  {referralSources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.goalOption,
                        selectedReferralSource === source.id && styles.selectedGoal
                      ]}
                      onPress={() => setSelectedReferralSource(source.id)}
                    >
                      <View style={styles.goalContent}>
                        <Ionicons name={source.icon} size={24} color="#333" style={styles.goalIcon} />
                        <Text style={styles.goalText}>{source.label}</Text>
                      </View>
                      <View style={styles.checkbox}>
                        {selectedReferralSource === source.id && (
                          <Ionicons name="checkmark" size={20} color="#FFA500" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        case 5:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="Choose your pet egg! Each one is special!" />
              <View style={styles.eggCarouselContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.eggCarousel}
                  contentContainerStyle={styles.eggCarouselContent}
                >
                  {eggs.map((egg) => (
                    <TouchableOpacity
                      key={egg.id}
                      style={[
                        styles.eggOption,
                        selectedEgg?.id === egg.id && styles.selectedEgg
                      ]}
                      onPress={() => handleEggSelect(egg)}
                    >
                      <View style={[styles.eggContainer, { borderColor: egg.color }]}>
                        <View style={[styles.eggInner, { backgroundColor: egg.gradient[0], borderColor: egg.color }]}>
                          <Text style={styles.eggEmoji}>🥚</Text>
                          <Text style={styles.eggName} numberOfLines={1} ellipsizeMode="tail">{egg.name}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          );
        case 6:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="What would you like to name your pet?" />
              <TextInput
                style={styles.input}
                value={petName}
                onChangeText={setPetName}
                placeholder="Enter pet name"
                placeholderTextColor="#FFA500"
              />
            </View>
          );
        case 7:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="What financial goals would you like to achieve?" />
              <View style={[styles.sectionContainer, styles.firstSection]}>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      selectedGoals.includes(goal.id) && styles.selectedGoal
                    ]}
                    onPress={() => handleGoalToggle(goal.id)}
                  >
                    <View style={styles.goalContent}>
                      <Ionicons name={goal.icon} size={24} color="#333" style={styles.goalIcon} />
                      <Text style={styles.goalText}>{goal.label}</Text>
                    </View>
                    <View style={styles.checkbox}>
                      {selectedGoals.includes(goal.id) && (
                        <Ionicons name="checkmark" size={20} color="#FFA500" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        case 8:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="How can I help you on your financial journey?" />
              <View style={styles.sectionContainer}>
                {helpOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.goalOption,
                      selectedHelp === option.value && styles.selectedGoal
                    ]}
                    onPress={() => setSelectedHelp(option.value)}
                  >
                    <Text style={styles.goalText}>{option.label}</Text>
                    <View style={styles.checkbox}>
                      {selectedHelp === option.value && (
                        <Ionicons name="checkmark" size={20} color="#FFA500" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    const renderButton = () => {
      const isDisabled = 
        (currentStep === 2 && (!email || !!emailError || !password || !!passwordError || !confirmPassword || !!confirmPasswordError || !termsAccepted)) ||
        (currentStep === 3 && (!username || !!usernameError || !age || !!ageError)) ||
        (currentStep === 4 && !selectedReferralSource) ||
        (currentStep === 5 && !selectedEgg) ||
        (currentStep === 6 && !petName) ||
        (currentStep === 7 && selectedGoals.length === 0) ||
        (currentStep === 8 && !selectedHelp) ||
        isLoading;

      return (
        <View style={styles.buttonContainer}>
          {currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 3 ? (
            <TouchableOpacity
              style={[styles.gradientButton, isDisabled && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isDisabled}
            >
              <LinearGradient
                colors={['#FF6B35', '#FFB74D']}
                style={styles.gradientButtonInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Creating Account...' : currentStep === 2 ? 'Create Account' : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, isDisabled && styles.buttonDisabled]}
              onPress={currentStep === 8 ? handleFinish : handleContinue}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : currentStep === 8 ? 'Finish' : 'Continue'}
              </Text>
            </TouchableOpacity>
          )}
          
          {currentStep === 2 && (
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
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {currentStep !== 0 && currentStep !== 1 && (
            <ProgressBar progress={progress} onBack={() => {
              if (currentStep === 0) {
                router.push('/landing');
              } else {
                setCurrentStep(Math.max(0, currentStep - 1));
              }
            }} />
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
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFA500',
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
    fontWeight: '500',
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
    marginTop: 15,
  },
  firstSection: {
    marginTop: 15,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 5,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
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
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
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
    paddingBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
    fontWeight: 600,
    color: '#000000',
    textAlign: 'left',
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
  },
  welcomeText: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'left',
    marginTop: 5,
    paddingLeft: 5,
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
  },
  foxImageContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250
  },
  accountHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
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
  },
  termsLink: {
    color: '#FF6B35',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
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
  },
  signInLink: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inputSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 0,
    marginBottom: 15,
    marginLeft: 2,
  },
  hintText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    marginLeft: 4,
  },
}); 
