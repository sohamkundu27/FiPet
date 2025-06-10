import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function WelcomeScreen() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
  const [petName, setPetName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState('');
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [showHelpOptions, setShowHelpOptions] = useState(false);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (text.length > 0 && (text.length < 3 || text.length > 20)) {
      setUsernameError('Username must be between 3-20 characters');
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
    if (username.trim().length >= 3 && username.trim().length <= 20 && selectedEgg) {
      setCurrentScreen('pet');
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

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'welcome' ? (
        // Welcome Screen
        <View style={styles.screen}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="paw" size={24} color="#FFA500" />
            </View>
            <Text style={styles.logoText}>FiPet</Text>
          </View>

          {/* Welcome Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Welcome! Let's get started.</Text>
            
            <View style={[styles.inputContainer, styles.inputContainerSpacing]}>
              <Text style={styles.inputLabel}>Enter your username</Text>
              <TextInput
                style={[styles.input, usernameError ? styles.inputError : null]}
                placeholder="Your username"
                value={username}
                onChangeText={handleUsernameChange}
                maxLength={20}
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
            </View>

            <Text style={[styles.subtitle, styles.eggSubtitle]}>Pick your perfect egg companion!</Text>

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
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Continue Button and Helper Text */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!username.trim() || usernameError !== '' || !selectedEgg) && styles.buttonDisabled
              ]}
              onPress={handleContinue}
              disabled={!username.trim() || usernameError !== '' || !selectedEgg}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
            <Text style={styles.helperText}>Select an egg to continue your journey</Text>
          </View>
        </View>
      ) : (
        // Pet Customization Screen
        <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="paw" size={24} color="#FFA500" />
            </View>
            <Text style={styles.logoText}>FiPet</Text>
          </View>

          {/* Pet Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Meet your new friend!</Text>

            {selectedEgg && renderPet(selectedEgg)}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name your pet</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter pet name"
                value={petName}
                onChangeText={setPetName}
              />
            </View>

            <View style={[styles.sectionContainer, styles.firstSection]}>
              <Text style={styles.inputLabel}>Choose your financial learning goals</Text>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalOption}
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

            <View style={styles.sectionContainer}>
              <Text style={styles.inputLabel}>My pet wants to help me...</Text>
              <TouchableOpacity
                style={styles.helpSelect}
                onPress={() => setShowHelpOptions(!showHelpOptions)}
              >
                <Text style={styles.helpText}>
                  {selectedHelp ? helpOptions.find(opt => opt.value === selectedHelp)?.label : 'Select an option'}
                </Text>
                <Ionicons 
                  name={showHelpOptions ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#333" 
                />
              </TouchableOpacity>
              {showHelpOptions && (
                <View style={styles.helpOptionsContainer}>
                  {helpOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.helpOption,
                        selectedHelp === option.value && styles.selectedHelp
                      ]}
                      onPress={() => {
                        setSelectedHelp(option.value);
                        setShowHelpOptions(false);
                      }}
                    >
                      <Text style={styles.helpText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Finish Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!petName.trim() || selectedGoals.length === 0 || !selectedHelp) && styles.buttonDisabled
              ]}
              onPress={handleFinish}
              disabled={!petName.trim() || selectedGoals.length === 0 || !selectedHelp}
            >
              <Text style={styles.buttonText}>Finish</Text>
              <Ionicons name="checkmark" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputContainerSpacing: {
    marginTop: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
  helpSelect: {
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
  helpOptionsContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: -10,
  },
  helpOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedHelp: {
    backgroundColor: '#FFF5E6',
  },
  helpText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    marginBottom: 15,
    height: 60,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
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
  bottomContainer: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  eggSubtitle: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 25,
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
  sectionContainer: {
    width: '100%',
    marginTop: 15,
  },
  firstSection: {
    marginTop: 15,
  },
}); 