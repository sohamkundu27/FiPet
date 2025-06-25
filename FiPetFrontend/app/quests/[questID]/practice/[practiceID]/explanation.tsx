import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';
import { PracticeQuestion } from '@/src/types/quest';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function PracticeExplanationScreen() {
  const { questID, practiceID } = useLocalSearchParams<{
    questID?: string;
    practiceID?: string;
  }>();
  const router = useRouter();
  
  const [practiceQuestion, setPracticeQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [loading, setLoading] = useState(true);

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
    // Navigate back to the original question that had the practiceId
    // We need to find which question had this practiceId
    router.replace(`/quests/${questID}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice Question</Text>
        </View>

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
}); 