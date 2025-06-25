import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';
import { PracticeQuestion } from '@/src/types/quest';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function PracticeQuestionScreen() {
  const { questID, practiceID } = useLocalSearchParams<{
    questID?: string;
    practiceID?: string;
  }>();
  const router = useRouter();
  
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCorrectModal, setShowCorrectModal] = useState(false);

  // Debug logging
  console.log('Practice screen - practiceID:', practiceID);
  console.log('Practice screen - questID:', questID);

  useEffect(() => {
    const loadPracticeQuestion = async () => {
      if (!practiceID) {
        console.log('No practiceID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching practice question with ID:', practiceID);
        const question = await getPracticeQuestionById(practiceID);
        console.log('Practice question result:', question);
        setPracticeQuestion(question);
      } catch (error) {
        console.error('Error loading practice question:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPracticeQuestion();
  }, [practiceID]);

  useEffect(() => {
    if (showCorrectModal && checked && isCorrect) {
      const timer = setTimeout(() => {
        setShowCorrectModal(false);
        handleContinue();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCorrectModal, checked, isCorrect]);

  const handleOptionSelect = (option: QuestionOption) => {
    if (checked) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!practiceQuestion || !selectedOption || checked) return;

    // Find the selected option index
    const selectedOptionIndex = practiceQuestion.options.findIndex(opt => opt === selectedOption.text);
    
    // Check if the selected option is correct
    const correct = practiceQuestion.correctAnswers.some(correctAnswer => {
      const correctIndex = Number(correctAnswer);
      return correctIndex === selectedOptionIndex;
    });

    setIsCorrect(correct);
    setChecked(true);

    // If correct, show modal overlay
    if (correct) {
      setShowCorrectModal(true);
    } else {
      // If incorrect, navigate to incorrect screen
      router.push(`/quests/${questID}/practice/${practiceID}/incorrect`);
    }
  };

  const handleContinue = () => {
    // Navigate back to the quest
    router.replace(`/quests/${questID}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading practice question...</Text>
      </View>
    );
  }

  if (!practiceQuestion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Practice question not found</Text>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>BACK TO QUEST</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const options = practiceQuestion.options.map((option, index) => ({
    id: `option_${index}`,
    text: option
  }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice Question</Text>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{practiceQuestion.prompt}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = selectedOption?.id === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && !checked && styles.selectedOptionButton,
                  checked && styles.disabledOptionButton,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={checked}
              >
                <Text style={styles.optionText}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Check Answer Button */}
        {!checked && (
          <TouchableOpacity
            style={[
              styles.checkAnswerButton,
              !selectedOption ? styles.disabledCheckAnswerButton : null,
            ]}
            onPress={checkAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.checkAnswerText}>CHECK ANSWER</Text>
          </TouchableOpacity>
        )}

        {/* Correct Modal */}
        <Modal
          visible={showCorrectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCorrectModal(false)}
        >
          <View style={styles.correctModalOverlay}>
            <View style={styles.correctModalContent}>
              <Text style={styles.correctTitle}>🎉 Correct</Text>
              <View style={styles.foxContainer}>
                <Image
                  source={require('@/src/assets/images/happy-fox.png')}
                  style={styles.foxImage}
                  resizeMode="contain"
                />
                <Image
                  source={require('@/src/assets/images/green-Vector.png')}
                  style={styles.foxShadow}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionButton: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0f0ff',
  },
  disabledOptionButton: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  checkAnswerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  disabledCheckAnswerButton: {
    backgroundColor: '#ccc',
  },
  checkAnswerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  correctModalOverlay: {
    flex: 1,
    backgroundColor: '#7CF97C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctModalContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  correctTitle: {
    fontSize: 35,
    position: 'absolute',
    fontWeight: 'bold',
    color: '#fff',
    top: 137,
    alignItems: 'center',
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
    width: 267.01,
    height: 250,
  },
  foxImage: {
    width: 267.01,
    height: 250,
    marginBottom: 30,
    position: 'relative',
    zIndex: 2,
  },
  foxShadow: {
    width: 219,
    height: 25,
    position: 'absolute',
    bottom: -100,
    left: '50%',
    marginLeft: -109.5,
    zIndex: 1,
    opacity: 1,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
}); 