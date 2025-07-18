import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';
import { PracticeQuestion } from '@/src/types/quest';
import { useQuest } from '@/src/hooks/useQuest';
import QuestProgressBar from '@/src/components/QuestProgressBar';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function PracticeExplanationScreen() {
  const { questID, practiceID, originalQuestionID } = useLocalSearchParams<{
    questID?: string;
    practiceID?: string;
    originalQuestionID?: string;
  }>();
  const router = useRouter();

  if (originalQuestionID === undefined) {
    throw new Error("Original Question ID is undefined!");
  }
  
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [loading, setLoading] = useState(true);

  // Get quest context for progress bar
  const { getAllQuestions } = useQuest();
  const allQuestions = getAllQuestions();
  const originalQuestionIndex = originalQuestionID ? allQuestions.findIndex(q => q.id === originalQuestionID) : 0;

  useEffect(() => {
    const loadPracticeQuestion = async () => {
      if (!practiceID) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const question = await getPracticeQuestionById(practiceID);
        setPracticeQuestion(question);
        
        // For now, we'll assume the first option was selected (you might want to pass this as a parameter)
        if (question) {
          setSelectedOption({ id: 'option_0', text: question.options[0] });
        }
      } catch (error) {
        console.error('Error loading practice question:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPracticeQuestion();
  }, [practiceID]);

  const handleContinue = () => {
    // Navigate to the next question after the original question
    if (originalQuestionID) {
      // Find the original question and get the next question
      const originalQuestion = allQuestions.find(q => q.id === originalQuestionID);
      const originalIndex = allQuestions.findIndex(q => q.id === originalQuestionID);
      const nextQuestion = allQuestions[originalIndex + 1];
      
      if (nextQuestion) {
        // Go to the next question
        router.replace(`/quests/${questID}/questions/${nextQuestion.id}`);
      } else {
        // No next question, go to quest completion
        router.replace(`/quests/${questID}`);
      }
    } else {
      // Fallback to quest index if no original question ID
      router.replace(`/quests/${questID}`);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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

  // Find the selected option index
  const selectedOptionIndex = options.findIndex(opt => opt.id === selectedOption?.id);
  
  // Find correct answer indices
  const correctIndices = practiceQuestion.correctAnswers?.map(ca => Number(ca)) || [];

  const getOptionStyle = (index: number) => {
    if (correctIndices.includes(index)) {
      return styles.correctOption;
    } else if (index === selectedOptionIndex) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screenContainer}>
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
          <QuestProgressBar questions={allQuestions} questionID={originalQuestionID} />
        </View>
        {/* Scrollable content below */}
        <ScrollView contentContainerStyle={styles.container}>
          {/* Practice Question Title */}
          <Text style={styles.headerTitle}>Practice Question</Text>
          {/* Question Text */}
          <Text style={styles.questionText}>{practiceQuestion.prompt}</Text>

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
          {practiceQuestion.incorrectResponse && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{practiceQuestion.incorrectResponse}</Text>
            </View>
          )}

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    textAlign: 'center',
    marginBottom: 16,
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
    marginBottom: 32,
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
  backArrowContainer: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
});
