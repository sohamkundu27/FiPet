import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { validateUsername } from '@/src/functions/validation';

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

const eggs: Egg[] = [
  {
    id: 'classic',
    name: 'Classic Egg',
    color: '#FFB6C1',
    gradient: ['#FFE5E5', '#FFB6C1'],
  },
  {
    id: 'crystal',
    name: 'Crystal Egg',
    color: '#87CEEB',
    gradient: ['#E5F2FF', '#87CEEB'],
  },
  {
    id: 'galaxy',
    name: 'Galaxy Egg',
    color: '#DDA0DD',
    gradient: ['#F5E6F5', '#DDA0DD'],
  },
  {
    id: 'golden',
    name: 'Golden Egg',
    color: '#FFD700',
    gradient: ['#FFF8E1', '#FFD700'],
  },
  {
    id: 'emerald',
    name: 'Emerald Egg',
    color: '#50C878',
    gradient: ['#E8F5E9', '#50C878'],
  },
];

const goals: Goal[] = [
  { 
    id: 'save', 
    label: 'Save more money',
    icon: 'cash-outline'
  },
  { 
    id: 'budget', 
    label: 'Create better budgets',
    icon: 'calculator-outline'
  },
  { 
    id: 'credit', 
    label: 'Build my credit score',
    icon: 'trending-up-outline'
  },
  { 
    id: 'invest', 
    label: 'Learn about investing',
    icon: 'stats-chart-outline'
  },
];

const helpOptions: HelpOption[] = [
  { value: 'daily', label: 'Daily financial reminders' },
  { value: 'challenges', label: 'Financial challenges' },
  { value: 'tips', label: 'Money-saving tips' },
  { value: 'tracking', label: 'Expense tracking' },
];

// Add time options with icons
const timeOptions = [
  { id: '5', label: '5 mins / day', icon: 'time-outline' as const },
  { id: '10', label: '10 mins / day', icon: 'time-outline' as const },
  { id: '15', label: '15 mins / day', icon: 'time-outline' as const },
  { id: '20', label: '20 mins / day', icon: 'time-outline' as const },
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

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
  const [petName, setPetName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState('');
  const [dailyLearningTime, setDailyLearningTime] = useState('');
  const router = useRouter();

  const totalSteps = 7;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    let userValidation = validateUsername(text);
    if (text.length > 0 && userValidation) {
      setUsernameError(userValidation);
    } else {
      setUsernameError('');
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

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to home or next screen after onboarding
      router.replace('/home');
    }
  };

  const handleFinish = async () => {
    if (petName.trim() && selectedGoals.length > 0 && selectedHelp && selectedEgg) {
      const petData = {
        username: username.trim(),
        eggType: selectedEgg.id,
        petName: petName.trim(),
        goals: selectedGoals,
        petHelp: selectedHelp,
      };

      // TODO: Save pet data to Firebase
      console.log('Pet data:', petData);
      
      // Navigate to home screen
      router.replace('/(tabs)/home');
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
              <Mascot text="Welcome to FiPet! Let's get started!" />
            </View>
          );
        case 1:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="What should I call you?" />
              <TextInput
                style={[styles.input, usernameError ? styles.inputError : null]}
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="Enter your username"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
            </View>
          );
        case 2:
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
        case 3:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="What would you like to name your pet?" />
              <TextInput
                style={styles.input}
                value={petName}
                onChangeText={setPetName}
                placeholder="Enter pet name"
              />
            </View>
          );
        case 4:
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
        case 5:
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
        case 6:
          return (
            <View style={styles.contentContainer}>
              <Mascot text="How much time would you like to spend learning each day?" />
              <View style={styles.sectionContainer}>
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.goalOption,
                      dailyLearningTime === option.id && styles.selectedGoal
                    ]}
                    onPress={() => setDailyLearningTime(option.id)}
                  >
                    <View style={styles.goalContent}>
                      <Ionicons name={option.icon} size={24} color="#333" style={styles.goalIcon} />
                      <Text style={styles.goalText}>{option.label}</Text>
                    </View>
                    <View style={styles.checkbox}>
                      {dailyLearningTime === option.id && (
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
        (currentStep === 1 && (!username || !!usernameError)) ||
        (currentStep === 2 && !selectedEgg) ||
        (currentStep === 3 && !petName) ||
        (currentStep === 4 && selectedGoals.length === 0) ||
        (currentStep === 5 && !selectedHelp) ||
        (currentStep === 6 && !dailyLearningTime);

      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={currentStep === 6 ? handleFinish : handleContinue}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>
              {currentStep === 6 ? 'Finish' : 'Continue'}
            </Text>
          </TouchableOpacity>
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
      <ProgressBar progress={progress} onBack={() => setCurrentStep(Math.max(0, currentStep - 1))} />
      {renderStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#FFF5E6',
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
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    maxWidth: '80%',
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
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
  },
  welcomeContent: {
    justifyContent: 'center',
  },
}); 
