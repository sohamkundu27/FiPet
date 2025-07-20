import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuest } from '@/src/hooks/useQuest';
import { Stack } from 'expo-router';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';
import { PracticeQuestion } from '@/src/types/quest';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function ExplanationScreen() {
  const { questID, questionID, practiceID, originalQuestionID } = useLocalSearchParams<{
    questID?: string;
    questionID?: string;
    practiceID?: string;
    originalQuestionID?: string;
  }>();
  const router = useRouter();
  const { getQuestion, getAnswer, getOptions, getAllQuestions } = useQuest();

  // State for practice questions
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Detect if this is a practice explanation
  const isPractice = !!practiceID;

  // Load practice question if needed
  useEffect(() => {
    if (isPractice && practiceID) {
      setLoading(true);
      getPracticeQuestionById(practiceID)
        .then(q => {
          setPracticeQuestion(q);
          // For now, assume the first option was selected (you might want to pass this as a parameter)
          if (q) {
            setSelectedOption({ id: 'option_0', text: q.options[0] });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isPractice, practiceID]);

  // Get question data based on type
  let question: any = null;
  let answer: any = null;
  let options: QuestionOption[] = [];
  let allQuestions: any[] = [];
  let currentIndex = 0;

  if (isPractice) {
    question = practiceQuestion;
    allQuestions = getAllQuestions();
    currentIndex = originalQuestionID ? allQuestions.findIndex(q => q.id === originalQuestionID) : 0;
    options = practiceQuestion ? practiceQuestion.options.map((option: string, index: number) => ({ id: `option_${index}`, text: option })) : [];
  } else {
    if (!questionID) {
      return null;
    }
    question = getQuestion(questionID);
    answer = getAnswer(question);
    options = getOptions(question);
    allQuestions = getAllQuestions();
    currentIndex = allQuestions.findIndex((q) => q.id === questionID);
  }

  // Find the selected option index
  const selectedOptionIndex = isPractice 
    ? options.findIndex(opt => opt.id === selectedOption?.id)
    : options.findIndex(opt => opt.id === answer?.option.id);
  
  // Find correct answer indices
  const correctIndices = question?.correctAnswers?.map((ca: string) => Number(ca)) || [];

  // Navigation handlers
  const handleContinue = () => {
    if (isPractice) {
      // For practice, navigate to the next question after the original question
      if (originalQuestionID) {
        const originalIndex = allQuestions.findIndex(q => q.id === originalQuestionID);
        const nextQuestion = allQuestions[originalIndex + 1];
        
        if (nextQuestion) {
          router.replace(`/quests/${questID}/questions/${nextQuestion.id}`);
        } else {
          router.replace(`/quests/${questID}`);
        }
      } else {
        router.replace(`/quests/${questID}`);
      }
    } else {
      // For quest questions, check if there's a practice question available
      if (question.practiceId) {
        router.push(`/quests/${questID}/practice/${question.practiceId}?originalQuestionID=${questionID}`);
      } else {
        if (answer.nextQuestion === null) {
          router.replace(`/quests/${questID}`);
        } else {
          router.replace(`/quests/${questID}/questions/${answer.nextQuestion.id}`);
        }
      }
    }
  };

  const getOptionStyle = (index: number) => {
    if (correctIndices.includes(index)) {
      return styles.correctOption;
    } else if (index === selectedOptionIndex) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  const buttonText = isPractice ? 'CONTINUE' : (question?.practiceId ? 'PRACTICE MORE' : 'CONTINUE');

  // Loading state
  if (loading || (isPractice && !practiceQuestion)) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading explanation...</Text>
        </View>
      </>
    );
  }

  // Error state
  if (!question) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Question not found</Text>
          <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
            <Text style={styles.continueButtonText}>BACK TO QUEST</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Fixed progress bar and back arrow at the top */}
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 87, paddingHorizontal: 16, marginBottom: 16 }}>
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
                  step <= currentIndex ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>
        </View>
        {/* Scrollable content below */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Number/Title */}
          {isPractice ? (
            <Text style={styles.questionNumber}>Practice Question {currentIndex + 1}</Text>
          ) : (
            <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>
          )}

          {/* Question Text */}
          <Text style={styles.questionText}>{question.prompt}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <View
                key={option.id}
                style={[
                  styles.optionButton,
                  getOptionStyle(index),
                ]}
              >
                <Text style={[
                  styles.optionText,
                  correctIndices.includes(index) && styles.correctOptionText,
                  index === selectedOptionIndex && !correctIndices.includes(index) && styles.incorrectOptionText,
                ]}>
                  {option.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Explanation */}
          {question.incorrectResponse && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{question.incorrectResponse}</Text>
            </View>
          )}

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
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
    backgroundColor: '#eee',
  },
  backArrowContainer: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
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
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
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