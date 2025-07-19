import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';
import { PracticeQuestion } from '@/src/types/quest';
import { useQuest } from '@/src/hooks/useQuest';
import IncorrectModal from '@/src/components/modals/incorrectModal';
import CorrectModal from '@/src/components/modals/correctModal';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function PracticeQuestionScreen() {
  const { questID, practiceID, originalQuestionID } = useLocalSearchParams<{
    questID?: string;
    practiceID?: string;
    originalQuestionID?: string;
  }>();
  const router = useRouter();
  
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);

  // Get quest context for progress bar
  const { getAllQuestions } = useQuest();
  const allQuestions = getAllQuestions();
  const originalQuestionIndex = originalQuestionID ? allQuestions.findIndex(q => q.id === originalQuestionID) : 0;

  // Debug logging
  console.log('Practice screen - practiceID:', practiceID);
  console.log('Practice screen - questID:', questID);
  console.log('Practice screen - originalQuestionID:', originalQuestionID);
  console.log('Practice screen - originalQuestionIndex:', originalQuestionIndex);

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
      setShowIncorrectModal(true);
    }
  };

  const handleContinue = () => {
    // Navigate back to the quest
    router.replace(`/quests/${questID}`);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading practice question...</Text>
        </View>
      </>
    );
  }

  if (!practiceQuestion) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Practice question not found</Text>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>BACK TO QUEST</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const options = practiceQuestion.options.map((option, index) => ({
    id: `option_${index}`,
    text: option
  }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screenContainer}>
        <View style={styles.container}>
        {/* Progress Bar Header */}
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Image
              source={require('@/src/assets/images/arrow.png')}
              style={styles.backArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={[styles.progressBarSteps, { flex: 1 }]}>
            {allQuestions.map((_, step) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  step === 0 ? styles.progressStepFirst : styles.progressStepSmall,
                  step <= originalQuestionIndex ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>
        </View>
        {/* Practice Question Title */}
        <Text style={styles.headerTitle}>Practice Question</Text>
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
        <CorrectModal
          isVisible={showCorrectModal}
          onClose={() => setShowCorrectModal(false)}
          onContinue={() => {
            setShowCorrectModal(false);
            handleContinue();
          }}
        />
        {showIncorrectModal && (
          <IncorrectModal
            isVisible={showIncorrectModal}
            onClose={() => setShowIncorrectModal(false)}
            onConfirm={() => {
              setShowIncorrectModal(false);
              router.push(`/quests/${questID}/practice/${practiceID}/explanation?originalQuestionID=${originalQuestionID}`);
            }}
            onCancel={() => setShowIncorrectModal(false)}
            title="Not Quite"
            text=""
          />
        )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 87,
    marginBottom: 32,
  },
  backArrowContainer: {
    padding: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
  progressBarSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressStep: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressStepFirst: {
    flex: 3,
    height: 10,
  },
  progressStepSmall: {
    flex: 1,
    height: 6,
  },
  progressStepActive: {
    backgroundColor: '#6C63FF',
  },
  progressStepInactive: {
    backgroundColor: '#ccc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
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